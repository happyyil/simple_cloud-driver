const shareService = require('../services/shareService');

const shareFile = async (req, res, next) => {
  try {
    const { fileId, toUserName, message } = req.body;
    const userId = req.user.userId;

    if (!fileId || !toUserName) {
      return res.status(400).json({
        success: false,
        error: 'fileId and toUserName are required'
      });
    }

    const share = await shareService.shareFile(userId, fileId, toUserName, message);

    res.status(201).json({
      success: true,
      data: share
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedShares = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const shares = await shareService.getReceivedShares(userId);

    res.status(200).json({
      success: true,
      data: shares
    });
  } catch (error) {
    next(error);
  }
};

const getSentShares = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const shares = await shareService.getSentShares(userId);

    res.status(200).json({
      success: true,
      data: shares
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const share = await shareService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: share
    });
  } catch (error) {
    next(error);
  }
};

const deleteShare = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await shareService.deleteShare(id, userId);

    res.status(200).json({
      success: true,
      message: 'Share deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shareFile,
  getReceivedShares,
  getSentShares,
  markAsRead,
  deleteShare
};