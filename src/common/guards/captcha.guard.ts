import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { RecaptchaService } from 'src/captcha/captcha.service';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recaptchaToken = request.body?.gRecaptchaResponse;

    if (!recaptchaToken) {
      throw new BadRequestException('Missing reCAPTCHA token');
    }

    try {
      const isValid = await this.recaptchaService.verifyToken(recaptchaToken);
      if (!isValid) {
        throw new BadRequestException('Invalid or failed reCAPTCHA validation');
      }
      return true;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error validating reCAPTCHA',
      );
    }
  }
}
