import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
const SALT_ROUNDS = 10;

export class Security {
  static hashPassword(password: string) {
    const salt = randomBytes(SALT_ROUNDS).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    const derived = scryptSync(password, salt, 64);
    return timingSafeEqual(Buffer.from(hash, 'hex'), derived);
  }

  static md5(value: string): string {
    return createHash('md5').update(value).digest('hex');
  }
}
