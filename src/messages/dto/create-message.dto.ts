import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Content of a message that will be shown' })
  @IsNotEmpty()
  @IsString()
  secretMessage: string;

  @ApiProperty({ description: 'Password that will secure the message' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description:
      'Date and time string, that will invalidate the message even before it was read if time passed',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
