import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { LoginDto } from '@modules/auth/dto/login.dto';

export function ApiLoginSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Логін користувача',
      description: 'Авторизація по email та паролю',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 201,
      description: 'Успішна авторизація',
    }),
    ApiResponse({
      status: 401,
      description: 'Невірні облікові дані',
    }),
  );
}
