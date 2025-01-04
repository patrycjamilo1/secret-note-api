import { ApiProperty } from '@nestjs/swagger';

export class MessageMetadataDto {
  @ApiProperty({
    description: 'The unique UUID that identifies this message.',
    example: 'c722f21e-70dc-4031-b64e-58d1b44d9c70',
  })
  uuid: string;

  @ApiProperty({
    description: 'Indicates whether this message is password-protected.',
    example: true,
  })
  isPasswordProtected: boolean;

  @ApiProperty({
    description: 'The date/time until which this message is valid, if any.',
    example: '2024-12-29T19:06:00.000Z',
    required: false,
    nullable: true,
  })
  validUntil?: Date;

  constructor(init: MessageMetadataDto) {
    Object.assign(this, init);
  }
}
