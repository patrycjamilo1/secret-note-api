import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RecaptchaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(token: string): Promise<boolean> {
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    const url = `https://www.google.com/recaptcha/api/siteverify`;

    try {
      console.log(secretKey, token);
      const response = await firstValueFrom(
        this.httpService
          .post(
            url,
            new URLSearchParams({ secret: secretKey, response: token }),
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw new BadRequestException(
                error.response?.data || 'Error verifying reCAPTCHA token',
              );
            }),
          ),
      );

      const { success, score, action, hostname } = response.data;
      console.log('SUCCESS: ', success, score, action, hostname);
      if (!success || score < 0.5) {
        throw new BadRequestException('Invalid reCAPTCHA token or low score');
      }

      return true;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'reCAPTCHA validation error',
      );
    }
  }
}
