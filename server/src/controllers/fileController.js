const path = require('path');
const fs = require('fs/promises');
const fileService = require('../services/fileService');
const prisma = require('../config/database');

const getFiles = async (req, res, next) => {
  try {
    const { parentId, targetUserId } = req.query;
    const userId = req.user.userId;

    const files = await fileService.getFiles(userId, parentId, targetUserId ? parseInt(targetUserId) : null);

    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    next(error);
  }
};

const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Folder name is required'
      });
    }

    const folder = await fileService.createFolder(userId, name, parentId);

    res.status(201).json({
      success: true,
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

const uploadFile = async (req, res, next) => {
  try {
    const { parentId } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { filePath, fileData } = await fileService.saveFileMetadata(
      userId,
      req.file,
      parentId
    );

    // 移动文件到目标位置
    await fs.rename(req.file.path, filePath);

    const file = await prisma.file.create({
      data: fileData
    });

    res.status(201).json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const file = await fileService.getFileById(userId, id);

    if (file.isFolder) {
      return res.status(400).json({
        success: false,
        error: 'Cannot download a folder'
      });
    }

    res.download(file.path, file.name);
  } catch (error) {
    next(error);
  }
};

const renameFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'New name is required'
      });
    }

    const file = await fileService.renameFile(userId, id, name);

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await fileService.deleteFile(userId, id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFiles,
  createFolder,
  uploadFile,
  downloadFile,
  renameFile,
  deleteFile
};