import { MongoUserRepository } from './repositories/mongo-user.repository';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export const userProviders = [
  {
    provide: USER_REPOSITORY,
    useClass: MongoUserRepository,
  },
];
