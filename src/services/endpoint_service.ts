import { prisma } from "../config/database";
import { EndpointRequest } from "../types";
import { Endpoint, Prisma } from "@prisma/client";

export class EndpointService {
  async create(userId: string, data: EndpointRequest) {
    return prisma.endpoint.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return prisma.endpoint.findMany({
      where: { userId },
      include: {
        monitorLogs: {
          take: 10,
          orderBy: { timestamp: "desc" },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    return prisma.endpoint.findFirst({
      where: { id, userId },
      include: {
        monitorLogs: {
          take: 100,
          orderBy: { timestamp: "desc" },
        },
      },
    });
  }

  async update(id: string, userId: string, data: Partial<EndpointRequest>) {
    return prisma.endpoint.update({
      where: { id, userId },
      data: {
        ...data,
        headers: data.headers ?? Prisma.JsonNull,
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.endpoint.delete({
      where: { id, userId },
    });
  }
}
