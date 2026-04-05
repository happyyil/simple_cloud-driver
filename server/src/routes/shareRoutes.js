const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  shareFile,
  getReceivedShares,
  getSentShares,
  markAsRead,
  deleteShare
} = require('../controllers/shareController');

router.post('/', auth, shareFile);
router.get('/received', auth, getReceivedShares);
router.get('/sent', auth, getSentShares);
router.patch('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteShare);

module.exports = router;