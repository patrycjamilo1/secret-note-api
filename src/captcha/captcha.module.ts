import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RecaptchaService } from './captcha.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [RecaptchaService],
  exports: [RecaptchaService],
})
export class CaptchaModule {}
