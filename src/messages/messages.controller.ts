import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetCurrentUserId } from 'src/common/decorators';
import { OptionalAuthGuard } from 'src/common/guards';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { MessageResponseDto } from './dto/message-response.dto';
import { Request } from 'express';

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
    @Req() request: Request,
  ) {
    console.log(userId, request.headers);
    const message = await this.messagesService.createMessage(dto, userId);
    return message;
  }
}
