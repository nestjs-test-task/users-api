import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { userProviders } from './users.providers';
import { UsersService } from './services/users.service';
import { UsersController } from '@modules/users/users.controller';
import { UsersSeed } from '@modules/users/seed/users.seed';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ...userProviders, UsersSeed],
  exports: [UsersService, ...userProviders],
})
export class UsersModule {}
