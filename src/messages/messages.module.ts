import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CaptchaModule } from 'src/captcha/captcha.module';

@Module({
  imports: [AuthModule, CaptchaModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
