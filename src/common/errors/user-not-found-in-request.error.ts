import { UnauthorizedException } from '@nestjs/common';

export class UserNotFoundInRequestError extends UnauthorizedException {
  constructor() {
    super({
      message: 'User not found in request',
      code: 'USER_NOT_FOUND_IN_REQUEST',
    });
  }
}
