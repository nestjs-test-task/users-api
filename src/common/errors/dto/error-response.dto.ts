import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../error-codes.enum';

export class FieldErrorDto {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ enum: ErrorCode })
  code: ErrorCode;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, type: [FieldErrorDto] })
  errors?: FieldErrorDto[];
}
