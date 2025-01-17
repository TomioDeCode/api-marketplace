import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../response/base.response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorMessage = exceptionResponse.message || exception.message;
    const errorDetails = {
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `${request.method} ${request.url} - Status ${status}: ${errorMessage}`,
      exception.stack,
    );

    const errorResponse = new ErrorResponse(
      errorMessage,
      'Error',
      status,
    );

    response.status(status).json({
      ...errorResponse,
      details: errorDetails,
    });
  }
}
