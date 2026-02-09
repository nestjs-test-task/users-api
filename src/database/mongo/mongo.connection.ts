import { ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const mongoConnection = (): MongooseModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return {
      uri: config.get<string>('MONGO_URI'),
    };
  },
});
