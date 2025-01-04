import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadMessageDto {
  @ApiProperty({
    description: 'Password to decrypt the message if it is password-protected.',
    example: 'mySuperSecretPassword',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}
