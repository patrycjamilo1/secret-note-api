import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignInDto, AuthSignupDto } from './dto';
import { Tokens } from './types';
import { RecaptchaGuard, RtGuard } from 'src/common/guards';
import {
  GetCurrentUser,
  GetCurrentUserId,
  PublicRoute,
} from 'src/common/decorators';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiConflictResponse()
  @PublicRoute()
  @Post('local/signup')
  @UseGuards(RecaptchaGuard)
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthSignupDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @ApiForbiddenResponse()
  @PublicRoute()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RecaptchaGuard)
  signinLocal(@Body() dto: AuthSignInDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @ApiUnauthorizedResponse()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  @ApiUnauthorizedResponse()
  @PublicRoute()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @GetCurrentUser('refreshToken') rt: string,
    @GetCurrentUserId() userId: number,
  ) {
    return this.authService.refreshToken(userId, rt);
  }
}
