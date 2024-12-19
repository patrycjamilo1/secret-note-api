/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionMessages } from 'src/common/validation/messages.validation';
import { SafeUser } from './dto/safe-user.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updateUserFields: {
        email?: string;
        login?: string;
        hash?: string;
        image?: string;
      } = {
        email: updateUserDto.email,
        image: updateUserDto.image,
      };
      if (updateUserDto.password) {
        updateUserFields.hash = await this.authService.hashData(
          updateUserDto.password,
        );
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserFields,
      });
      const safeUser = new SafeUser(updatedUser);
      return safeUser;
    } catch (ex) {
      throw new ConflictException(ExceptionMessages.EmailExists);
    }
  }

  async getSingleUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} was not found`);
    }
    return new SafeUser(user);
  }
}
