const express = require('express');
const router = express.Router();
const { getProductByBarcode, getProductByPhoto } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

router.get('/barcode/:barcode', protect, getProductByBarcode);
router.post('/photo', protect, getProductByPhoto);

module.exports = router;