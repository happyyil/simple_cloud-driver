const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  addTrustedUser,
  getTrustedUsers,
  getTrustedByUsers,
  removeTrustedUser,
  checkTrustRelationship
} = require('../controllers/trustedUserController');

router.post('/', auth, addTrustedUser);
router.get('/trusted', auth, getTrustedUsers);
router.get('/trusted-by', auth, getTrustedByUsers);
router.delete('/:trustedUserId', auth, removeTrustedUser);
router.get('/check/:userId2', auth, checkTrustRelationship);

module.exports = router;