import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { CaptchaModule } from 'src/captcha/captcha.module';

@Module({
  imports: [JwtModule.register({}), CaptchaModule],
  controllers: [AuthController],
  providers: [AuthService, RtStrategy, AtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
