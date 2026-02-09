import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

export function ApiGetUsersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Отримати список користувачів',
      description: 'Повертає список користувачів з пагінацією та фільтрами',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Пошук по імені, email або телефону',
    }),
    ApiResponse({
      status: 200,
      description: 'Список користувачів',
    }),
  );
}
