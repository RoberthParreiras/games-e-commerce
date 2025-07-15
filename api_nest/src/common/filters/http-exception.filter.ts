import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { PrismaExceptionFilter } from './prisma-exception.filter';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly prismaException = new PrismaExceptionFilter();
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(
    exception: HttpException | PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, message } = this.prismaException.catchPrismaError(exception));
    }

    this.logger.error(`[${request.url}] ${status} - ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
