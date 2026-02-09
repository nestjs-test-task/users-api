import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import { ErrorResponseDto } from '@common/errors/dto/error-response.dto';
import { ErrorCode } from '@common/errors/error-codes.enum';

export interface MongoDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

export function handleMongooseError(
  error: unknown,
  context = 'Операція',
): never {
  // 🔹 Validation
  if (error instanceof MongooseError.ValidationError) {
    const response: ErrorResponseDto = {
      code: ErrorCode.VALIDATION_ERROR,
      message: `${context}: помилка валідації`,
      errors: Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    };
    throw new BadRequestException(response);
  }

  if (error instanceof MongooseError.CastError) {
    const response: ErrorResponseDto = {
      code: ErrorCode.INVALID_ID,
      message: `${context}: некоректне значення "${error.value}" для поля "${error.path}"`,
    };
    throw new BadRequestException(response);
  }

  if (isDuplicateKeyError(error)) {
    const entries = Object.entries(error.keyValue ?? {});
    const details = entries.map(([k, v]) => `${k}: "${String(v)}"`).join(', ');

    const response: ErrorResponseDto = {
      code: ErrorCode.DUPLICATE_KEY,
      message: `${context}: дублікат значення (${details})`,
    };
    throw new ConflictException(response);
  }

  // 🔹 Fallback
  const response: ErrorResponseDto = {
    code: ErrorCode.INTERNAL_ERROR,
    message: `${context}: внутрішня помилка сервера`,
  };

  throw new InternalServerErrorException(response);
}
