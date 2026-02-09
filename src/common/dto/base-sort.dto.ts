import { IsIn, IsOptional, IsString } from 'class-validator';

export type SortOrder = 'asc' | 'desc';

export class BaseSortDto {
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'asc';
}
