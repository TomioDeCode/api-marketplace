import { prisma } from "../config/database";
import { NotificationType } from "@prisma/client";

interface CreateNotificationData {
  userId: string;
  endpointId: string;
  type: NotificationType;
  message: string;
}

export class NotificationService {
  async create(data: CreateNotificationData) {
    return prisma.notification.create({
      data,
    });
  }

  async findAll(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { read: true },
    });
  }
}
