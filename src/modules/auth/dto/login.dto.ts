import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email користувача',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Некоректний email' })
  email: string;

  @ApiProperty({
    description: 'Пароль користувача (мінімум 8 символів)',
    example: 'strongPassword123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, {
    message: 'Пароль повинен містити принаймні 8 символів',
  })
  password: string;
}
