import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetCurrentUserId } from 'src/common/decorators';
import { OptionalAuthGuard } from 'src/common/guards';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessageResponseDto } from './dto/message-response.dto';
import { ReadMessageResponseDto } from './dto/read-message-response.dto';
import { ReadMessageDto } from './dto/read-message.dto';
import { MessageMetadataDto } from './dto/message-metadata.dto';
import { GetUserMessagesDto } from './dto/get-user-messages.dto';
import { UserMessageResponseDto } from './dto/user-message-response.dto';
import { PaginatedUserMessagesDto } from './dto/paginated-user-messages.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(OptionalAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Get messages created by the current user with sorting, filtering, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user messages.',
    type: [UserMessageResponseDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'validUntil'],
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortDirection',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction',
    example: 'desc',
  })
  @ApiQuery({
    name: 'validUntilBefore',
    required: false,
    type: String,
    description: 'Filter messages expiring before this date (ISO string)',
  })
  @ApiQuery({
    name: 'validUntilAfter',
    required: false,
    type: String,
    description: 'Filter messages expiring after this date (ISO string)',
  })
  async getUserMessages(
    @GetCurrentUserId() userId: number,
    @Query() query: GetUserMessagesDto,
  ): Promise<PaginatedUserMessagesDto> {
    const { items, totalCount, totalPages } =
      await this.messagesService.getUserMessages(userId, query);
    return {
      items,
      totalCount,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      totalPages,
    };
  }

  @Post()
  @ApiOkResponse({ description: 'Created message', type: MessageResponseDto })
  async createMessage(
    @Body() dto: CreateMessageDto,
    @GetCurrentUserId() userId: number | null,
  ) {
    const message = await this.messagesService.createMessage(dto, userId);
    return message;
  }

  @Get(':uuid/metadata')
  @ApiOperation({ summary: 'Get metadata of a message by UUID' })
  @ApiResponse({
    status: 200,
    description: 'Metadata of the message.',
    type: MessageMetadataDto,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 400, description: 'Message has expired.' })
  async getMessageMetadata(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<MessageMetadataDto> {
    return await this.messagesService.getMessageMetadata(uuid);
  }

  @Post(':uuid/read')
  @ApiOperation({ summary: 'Read and decrypt a message by UUID' })
  @ApiResponse({
    status: 200,
    description: 'The decrypted message and its metadata.',
    type: ReadMessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 400, description: 'Message has expired.' })
  @ApiResponse({
    status: 403,
    description: 'Password required or incorrect password.',
  })
  async readMessage(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: ReadMessageDto,
  ): Promise<ReadMessageResponseDto> {
    return await this.messagesService.readMessage(uuid, dto);
  }
}
