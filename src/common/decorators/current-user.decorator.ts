import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  <K extends keyof JwtPayload | undefined>(key: K, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    const authHeader = request.headers.authorization || '';

    const token = authHeader.replace(/^Bearer\s+/i, '');

    return { ...user, token };
  },
);
