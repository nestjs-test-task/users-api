import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Role } from '@modules/auth/enums/role.enum';
import { Types } from 'mongoose';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { Security } from '@common/helpers/security/security';

type UsersServiceMock = {
  findByEmail: jest.Mock<Promise<UserDocument | null>, [string]>;
  updateRefreshToken: jest.Mock<Promise<void>, [string, string]>;
  findById: jest.Mock<Promise<UserDocument | null>, [string]>;
  clearRefreshToken: jest.Mock<Promise<void>, [string]>;
};

type JwtServiceMock = {
  signAsync: jest.Mock<Promise<string>, [unknown, unknown?]>;
};

type ConfigServiceMock = {
  get: jest.Mock<string | undefined, [string, string?]>;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersServiceMock;
  let jwtService: JwtServiceMock;
  let configService: ConfigServiceMock;

  const usersServiceMock: UsersServiceMock = {
    findByEmail: jest.fn<Promise<UserDocument | null>, [string]>(),
    updateRefreshToken: jest.fn<Promise<void>, [string, string]>(),
    findById: jest.fn<Promise<UserDocument | null>, [string]>(),
    clearRefreshToken: jest.fn<Promise<void>, [string]>(),
  };

  const jwtServiceMock: JwtServiceMock = {
    signAsync: jest.fn<Promise<string>, [unknown, unknown?]>(),
  };

  const configServiceMock: ConfigServiceMock = {
    get: jest.fn<string | undefined, [string, string?]>(),
  };

  const user = (overrides: Partial<UserDocument> = {}): UserDocument =>
    ({
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      password: 'stored-hash',
      roles: [Role.USER],
      refreshTokenHash: 'refresh-hash',
      ...overrides,
    }) as unknown as UserDocument;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get<UsersServiceMock>(UsersService);
    jwtService = module.get<JwtServiceMock>(JwtService);
    configService = module.get<ConfigServiceMock>(ConfigService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('issues tokens when credentials are valid', async () => {
      const loginDto = { email: 'user@example.com', password: 'password' };
      const existingUser = user();
      usersService.findByEmail.mockResolvedValue(existingUser);
      const verifyPasswordSpy = jest
        .spyOn(Security, 'verifyPassword')
        .mockReturnValue(true);
      const issuedTokens = { accessToken: 'access', refreshToken: 'refresh' };
      const issueTokensSpy = jest
        .spyOn(service, 'issueTokens')
        .mockResolvedValue(issuedTokens);

      const result = await service.login(loginDto);

      expect(result).toEqual(issuedTokens);
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        loginDto.password,
        existingUser.password,
      );
      expect(issueTokensSpy).toHaveBeenCalledWith(existingUser);
    });

    it('throws when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: '123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when password is invalid', async () => {
      const existingUser = user();
      usersService.findByEmail.mockResolvedValue(existingUser);
      jest.spyOn(Security, 'verifyPassword').mockReturnValue(false);

      await expect(
        service.login({ email: existingUser.email, password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('issueTokens', () => {
    it('returns signed tokens and stores refresh hash', async () => {
      const account = user();
      const payload = {
        sub: account._id.toString(),
        email: account.email,
        roles: account.roles,
      };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);
      jest.spyOn(Security, 'md5').mockReturnValue('md5-refresh');
      configService.get.mockImplementation((key, defaultValue) => {
        const values: Record<string, string> = {
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
          JWT_SECRET: 'jwt-secret',
          JWT_REFRESH_SECRET: 'jwt-refresh-secret',
        };
        return values[key] ?? (defaultValue as string);
      });

      const result = await service.issueTokens(account);

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        payload,
        expect.objectContaining({
          expiresIn: '15m',
          secret: 'jwt-secret',
        }),
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        payload,
        expect.objectContaining({
          expiresIn: '7d',
          secret: 'jwt-refresh-secret',
        }),
      );
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        account._id.toString(),
        'md5-refresh',
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe('refresh', () => {
    it('throws when user is missing', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.refresh('unknown-id', 'token'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws when refresh hash is absent', async () => {
      usersService.findById.mockResolvedValue(user({ refreshTokenHash: '' }));

      await expect(service.refresh('id', 'token')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws when refresh token does not match', async () => {
      const account = user({ refreshTokenHash: 'stored-hash' });
      usersService.findById.mockResolvedValue(account);
      jest.spyOn(Security, 'md5').mockReturnValue('different-hash');

      await expect(
        service.refresh(account._id.toString(), 'token'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('re-issues tokens when refresh token is valid', async () => {
      const account = user({ refreshTokenHash: 'stored-hash' });
      usersService.findById.mockResolvedValue(account);
      const md5Spy = jest.spyOn(Security, 'md5').mockReturnValue('stored-hash');
      const issuedTokens = { accessToken: 'a', refreshToken: 'r' };
      const issueTokensSpy = jest
        .spyOn(service, 'issueTokens')
        .mockResolvedValue(issuedTokens);

      const result = await service.refresh(account._id.toString(), 'token');

      expect(md5Spy).toHaveBeenCalledWith('token');
      expect(issueTokensSpy).toHaveBeenCalledWith(account);
      expect(result).toEqual(issuedTokens);
    });
  });

  describe('logout', () => {
    it('clears refresh token and returns success', async () => {
      usersService.clearRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout('user-id');

      expect(usersService.clearRefreshToken).toHaveBeenCalledWith('user-id');
      expect(result).toEqual({ success: true });
    });
  });
});
