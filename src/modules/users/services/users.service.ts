import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueryUsersDto } from '@modules/users/dto/query-users.dto';
import { UserDocument } from '@modules/users/schemas/user.schema';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UserRepository } from '@modules/users/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '@modules/users/users.providers';
import { UserAlreadyExistsError } from '@common/errors/user-already-exists.error';
import { Security } from '@common/helpers/security/security';
import { UserNotFoundInRequestError } from '@common/errors/user-not-found-in-request.error';

@Injectable()
export class UsersService {
  @Inject(USER_REPOSITORY)
  private readonly userRepository: UserRepository;
  private readonly logger = new Logger(UsersService.name);

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }
  async createUser(dto: CreateUserDto) {
    const exists = await this.userRepository.findByEmail(dto.email);
    if (exists) {
      throw new UserAlreadyExistsError(dto.email);
    }
    const password = Security.hashPassword(dto.password);

    const newUser = await this.userRepository.create({ ...dto, password });
    this.logger.debug({
      event: 'USER_CREATED',
      user: newUser,
    });
    return newUser;
  }

  async find(query: QueryUsersDto) {
    return this.userRepository.find(query);
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundInRequestError();
    }
    await this.userRepository.update(userId, {
      ...user,
      refreshTokenHash,
    });
  }

  async clearRefreshToken(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundInRequestError();
    }
    await this.userRepository.update(userId, {
      ...user,
      refreshTokenHash: '',
    });
  }
}
