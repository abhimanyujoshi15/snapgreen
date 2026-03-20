const express = require('express');
const router = express.Router();
const { getScanHistory, deleteScan } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getScanHistory);
router.delete('/:id', protect, deleteScan);

module.exports = router;