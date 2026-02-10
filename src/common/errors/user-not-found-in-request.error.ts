import { UnauthorizedException } from '@nestjs/common';

export class UserNotFoundInRequestError extends UnauthorizedException {
  constructor() {
    super({
      message: 'User not found in request',
    });
  }
}
