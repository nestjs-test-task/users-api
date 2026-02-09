import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApiLogoutSwagger = () => {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    ApiBearerAuth()(target, propertyKey, descriptor);

    ApiOperation({
      summary: 'Вихід користувача з системи',
      description: 'Логаут авторизованого користувача. Інвалідовує refresh .',
    })(target, propertyKey, descriptor);

    ApiResponse({
      status: 200,
      description: 'Користувач успішно вийшов із системи',
      schema: {
        example: {
          success: true,
          message: 'Logout successful',
        },
      },
    })(target, propertyKey, descriptor);

    ApiResponse({
      status: 401,
      description: 'Користувач не авторизований або токен невалідний',
    })(target, propertyKey, descriptor);
  };
};
