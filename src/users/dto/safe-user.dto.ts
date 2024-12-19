import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SafeUser {
  @ApiProperty({ description: 'The ID of the user' })
  id: number;

  @ApiProperty({ description: 'Login of the user' })
  login: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({
    description: 'When user was created',
  })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'URL for user image' })
  image?: string | null;

  constructor(partial: Partial<SafeUser>) {
    Object.assign(this, {
      id: partial.id,
      email: partial.email,
      createdAt: partial.createdAt,
      image: partial.image,
    });
  }
}
