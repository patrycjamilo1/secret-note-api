import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
  ApiResponse,
} from '@nestjs/swagger';
import { MessageResponseDto } from './dto/message-response.dto';
import { ReadMessageResponseDto } from './dto/read-message-response.dto';
import { ReadMessageDto } from './dto/read-message.dto';
import { MessageMetadataDto } from './dto/message-metadata.dto';

@Controller('messages')
@ApiBearerAuth()
@UseGuards(OptionalAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

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
