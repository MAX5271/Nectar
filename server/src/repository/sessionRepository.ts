import prisma from "../utils/db.js";

export interface CreateSessionParams {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

class SessionRepository {
  async createSession(params: CreateSessionParams) {
    return await prisma.session.create({
      data: {
        userId: params.userId,
        refreshToken: params.refreshToken,
        expiresAt: params.expiresAt,
        userAgent: params.userAgent ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  }

  async findSessionByToken(refreshToken: string) {
    return await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  async rotateSessionToken(oldToken: string, newToken: string, newExpiresAt: Date) {
    return await prisma.session.update({
      where: { refreshToken: oldToken },
      data: {
        refreshToken: newToken,
        expiresAt: newExpiresAt,
      },
    });
  }

  async deleteSessionByToken(refreshToken: string) {
    try {
      return await prisma.session.delete({
        where: { refreshToken },
      });
    } catch {
      return null;
    }
  }

  async deleteSessionById(id: string, userId: string) {
    try {
      const session = await prisma.session.findFirst({
        where: { id, userId },
      });
      if (!session) return null;
      return await prisma.session.delete({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  async getUserSessions(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async revokeAllUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async cleanupExpiredSessions() {
    return await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

export const sessionRepository = new SessionRepository();
