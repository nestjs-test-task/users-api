import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  token?: string;
  date?: string;
}
