import { Context } from "hono";
import { z } from "zod";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  timestamp: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const error = {
  zodError(error: z.ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    return {
      status: 400,
      message: "Validation error",
      errors: formattedErrors,
    };
  },

  customError(message: string, status: number = 500) {
    return {
      status,
      message,
    };
  },

  notFoundError(resource: string) {
    return {
      status: 404,
      message: `${resource} not found`,
    };
  },

  unauthorizedError() {
    return {
      status: 401,
      message: "Unauthorized access",
    };
  },

  forbiddenError() {
    return {
      status: 403,
      message: "Forbidden access",
    };
  },
};

export const honoResponse = {
  success<T>(c: Context, data: T, status = 200, message: string) {
    c.status(status as any);
    const response: ApiResponse<T> = {
      success: true,
      message: message,
      data,
      timestamp: new Date().toISOString(),
    };
    return c.json(response);
  },

  error(c: Context, message: string, status = 500, errors?: z.ZodError) {
    const errorResponse = errors
      ? error.zodError(errors)
      : error.customError(message, status);

    c.status(errorResponse.status as any);

    const response: ApiResponse<null> = {
      success: false,
      message: errorResponse.message,
      errors: "errors" in errorResponse ? errorResponse.errors : undefined,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  },

  paginate<T>(
    c: Context,
    data: T[],
    total: number,
    page: number,
    message: string,
    limit: number,
    status = 200
  ) {
    c.status(status as any);
    const response: ApiResponse<T[]> = {
      success: true,
      message: message,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  },

  notFound(c: Context, resource: string) {
    const errorResponse = error.notFoundError(resource);
    c.status(errorResponse.status as any);

    const response: ApiResponse<null> = {
      success: false,
      message: errorResponse.message,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  },

  unauthorized(c: Context) {
    const errorResponse = error.unauthorizedError();
    c.status(errorResponse.status as any);

    const response: ApiResponse<null> = {
      success: false,
      message: errorResponse.message,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  },

  forbidden(c: Context) {
    const errorResponse = error.forbiddenError();
    c.status(errorResponse.status as any);

    const response: ApiResponse<null> = {
      success: false,
      message: errorResponse.message,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  },
};

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errors?: any
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
