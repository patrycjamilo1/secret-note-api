// src/messages/dto/user-message-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class UserMessageResponseDto {
  @ApiProperty({ description: 'Unique identifier of the message' })
  uuid: string;

  @ApiProperty({
    description: 'Expiration date of the message',
    required: false,
  })
  validUntil: Date | null;

  @ApiProperty({ description: 'Creation timestamp of the message' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp of the message' })
  updatedAt: Date;

  constructor(message: Message) {
    this.uuid = message.uuid;
    this.validUntil = message.validUntil;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }
}
