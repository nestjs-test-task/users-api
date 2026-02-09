import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function ApiGetUserByIdSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Отримати користувача',
      description: 'Повертає користувача за ID',
    }),
    ApiParam({
      name: 'id',
      description: 'ID користувача',
      example: '65f1c9e8a12b3c0012a12345',
    }),
    ApiResponse({
      status: 200,
      description: 'Користувача знайдено',
    }),
    ApiResponse({
      status: 404,
      description: 'Користувача не знайдено',
    }),
  );
}
