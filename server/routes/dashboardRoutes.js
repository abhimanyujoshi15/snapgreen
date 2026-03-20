const express = require('express');
const router = express.Router();
const { getDashboard, getLeaderboard, getBadges } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboard);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/badges', protect, getBadges);

module.exports = router;