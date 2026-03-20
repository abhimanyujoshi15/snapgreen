const Scan = require('../models/Scan');

// @route GET /api/scans/history
const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.user._id })
      .populate('productId')
      .sort({ createdAt: -1 })  // newest first
      .limit(50)

    res.json({ scans });
  } catch (err) {
    console.error('Scan history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route DELETE /api/scans/:id
const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.user._id  // make sure user owns this scan
    });

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    await scan.deleteOne();
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    console.error('Delete scan error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getScanHistory, deleteScan };