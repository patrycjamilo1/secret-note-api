import { randomBytes, createCipheriv, scryptSync } from 'crypto';
import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConfigService } from '@nestjs/config';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessagesService {
  private readonly ENCRYPTION_ALGO = 'aes-256-cbc';
  private readonly KEY_LENGTH = 32;
  private readonly IV_LENGTH = 16;

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async createMessage(dto: CreateMessageDto, userId?: number) {
    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await this.authService.hashData(dto.password);
    }

    const encryptedMessage = this.encryptWithAES(
      dto.secretMessage,
      dto.password,
    );

    const validUntilDate = dto.validUntil ? new Date(dto.validUntil) : null;

    const created = await this.prisma.message.create({
      data: {
        uuid: uuid(),
        encryptedMessage,
        password: hashedPassword,
        validUntil: validUntilDate,
        userId: userId ?? null,
      },
    });

    return new MessageResponseDto(created);
  }

  private deriveAESKey(password?: string): Buffer {
    const userSalt = this.configService.get<string>('SCRYPT_USER_SALT');
    const systemSalt = this.configService.get<string>('SCRYPT_SYSTEM_SALT');

    if (password) {
      return scryptSync(password, userSalt, this.KEY_LENGTH);
    } else {
      const sysKey = this.configService.get<string>('SYSTEM_ENCRYPTION_KEY');
      if (!sysKey) {
        throw new Error(
          'No SYSTEM_ENCRYPTION_KEY found in environment variables',
        );
      }
      return scryptSync(sysKey, systemSalt, this.KEY_LENGTH);
    }
  }

  private encryptWithAES(plainText: string, password?: string): string {
    const key = this.deriveAESKey(password);
    const iv = randomBytes(this.IV_LENGTH);

    const cipher = createCipheriv(this.ENCRYPTION_ALGO, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const payload = {
      iv: iv.toString('base64'),
      content: encrypted,
    };

    return JSON.stringify(payload);
  }
}
