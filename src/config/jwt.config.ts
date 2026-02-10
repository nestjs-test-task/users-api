import { ConfigService } from '@nestjs/config';
import { JWT_EXPIRES_IN, JWT_SECRET } from '@common/consts/default.value';
export const getJwtConfig = (configService: ConfigService) => {
  return {
    secret: configService.get<string>('JWT_SECRET', JWT_SECRET),
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', JWT_EXPIRES_IN),
    },
  };
};
