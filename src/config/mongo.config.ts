import { ConfigService } from '@nestjs/config';
export const getMongoConfig = (configService: ConfigService) => {
  return {
    uri: configService.get<string>('MONGO_URI'),
    dbName: configService.get<string>('MONGO_DB_NAME'),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  };
};
