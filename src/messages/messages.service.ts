import {
  randomBytes,
  createCipheriv,
  scryptSync,
  createDecipheriv,
} from 'crypto';
import { v4 as uuid } from 'uuid';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConfigService } from '@nestjs/config';
import { MessageResponseDto } from './dto/message-response.dto';
import { ReadMessageDto } from './dto/read-message.dto';
import { ReadMessageResponseDto } from './dto/read-message-response.dto';
import { MessageMetadataDto } from './dto/message-metadata.dto';
import { GetUserMessagesDto } from './dto/get-user-messages.dto';
import { UserMessageResponseDto } from './dto/user-message-response.dto';

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

  // Tworzymy klucz albo z hasłem defaultowym albo nasze, tworzyny iv, tworzymy zaszyfrowaną wiadomość
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

  private decryptWithAES(encryptedData: string, password?: string): string {
    try {
      const parsedData = JSON.parse(encryptedData);
      const iv = Buffer.from(parsedData.iv, 'base64');
      const encryptedContent = parsedData.content;

      const key = this.deriveAESKey(password);

      const decipher = createDecipheriv(this.ENCRYPTION_ALGO, key, iv);

      let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new BadRequestException(
        'Failed to decrypt the message. It may be corrupted or the password is incorrect.',
      );
    }
  }

  public async readMessage(
    uuid: string,
    dto: ReadMessageDto,
  ): Promise<ReadMessageResponseDto> {
    const message = await this.prisma.message.findUnique({
      where: { uuid },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    if (message.validUntil && new Date() > message.validUntil) {
      await this.prisma.message.delete({ where: { uuid } });
      throw new BadRequestException('Message has expired.');
    }

    if (message.password) {
      if (!dto.password) {
        throw new ForbiddenException(
          'Password is required to read this message.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        dto.password,
        message.password,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Incorrect password.');
      }
    }

    const decryptedMessage = this.decryptWithAES(
      message.encryptedMessage,
      dto.password,
    );
    await this.prisma.message.delete({ where: { uuid } });
    const responseDto = new ReadMessageResponseDto({
      secretMessage: decryptedMessage,
      ...message,
    });
    return responseDto;
  }

  public async getMessageMetadata(uuid: string): Promise<MessageMetadataDto> {
    const message = await this.prisma.message.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        password: true,
        validUntil: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    if (message.validUntil && new Date() > message.validUntil) {
      await this.prisma.message.delete({ where: { uuid } });
      throw new BadRequestException('Message has expired.');
    }

    const metadataDto = new MessageMetadataDto({
      uuid: message.uuid,
      validUntil: message.validUntil,
      isPasswordProtected: !!message.password,
    });

    return metadataDto;
  }

  async getUserMessages(
    userId: number,
    query: GetUserMessagesDto,
  ): Promise<{
    items: UserMessageResponseDto[];
    totalCount: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      validUntilBefore,
      validUntilAfter,
    } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = { userId };
    if (validUntilBefore || validUntilAfter) {
      where.validUntil = {};
      if (validUntilBefore) {
        where.validUntil.lt = new Date(validUntilBefore);
      }
      if (validUntilAfter) {
        where.validUntil.gt = new Date(validUntilAfter);
      }
    }

    const orderBy = { [sortBy]: sortDirection };

    const [messages, totalCount] = await Promise.all([
      this.prisma.message.findMany({ where, orderBy, skip, take }),
      this.prisma.message.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);
    const mappedMesages = messages.map(
      (message) => new UserMessageResponseDto(message),
    );
    return { items: mappedMesages, totalCount, totalPages };
  }

  async deleteMessage(uuid: string): Promise<void> {
    const message = await this.prisma.message.findUnique({ where: { uuid } });
    if (!message) {
      throw new NotFoundException('Message not found.');
    }
    await this.prisma.message.delete({ where: { uuid } });
  }
}
