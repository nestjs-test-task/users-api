import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { Role } from '@modules/auth/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({ required: true, index: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  refreshTokenHash?: string;

  @Prop({
    type: [String],
    enum: Role,
    default: [Role.USER],
  })
  roles: Role[];
}
export const UserSchema = SchemaFactory.createForClass(User);
