const trustedUserService = require('../services/trustedUserService');

const addTrustedUser = async (req, res, next) => {
  try {
    const { trustedUserName } = req.body;
    const userId = req.user.userId;

    if (!trustedUserName) {
      return res.status(400).json({
        success: false,
        error: 'trustedUserName is required'
      });
    }

    const trust = await trustedUserService.addTrustedUser(userId, trustedUserName);

    res.status(201).json({
      success: true,
      data: trust
    });
  } catch (error) {
    next(error);
  }
};

const getTrustedUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const trustedUsers = await trustedUserService.getTrustedUsers(userId);

    res.status(200).json({
      success: true,
      data: trustedUsers
    });
  } catch (error) {
    next(error);
  }
};

const getTrustedByUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const trustedByUsers = await trustedUserService.getTrustedByUsers(userId);

    res.status(200).json({
      success: true,
      data: trustedByUsers
    });
  } catch (error) {
    next(error);
  }
};

const removeTrustedUser = async (req, res, next) => {
  try {
    const { trustedUserId } = req.params;
    const userId = req.user.userId;

    await trustedUserService.removeTrustedUser(userId, parseInt(trustedUserId));

    res.status(200).json({
      success: true,
      message: 'Trusted user removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const checkTrustRelationship = async (req, res, next) => {
  try {
    const { userId2 } = req.params;
    const userId1 = req.user.userId;

    const relationship = await trustedUserService.checkTrustRelationship(
      parseInt(userId1),
      parseInt(userId2)
    );

    res.status(200).json({
      success: true,
      data: relationship
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTrustedUser,
  getTrustedUsers,
  getTrustedByUsers,
  removeTrustedUser,
  checkTrustRelationship
};