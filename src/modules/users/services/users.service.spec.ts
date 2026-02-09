import { Test } from '@nestjs/testing';
import { USER_REPOSITORY } from '@modules/users/users.providers';
import { UsersService } from './users.service';
import { Security } from '@common/helpers/security/security';
import { UserAlreadyExistsError } from '@common/errors/user-already-exists.error';
import { UserNotFoundInRequestError } from '@common/errors/user-not-found-in-request.error';
import { PaginatedResult } from '@common/helpers/pagination/pagination.types';
import { QueryUsersDto } from '@modules/users/dto/query-users.dto';
import { Role } from '@modules/auth/enums/role.enum';
import { Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

type UserRepositoryMock = {
  findById: jest.Mock<Promise<UserDocument | null>, [string]>;
  findByEmail: jest.Mock<Promise<UserDocument | null>, [string]>;
  find: jest.Mock<Promise<PaginatedResult<User> | null>, [QueryUsersDto]>;
  create: jest.Mock<Promise<User>, [Partial<User>]>;
  update: jest.Mock<Promise<UserDocument | null>, [string, Partial<User>]>;
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepositoryMock;

  const repositoryMock: UserRepositoryMock = {
    findById: jest.fn<Promise<UserDocument | null>, [string]>(),
    findByEmail: jest.fn<Promise<UserDocument | null>, [string]>(),
    find: jest.fn<Promise<PaginatedResult<User> | null>, [QueryUsersDto]>(),
    create: jest.fn<Promise<User>, [Partial<User>]>(),
    update: jest.fn<Promise<UserDocument | null>, [string, Partial<User>]>(),
  };

  const sampleUser = (overrides: Partial<UserDocument> = {}): UserDocument =>
    ({
      _id: new Types.ObjectId(),
      email: 'user@example.com',
      name: 'John Doe',
      password: 'hashed',
      roles: [Role.USER],
      ...overrides,
    }) as unknown as UserDocument;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get<UserRepositoryMock>(USER_REPOSITORY);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('returns a user by id', async () => {
      const user = sampleUser();
      repository.findById.mockResolvedValue(user);

      const result = await service.findById(user._id.toString());

      expect(result).toBe(user);
      expect(repository.findById).toHaveBeenCalledWith(user._id.toString());
    });
  });

  describe('createUser', () => {
    it('creates a user when email is free', async () => {
      const dto = { email: 'user@example.com', name: 'John', password: '123' };
      const hashedPassword = 'salt:hash';
      const createdUser = sampleUser({ password: hashedPassword });

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(createdUser);
      const hashPasswordSpy = jest
        .spyOn(Security, 'hashPassword')
        .mockReturnValue(hashedPassword);

      const result = await service.createUser(dto);

      expect(result).toBe(createdUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(hashPasswordSpy).toHaveBeenCalledWith(dto.password);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        password: hashedPassword,
      });
    });

    it('throws when user already exists', async () => {
      const dto = { email: 'user@example.com', name: 'John', password: '123' };
      repository.findByEmail.mockResolvedValue(sampleUser());

      await expect(service.createUser(dto)).rejects.toBeInstanceOf(
        UserAlreadyExistsError,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('delegates to repository', async () => {
      const query = new QueryUsersDto();
      query.search = 'john';
      query.limit = 10;
      const expected: PaginatedResult<User> = {
        items: [sampleUser()],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      repository.find.mockResolvedValue(expected);

      const result = await service.find(query);

      expect(result).toBe(expected);
      expect(repository.find).toHaveBeenCalledWith(query);
    });
  });

  describe('findByEmail', () => {
    it('returns user by email', async () => {
      const user = sampleUser();
      repository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(result).toBe(user);
      expect(repository.findByEmail).toHaveBeenCalledWith(user.email);
    });
  });

  describe('updateRefreshToken', () => {
    it('throws when user is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateRefreshToken('123', 'new-hash'),
      ).rejects.toBeInstanceOf(UserNotFoundInRequestError);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('updates refresh token hash', async () => {
      const user = sampleUser({ refreshTokenHash: 'old' });
      repository.findById.mockResolvedValue(user);
      repository.update.mockResolvedValue(user);

      await service.updateRefreshToken(user._id.toString(), 'new-hash');

      expect(repository.update).toHaveBeenCalledWith(user._id.toString(), {
        ...user,
        refreshTokenHash: 'new-hash',
      });
    });
  });

  describe('clearRefreshToken', () => {
    it('throws when user is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.clearRefreshToken('123')).rejects.toBeInstanceOf(
        UserNotFoundInRequestError,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('clears refresh token hash', async () => {
      const user = sampleUser({ refreshTokenHash: 'old' });
      repository.findById.mockResolvedValue(user);

      await service.clearRefreshToken(user._id.toString());

      expect(repository.update).toHaveBeenCalledWith(user._id.toString(), {
        ...user,
        refreshTokenHash: '',
      });
    });
  });
});
