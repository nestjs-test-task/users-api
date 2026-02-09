import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { DatabaseModule } from '@database/database.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@common/exception-filter/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
