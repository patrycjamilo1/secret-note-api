import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class MessageResponseDto {
  @ApiProperty({
    description: 'The unique UUID that identifies this message.',
    example: 'c722f21e-70dc-4031-b64e-58d1b44d9c70',
  })
  uuid: string;

  @ApiProperty({
    description: 'The date/time until which this message is valid, if any.',
    example: '2024-12-29T19:06:00.000Z',
    required: false,
    type: String,
    nullable: true,
  })
  validUntil?: Date;

  @ApiProperty({
    description: 'The ID of the user who created this message, if any.',
    example: 1,
    required: false,
    nullable: true,
  })
  userId?: number;

  @ApiProperty({
    description: 'The creation timestamp of this message.',
    example: '2024-01-15T12:34:56.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp of this message.',
    example: '2024-01-16T08:22:10.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indicates whether this message is password-protected.',
    example: true,
  })
  isPasswordProtected: boolean;

  constructor(message: Message) {
    this.uuid = message.uuid;
    this.validUntil = message.validUntil ?? undefined;
    this.userId = message.userId ?? undefined;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
    this.isPasswordProtected = !!message.password;
  }
}
