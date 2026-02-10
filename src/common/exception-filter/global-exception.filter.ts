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
import { UserNotFoundInRequestError } from '@common/errors/user-not-found-in-request.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    if (exception instanceof UserAlreadyExistsError) {
      return this.respondWithHttpException(
        new ConflictException({
          message: exception.message,
          email: exception.email,
        }),
        response,
        request,
        timestamp,
      );
    }

    if (exception instanceof UserNotFoundInRequestError) {
      return this.respondWithHttpException(
        exception,
        response,
        request,
        timestamp,
      );
    }

    if (exception instanceof HttpException) {
      return this.respondWithHttpException(
        exception,
        response,
        request,
        timestamp,
      );
    }

    this.logger.error(
      `Unhandled exception ${request.method} ${request.originalUrl}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path: request.originalUrl,
      message: 'Internal server error',
    });
  }

  private respondWithHttpException(
    exception: HttpException,
    response: Response,
    request: Request,
    timestamp: string,
  ): void {
    const status = exception.getStatus();
    const body = normalizeHttpExceptionResponse(exception.getResponse());

    response.status(status).json({
      statusCode: status,
      timestamp,
      path: request.originalUrl,
      ...body,
    });
  }
}
