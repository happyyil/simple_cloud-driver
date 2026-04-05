const prisma = require('../config/database');

class TrustedUserService {
  async addTrustedUser(userId, trustedUserName) {
    // 检查目标用户是否存在
    const trustedUser = await prisma.user.findUnique({
      where: { name: trustedUserName }
    });

    if (!trustedUser) {
      throw new Error('User not found');
    }

    if (trustedUser.id === userId) {
      throw new Error('Cannot trust yourself');
    }

    // 检查是否已经信任过
    const existingTrust = await prisma.trustedUser.findFirst({
      where: {
        userId,
        trustedUserId: trustedUser.id
      }
    });

    if (existingTrust) {
      throw new Error('User already trusted');
    }

    // 创建信任关系
    const trust = await prisma.trustedUser.create({
      data: {
        userId,
        trustedUserId: trustedUser.id
      },
      include: {
        trustedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return trust;
  }

  async getTrustedUsers(userId) {
    const trustedUsers = await prisma.trustedUser.findMany({
      where: {
        userId
      },
      include: {
        trustedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return trustedUsers;
  }

  async getTrustedByUsers(userId) {
    const trustedByUsers = await prisma.trustedUser.findMany({
      where: {
        trustedUserId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return trustedByUsers;
  }

  async removeTrustedUser(userId, trustedUserId) {
    const trust = await prisma.trustedUser.findFirst({
      where: {
        userId,
        trustedUserId
      }
    });

    if (!trust) {
      throw new Error('Trusted user not found');
    }

    await prisma.trustedUser.delete({
      where: { id: trust.id }
    });

    return { success: true };
  }

  async checkTrustRelationship(userId1, userId2) {
    // 检查 userId1 是否信任 userId2
    const trust1 = await prisma.trustedUser.findFirst({
      where: {
        userId: userId1,
        trustedUserId: userId2
      }
    });

    // 检查 userId2 是否信任 userId1
    const trust2 = await prisma.trustedUser.findFirst({
      where: {
        userId: userId2,
        trustedUserId: userId1
      }
    });

    return {
      user1TrustsUser2: !!trust1,
      user2TrustsUser1: !!trust2
    };
  }
}

module.exports = new TrustedUserService();