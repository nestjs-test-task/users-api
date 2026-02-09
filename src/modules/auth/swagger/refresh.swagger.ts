import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ApiRefreshSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Оновлення access token',
      description:
        'Оновлює access token за допомогою refresh token. Refresh token передається в Authorization header.',
    }),

    ApiBearerAuth(),

    ApiResponse({
      status: 201,
      description: 'Access token успішно оновлено',
      schema: {
        example: {
          accessToken: 'jwt-access-token',
        },
      },
    }),

    ApiResponse({
      status: 401,
      description: 'Невалідний або прострочений refresh token',
    }),
  );
}
