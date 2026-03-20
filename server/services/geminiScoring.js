const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scoreProduct = async (productData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are a sustainability expert specializing in Indian markets. Analyze this product 
    and return a comprehensive eco assessment with detailed information.

    Product Details:
    - Name: ${productData.name}
    - Brand: ${productData.brand}
    - Category: ${productData.category}
    - Existing Eco Grade (if any): ${productData.ecoScore || 'Unknown'}
    - Packaging Score (if any): ${productData.packagingScore || 'Unknown'}
    - Sourcing Score (if any): ${productData.sourcingScore || 'Unknown'}

    Return ONLY a valid JSON object with exactly this structure, no extra text:
    {
      "ecoScore": "A/B/C/D/E/F",
      "overallScore": <number 0-100>,
      "packagingScore": <number 0-100>,
      "sourcingScore": <number 0-100>,
      "carbonFootprint": "<e.g. 2.3kg CO2 per unit>",
      "impactSummary": "<3-4 sentence plain English explanation of environmental impact>",
      "packagingDetail": "<detailed sentence about packaging materials and recyclability>",
      "sourcingDetail": "<detailed sentence about ingredient sourcing and supply chain>",
      "manufacturingDetail": "<one sentence about manufacturing process impact>",
      "funFact": "<one surprising environmental fact about this type of product>",
      "tips": [
        "<practical tip to reduce impact when using this product>",
        "<another practical tip>"
      ],
      "alternatives": [
        {
          "name": "<exact product name>",
          "brand": "<Indian brand name>",
          "category": "<same category>",
          "ecoScore": "A/B/C",
          "overallScore": <number 0-100>,
          "reason": "<detailed reason why it is greener, 2 sentences>",
          "co2Saved": "<e.g. saves 1.2kg CO2 per unit>",
          "estimatedPrice": "<price range in INR e.g. ₹120-150 per 400g>",
          "whereToBuy": ["<store/platform 1>", "<store/platform 2>", "<store/platform 3>"],
          "keyBenefit": "<single most important green benefit>",
          "searchQuery": "<exact search query to find this on Google/Amazon>"
        },
        {
          "name": "<exact product name>",
          "brand": "<Indian brand name>",
          "category": "<same category>",
          "ecoScore": "A/B/C",
          "overallScore": <number 0-100>,
          "reason": "<detailed reason why it is greener, 2 sentences>",
          "co2Saved": "<e.g. saves 0.8kg CO2 per unit>",
          "estimatedPrice": "<price range in INR>",
          "whereToBuy": ["<store/platform 1>", "<store/platform 2>", "<store/platform 3>"],
          "keyBenefit": "<single most important green benefit>",
          "searchQuery": "<exact search query to find this on Google/Amazon>"
        },
        {
          "name": "<exact product name>",
          "brand": "<Indian brand name or homemade>",
          "category": "<same category>",
          "ecoScore": "A/B",
          "overallScore": <number 0-100>,
          "reason": "<detailed reason why it is greener, 2 sentences>",
          "co2Saved": "<e.g. saves 2.1kg CO2 per unit>",
          "estimatedPrice": "<price range in INR>",
          "whereToBuy": ["<store/platform 1>", "<store/platform 2>", "<store/platform 3>"],
          "keyBenefit": "<single most important green benefit>",
          "searchQuery": "<exact search query to find this on Google/Amazon>"
        }
      ]
    }

    Scoring guidelines:
    - A (80-100): Excellent sustainability, minimal environmental impact
    - B (60-79): Good sustainability practices
    - C (40-59): Average, room for improvement
    - D (20-39): Poor sustainability practices
    - E/F (0-19): Very harmful to environment

    IMPORTANT RULES FOR ALTERNATIVES:
    - All alternatives must be real Indian brands available in India
    - Include at least one Patanjali, Amul, or other well known Indian organic brand
    - Include one homemade/DIY traditional Indian alternative
    - whereToBuy must include real Indian platforms like BigBasket, Blinkit, Amazon India, 
      Flipkart, DMart, local kirana stores where applicable
    - estimatedPrice must be realistic INR prices for India
    - searchQuery must be the exact string someone would type on Google to find and buy it
    - Be specific with product names — not just "organic alternative" but the actual product name
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const clean = text.replace(/```json|```/g, '').trim();
  const scored = JSON.parse(clean);

  return scored;
};

module.exports = { scoreProduct };