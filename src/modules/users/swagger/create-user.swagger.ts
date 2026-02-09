import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateUserSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Створення користувача',
      description: 'Створює нового користувача в системі',
    }),
    ApiResponse({
      status: 201,
      description: 'Користувача успішно створено',
    }),
    ApiResponse({
      status: 400,
      description: 'Помилка валідації даних',
    }),
  );
}
