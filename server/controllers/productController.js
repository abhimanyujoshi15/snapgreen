const axios = require('axios');
const Product = require('../models/Product');
const Scan = require('../models/Scan');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { scoreProduct } = require('../services/geminiScoring');
const { checkBadges } = require('../services/badgeService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Barcode ────────────────────────────────────────────────
// @route GET /api/product/barcode/:barcode
const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    // 1. Check cache
    const cached = await Product.findOne({ barcode });
    if (cached) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (cached.lastUpdated > sevenDaysAgo && cached.impactSummary) {
        await saveScan(req.user._id, cached._id, 'barcode', cached.ecoScore);
        return res.json({ product: cached, source: 'cache' });
      }
    }

    // 2. Fetch from Open Food Facts
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const data = response.data;
    if (data.status === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const p = data.product;

    const rawProduct = {
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: p.brands || 'Unknown Brand',
      category: p.categories_tags?.[0]?.replace('en:', '') || 'General',
      imageUrl: p.image_url || '',
      ecoScore: p.ecoscore_grade?.toUpperCase() || null,
      packagingScore: p.ecoscore_data?.adjustments?.packaging?.value
        ? Math.min(100, 50 + p.ecoscore_data.adjustments.packaging.value)
        : null,
      sourcingScore: p.ecoscore_data?.adjustments?.origins_of_ingredients?.value
        ? Math.min(100, 50 + p.ecoscore_data.adjustments.origins_of_ingredients.value)
        : null,
    };

    // 3. Score with Gemini AI
    console.log('Scoring with Gemini AI...');
    const aiScores = await scoreProduct(rawProduct);

    // 4. Save to MongoDB
    const product = await Product.findOneAndUpdate(
      { barcode },
      {
        barcode,
        ...rawProduct,
        ...aiScores,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // 5. Save scan record
    await saveScan(req.user._id, product._id, 'barcode', product.ecoScore);

    res.json({ product, source: 'api' });

  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Photo ───────────────────────────────────────────────────
// @route POST /api/product/photo
const getProductByPhoto = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Step 1: Identify product from image
    const identifyPrompt = `
      Look at this product image carefully.
      Return ONLY a JSON object with these fields, no extra text:
      {
        "name": "full product name",
        "brand": "brand name",
        "category": "product category (e.g. snack, beverage, dairy)",
        "confidence": "high/medium/low"
      }
    `;

    const identifyResult = await model.generateContent([
      identifyPrompt,
      { inlineData: { data: imageBase64, mimeType } }
    ]);

    const identifyText = identifyResult.response.text();
    let productInfo;

    try {
      const clean = identifyText.replace(/```json|```/g, '').trim();
      productInfo = JSON.parse(clean);
    } catch (e) {
      return res.status(422).json({ message: 'Could not identify product from image' });
    }

    // Step 2: Check cache
    const existing = await Product.findOne({
      name: { $regex: productInfo.name, $options: 'i' }
    });

    if (existing && existing.impactSummary) {
      await saveScan(req.user._id, existing._id, 'photo', existing.ecoScore);
      return res.json({ product: existing, source: 'cache', identified: productInfo });
    }

    // Step 3: Score with Gemini AI
    console.log('Scoring with Gemini AI...');
    const aiScores = await scoreProduct(productInfo);

    // Step 4: Save to MongoDB
    const product = await Product.create({
      name: productInfo.name,
      brand: productInfo.brand,
      category: productInfo.category,
      imageUrl: '',
      ...aiScores,
      lastUpdated: new Date()
    });

    // Step 5: Save scan record
    await saveScan(req.user._id, product._id, 'photo', product.ecoScore);

    res.json({ product, source: 'photo', identified: productInfo });

  } catch (err) {
    console.error('Photo scan error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Helper: Save Scan Record ────────────────────────────────
const saveScan = async (userId, productId, method, ecoScore) => {
  try {
    // Save scan record
    await Scan.create({
      userId,
      productId,
      scanMethod: method,
      ecoScoreAtScan: ecoScore
    });

    // Get all scans for stats
    const allScans = await Scan.find({ userId });
    const user = await User.findById(userId);

    const totalScans = allScans.length;
    const goodScans = allScans.filter(s => ['A', 'B'].includes(s.ecoScoreAtScan)).length;
    const photoScans = allScans.filter(s => s.scanMethod === 'photo').length;
    const fScans = allScans.filter(s => s.ecoScoreAtScan === 'F').length;
    const greenPercent = totalScans > 0
      ? Math.round((goodScans / totalScans) * 100) : 0;

    // Update streak
    const today = new Date().toDateString();
    const lastScan = user.lastScanDate
      ? new Date(user.lastScanDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = user.streakCount;
    if (lastScan === today) {
      // Already scanned today, streak unchanged
    } else if (lastScan === yesterday) {
      // Scanned yesterday, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    // Update green score (simple formula)
    const newGreenScore = Math.round(
      (goodScans * 10) + (newStreak * 5) + (totalScans * 2)
    );

    // Check for new badges
    const stats = {
      totalScans, goodScans, photoScans,
      fScans, greenPercent, streakCount: newStreak
    };
    const newBadges = checkBadges(user.badges, stats);

    // Update user
    await User.findByIdAndUpdate(userId, {
      streakCount: newStreak,
      lastScanDate: new Date(),
      greenScore: newGreenScore,
      $push: { badges: { $each: newBadges } }
    });

    if (newBadges.length > 0) {
      console.log(`🏆 New badges earned: ${newBadges.join(', ')}`);
    }

  } catch (err) {
    console.error('Scan save error:', err);
  }
};

module.exports = { getProductByBarcode, getProductByPhoto };