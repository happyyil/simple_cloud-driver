const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
const {
  getFiles,
  createFolder,
  uploadFile,
  downloadFile,
  renameFile,
  deleteFile
} = require('../controllers/fileController');
const prisma = require('../config/database');

// 配置multer
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// 文件路由
router.get('/', auth, getFiles);
router.post('/', auth, createFolder);
router.post('/upload', auth, upload.single('file'), uploadFile);
router.get('/:id/download', auth, downloadFile);
router.patch('/:id', auth, renameFile);
router.delete('/:id', auth, deleteFile);

module.exports = router;