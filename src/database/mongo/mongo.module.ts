import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoConnection } from './mongo.connection';

@Module({
  imports: [MongooseModule.forRootAsync(mongoConnection())],
})
export class MongoModule {}
