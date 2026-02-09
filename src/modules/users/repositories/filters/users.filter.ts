import { QueryUsersDto } from '@modules/users/dto/query-users.dto';

export type UsersMongoFilter = Record<string, unknown>;

export function buildUsersFilter(query: QueryUsersDto): UsersMongoFilter {
  const filter: UsersMongoFilter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.email) {
    filter.email = query.email;
  }

  if (query.phone) {
    filter.phone = query.phone;
  }

  return filter;
}
