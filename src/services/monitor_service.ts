import { prisma } from "../config/database";
import axios from "axios";
import { Endpoint, EndpointStatus, NotificationType } from "@prisma/client";
import { NotificationService } from "./notification_service";

export class MonitorService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async checkEndpoint(endpoint: Endpoint) {
    const startTime = Date.now();
    let success = false;
    let statusCode = null;
    let errorMessage = null;
    let errorType = null;

    try {
      const response = await axios.get(endpoint.url, {
        timeout: endpoint.timeout,
      });

      success = response.status >= 200 && response.status < 300;
      statusCode = response.status;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorMessage = error.message;
        errorType = error.code;
        statusCode = error.response?.status;
      }
    }

    const responseTime = Date.now() - startTime;

    const log = await prisma.monitorLog.create({
      data: {
        endpointId: endpoint.id,
        success,
        statusCode,
        responseTime,
        errorMessage,
        errorType,
      },
    });

    let newStatus = EndpointStatus.ACTIVE;
    if (!success) {
      newStatus = EndpointStatus.DOWN as any;
    } else if (responseTime > endpoint.timeout) {
      newStatus = EndpointStatus.WARNING as any;
    }

    const updatedEndpoint = await prisma.endpoint.update({
      where: { id: endpoint.id },
      data: {
        status: newStatus,
        lastChecked: new Date(),
        responseTime,
      },
    });

    if (newStatus !== endpoint.status) {
      await this.notificationService.create({
        userId: endpoint.userId,
        endpointId: endpoint.id,
        type: this.getNotificationType(newStatus),
        message: `Endpoint ${endpoint.name} is now ${newStatus.toLowerCase()}`,
      });
    }

    return {
      log,
      status: newStatus,
      endpoint: updatedEndpoint,
    };
  }

  private getNotificationType(status: EndpointStatus): NotificationType {
    switch (status) {
      case EndpointStatus.DOWN:
        return NotificationType.DOWN;
      case EndpointStatus.WARNING:
        return NotificationType.SLOW_RESPONSE;
      default:
        return NotificationType.RECOVERED;
    }
  }
}
