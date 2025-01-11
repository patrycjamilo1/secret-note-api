import { IsOptional, IsInt, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserMessagesDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1; // default to first page

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number = 10; // default page size

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'validUntil'])
  sortBy?: 'createdAt' | 'updatedAt' | 'validUntil' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'desc';

  // Filtering options - add more fields as needed
  @IsOptional()
  @IsDateString()
  validUntilBefore?: string;

  @IsOptional()
  @IsDateString()
  validUntilAfter?: string;
}
