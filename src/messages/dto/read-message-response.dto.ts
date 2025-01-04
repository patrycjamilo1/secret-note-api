import { ApiProperty } from '@nestjs/swagger';

export class ReadMessageResponseDto {
  @ApiProperty({
    description: 'The decrypted secret message.',
    example: 'This is my top secret message!',
  })
  secretMessage: string;

  @ApiProperty({
    description: 'Metadata about the message.',
    example: {
      uuid: 'c722f21e-70dc-4031-b64e-58d1b44d9c70',
      validUntil: '2024-12-29T19:06:00.000Z',
      userId: 1,
      createdAt: '2024-01-15T12:34:56.000Z',
      updatedAt: '2024-01-16T08:22:10.000Z',
      isPasswordProtected: true,
    },
  })
  metadata: {
    uuid: string;
    validUntil?: Date;
    userId?: number;
    createdAt: Date;
    updatedAt: Date;
    isPasswordProtected: boolean;
  };

  constructor(init: Partial<ReadMessageResponseDto>) {
    Object.assign(this, {
      secretMessage: init.secretMessage,
      metadata: init.metadata,
    });
  }
}
