const prisma = require('../config/database');

class ShareService {
  async shareFile(userId, fileId, toUserName, message) {
    // 检查文件是否存在且属于当前用户
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error('File not found');
    }

    if (file.userId !== userId) {
      throw new Error('You can only share your own files');
    }

    // 根据用户名查找目标用户
    const toUser = await prisma.user.findUnique({
      where: { name: toUserName }
    });

    if (!toUser) {
      throw new Error('User not found');
    }

    if (toUser.id === userId) {
      throw new Error('Cannot share file to yourself');
    }

    // 检查是否已经分享过
    const existingShare = await prisma.fileShare.findFirst({
      where: {
        fileId,
        toUserId: toUser.id,
        fromUserId: userId
      }
    });

    if (existingShare) {
      throw new Error('File already shared to this user');
    }

    // 创建分享记录
    const share = await prisma.fileShare.create({
      data: {
        fileId,
        toUserId: toUser.id,
        fromUserId: userId,
        message
      },
      include: {
        file: true,
        fromUser: true,
        toUser: true
      }
    });

    return share;
  }

  async getReceivedShares(userId) {
    const shares = await prisma.fileShare.findMany({
      where: {
        toUserId: userId
      },
      include: {
        file: {
          include: {
            user: true
          }
        },
        fromUser: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return shares;
  }

  async getSentShares(userId) {
    const shares = await prisma.fileShare.findMany({
      where: {
        fromUserId: userId
      },
      include: {
        file: true,
        toUser: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return shares;
  }

  async markAsRead(shareId, userId) {
    const share = await prisma.fileShare.findUnique({
      where: { id: shareId }
    });

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.toUserId !== userId) {
      throw new Error('Unauthorized');
    }

    return await prisma.fileShare.update({
      where: { id: shareId },
      data: { isRead: true }
    });
  }

  async deleteShare(shareId, userId) {
    const share = await prisma.fileShare.findUnique({
      where: { id: shareId }
    });

    if (!share) {
      throw new Error('Share not found');
    }

    if (share.fromUserId !== userId && share.toUserId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.fileShare.delete({
      where: { id: shareId }
    });

    return { success: true };
  }
}

module.exports = new ShareService();