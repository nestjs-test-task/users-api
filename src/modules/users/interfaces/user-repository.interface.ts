import { User, UserDocument } from '../schemas/user.schema';
import { QueryUsersDto } from '@modules/users/dto/query-users.dto';
import { PaginatedResult } from '@common/helpers/pagination/pagination.types';
// Інтерфейс репозиторію для роботи з користувачами в базі даних абстрагує логіку доступу до даних, дозволяючи легко замінювати реалізацію (наприклад, MongoDB,Redis, SQL, тощо) без зміни бізнес-логіки.
export interface UserRepository {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  find(query: QueryUsersDto): Promise<PaginatedResult<User> | null>;
  create(data: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<UserDocument | null>;
}
