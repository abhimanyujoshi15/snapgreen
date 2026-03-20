const Scan = require('../models/Scan');
const User = require('../models/User');
const { BADGES } = require('../services/badgeService');


// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch last 5 scans with product info
    const recentScans = await Scan.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(5);

    // All scans for stats
    const allScans = await Scan.find({ userId });

    const totalScans = allScans.length;
    const goodScans = allScans.filter(s => ['A', 'B'].includes(s.ecoScoreAtScan)).length;
    const poorScans = allScans.filter(s => ['D', 'E', 'F'].includes(s.ecoScoreAtScan)).length;
    const uniqueProducts = new Set(allScans.map(s => s.productId?.toString())).size;
    const greenPercent = totalScans > 0 ? Math.round((goodScans / totalScans) * 100) : 0;

    // Score distribution
    const scoreDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    allScans.forEach(s => {
      if (s.ecoScoreAtScan && scoreDistribution[s.ecoScoreAtScan] !== undefined) {
        scoreDistribution[s.ecoScoreAtScan]++;
      }
    });

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const count = allScans.filter(s => {
        const d = new Date(s.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length;
      weeklyActivity.push({
        day: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        count
      });
    }

    const user = await User.findById(userId).select('-password');

    res.json({
      user,
      stats: {
        totalScans,
        uniqueProducts,
        goodScans,
        poorScans,
        greenPercent,
        scoreDistribution,
        weeklyActivity
      },
      recentScans
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name greenScore streakCount badges')
      .sort({ greenScore: -1 })
      .limit(10);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      greenScore: u.greenScore,
      streakCount: u.streakCount,
      badgeCount: u.badges.length,
      isCurrentUser: u._id.toString() === req.user._id.toString()
    }));

    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Also export BADGES list for frontend
const getBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('badges');
    const badgesWithStatus = BADGES.map(b => ({
      ...b,
      condition: undefined, // don't send function to frontend
      earned: user.badges.includes(b.id)
    }));
    res.json({ badges: badgesWithStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getLeaderboard, getBadges };