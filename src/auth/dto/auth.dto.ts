import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  Validate,
  IsString,
  MinLength,
} from 'class-validator';
import { CustomMatchPasswords } from 'src/common/constraints/match_password.constraint';

export class AuthSignupDto {
  // Walidacja loginu
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  login: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  // Walidacja hasła
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
  )
  password: string;

  @ApiProperty()
  @Validate(CustomMatchPasswords, ['password'])
  passwordConfirm: string;
}

export class AuthSignInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
