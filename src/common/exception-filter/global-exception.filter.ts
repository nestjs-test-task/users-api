import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { normalizeHttpExceptionResponse } from '@common/exception-filter/utils/normalize-http-exception-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof UserAlreadyExistsError) {
      const httpException = new ConflictException({
        message: exception.message,
        email: exception.email,
      });

      const body = normalizeHttpExceptionResponse(httpException.getResponse());

      response.status(httpException.getStatus()).json({
        statusCode: httpException.getStatus(),
        timestamp: new Date().toISOString(),
        path: request.url,
        ...body,
      });

      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = normalizeHttpExceptionResponse(exception.getResponse());
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...body,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: 'Internal server error',
    });
  }
}
