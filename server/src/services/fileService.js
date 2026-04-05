const path = require('path');
const fs = require('fs/promises');
const prisma = require('../config/database');

class FileService {
  async getFiles(userId, parentId = null, targetUserId = null) {
    // 如果指定了 targetUserId，检查是否有权限查看该用户的文件
    if (targetUserId && targetUserId !== userId) {
      // 检查当前用户是否信任目标用户
      const trust = await prisma.trustedUser.findFirst({
        where: {
          userId,
          trustedUserId: targetUserId
        }
      });

      if (!trust) {
        throw new Error('Unauthorized: You do not have permission to view this user\'s files');
      }

      return await prisma.file.findMany({
        where: {
          userId: targetUserId,
          parentId
        },
        orderBy: {
          isFolder: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    }

    return await prisma.file.findMany({
      where: {
        userId,
        parentId
      },
      orderBy: {
        isFolder: 'desc'
      }
    });
  }

  async createFolder(userId, name, parentId = null) {
    // 检查同一目录下是否有同名文件夹
    const existingFolder = await prisma.file.findFirst({
      where: {
        userId,
        parentId,
        name,
        isFolder: true
      }
    });

    if (existingFolder) {
      throw new Error('Folder with the same name already exists');
    }

    return await prisma.file.create({
      data: {
        name,
        userId,
        parentId,
        isFolder: true,
        path: '',
        size: 0
      }
    });
  }

  async renameFile(userId, fileId, newName) {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // 检查同一目录下是否有同名文件
    const existingFile = await prisma.file.findFirst({
      where: {
        userId,
        parentId: file.parentId,
        name: newName,
        id: { not: fileId }
      }
    });

    if (existingFile) {
      throw new Error('File with the same name already exists');
    }

    return await prisma.file.update({
      where: { id: fileId },
      data: { name: newName }
    });
  }

  async deleteFile(userId, fileId) {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // 如果是文件夹，递归删除所有子文件
    if (file.isFolder) {
      await this.deleteFolderRecursive(fileId);
    } else {
      // 删除实际文件
      try {
        await fs.unlink(file.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    return await prisma.file.delete({
      where: { id: fileId }
    });
  }

  async deleteFolderRecursive(folderId) {
    const children = await prisma.file.findMany({
      where: { parentId: folderId }
    });

    for (const child of children) {
      if (child.isFolder) {
        await this.deleteFolderRecursive(child.id);
      } else {
        try {
          await fs.unlink(child.path);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }
      await prisma.file.delete({
        where: { id: child.id }
      });
    }
  }

  async saveFileMetadata(userId, file, parentId = null) {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', userId.toString());
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

    return {
      filePath,
      fileData: {
        name: file.originalname,
        path: filePath,
        size: file.size,
        mimeType: file.mimetype,
        userId,
        parentId,
        isFolder: false
      }
    };
  }

  async getFileById(userId, fileId) {
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return file;
  }
}

module.exports = new FileService();