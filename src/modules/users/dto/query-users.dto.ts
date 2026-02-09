import { BasePaginationDto } from '@common/dto/base-pagination.dto';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUsersDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Пошук по імені, email або телефону',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Пошуковий запит повинен містити принаймні 3 символи',
  })
  @MaxLength(100, {
    message: 'Пошуковий запит не може містити більше 100 символів',
  })
  search: string;

  @ApiPropertyOptional({
    description: 'Фільтр по email (точний збіг)',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Фільтр по номеру телефону (точний збіг)',
    example: '+380991234567',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
