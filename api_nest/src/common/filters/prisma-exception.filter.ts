import { HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface PrismaException {
  catchPrismaError(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string | object;
  };
}

export class PrismaExceptionFilter implements PrismaException {
  catchPrismaError(exception: PrismaClientKnownRequestError) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    
    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        message = `Unique constraint violation`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = exception.meta?.cause || 'Record not found';
        break;
      }
      default: {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database request error';
      }
    }
    return {
      status: status,
      message: message,
    };
  }
}
