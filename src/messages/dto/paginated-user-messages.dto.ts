import { ApiProperty } from '@nestjs/swagger';
import { UserMessageResponseDto } from './user-message-response.dto';

export class PaginatedUserMessagesDto {
  @ApiProperty({ type: [UserMessageResponseDto] })
  items: UserMessageResponseDto[];

  @ApiProperty({ description: 'Total number of messages' })
  totalCount: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}
