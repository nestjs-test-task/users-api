import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, AnyBulkWriteOperation } from 'mongoose';
import { Faker, uk } from '@faker-js/faker';

import { User, UserDocument } from '../schemas/user.schema';
import { Security } from '@common/helpers/security/security';

const fakerUA = new Faker({ locale: [uk] });

const TOTAL = 2_000_000;
const BATCH_SIZE = 2_000;

@Injectable()
export class UsersSeed implements OnModuleInit {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.estimatedDocumentCount();

    if (count) {
      this.logger.log('Users already exist, seed skipped');
      this.logger.warn(`Users count: ${count}`);
      return;
    }

    const password = Security.hashPassword('password123');

    for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
      const ops: AnyBulkWriteOperation<UserDocument>[] = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const user = this.generateData(password, offset + i);

        ops.push({
          updateOne: {
            filter: { email: user.email },
            update: {
              $setOnInsert: user,
            },
            upsert: true,
          },
        });
      }

      const res = await this.userModel.bulkWrite(ops, { ordered: false });

      this.logger.debug(
        `Matched: ${res.matchedCount}, Inserted: ${res.upsertedCount + offset}`,
      );
    }

    this.logger.log('Users upsert seed completed');
  }

  private generateData(password: string, index: number) {
    const firstName = fakerUA.person.firstName();
    const lastName = fakerUA.person.lastName();
    const birthDate = fakerUA.date.birthdate({
      mode: 'age',
      min: 18,
      max: 65,
    });

    return {
      name: `${firstName} ${lastName}`,
      email: `${firstName}.${lastName}.${index}@example.com`.toLowerCase(),
      password,
      phone: fakerUA.phone.number({ style: 'international' }),
      birthDate,
    };
  }
}
