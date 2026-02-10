import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserRepository } from '../interfaces/user-repository.interface';

import { User, UserDocument } from '../schemas/user.schema';
import { QueryUsersDto } from '@modules/users/dto/query-users.dto';
import { buildUsersFilter } from '@modules/users/repositories/filters/users.filter';
import { createPagination } from '@common/helpers/pagination/create-pagination';
import { PaginatedResult } from '@common/helpers/pagination/pagination.types';
import { CatchMongooseError } from '@database/mongo/decorators/catch-mongoose-error.decorator';

@Injectable()
export class MongoUserRepository implements UserRepository {
  @InjectModel(User.name)
  private readonly userModel: Model<UserDocument>;

  @CatchMongooseError('Отримання користувача по ID')
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).lean();
  }

  @CatchMongooseError('Пошук користувача по email')
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).lean();
  }

  @CatchMongooseError('Створення користувача')
  async create(data: Partial<User>): Promise<User> {
    const user = new this.userModel(data);

    return user.save();
  }

  @CatchMongooseError('Оновлення користувача')
  async update(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean();
  }

  @CatchMongooseError('Пошук користувачів')
  async find(dto: QueryUsersDto): Promise<PaginatedResult<User>> {
    const { skip, limit, page } = dto;
    const userFilter = buildUsersFilter(dto);
    const [items, total] = await Promise.all([
      this.userModel
        .find(userFilter)
        .select('-password -refreshTokenHash -roles')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(userFilter),
    ]);

    return createPagination<User>(items, total, { page, limit });
  }
}
