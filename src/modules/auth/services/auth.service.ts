import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/services/users.service';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';

import { UserDocument } from '@modules/users/schemas/user.schema';
import { Security } from '@common/helpers/security/security';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { ConfigService } from '@nestjs/config';
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from '@common/consts/default.value';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !Security.verifyPassword(dto.password, user.password ?? '')) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async issueTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', JWT_EXPIRES_IN),
      secret: this.configService.get('JWT_SECRET', JWT_SECRET),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get(
        'JWT_REFRESH_EXPIRES_IN',
        JWT_REFRESH_EXPIRES_IN,
      ),
      secret: this.configService.get('JWT_REFRESH_SECRET', JWT_REFRESH_SECRET),
    });

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      Security.md5(refreshToken),
    );

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException();
    }

    const isValid = Security.md5(refreshToken) == user.refreshTokenHash;

    if (!isValid) throw new ForbiddenException();
    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
    return { success: true };
  }
}
