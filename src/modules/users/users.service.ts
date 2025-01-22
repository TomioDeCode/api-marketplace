import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        isSuccess: true,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new BadRequestException({
        isSuccess: false,
        message: 'Failed to retrieve users',
        error: 'Bad Request',
      });
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Id is required',
          error: 'Bad Request',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException({
          isSuccess: false,
          message: 'User not found',
          error: 'Not Found',
        });
      }

      return {
        isSuccess: true,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException({
        isSuccess: false,
        message: 'Failed to retrieve user',
        error: 'Bad Request',
      });
    }
  }

  async create(dto: CreateUserDto) {
    try {
      const [existingUserEmail, existingUsername] = await Promise.all([
        this.prisma.user.findUnique({
          where: { email: dto.email.toLowerCase() },
        }),
        this.prisma.user.findUnique({
          where: { username: dto.username },
        }),
      ]);

      if (existingUserEmail) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'User with this email already exists',
          error: 'Bad Request',
        });
      }

      if (existingUsername) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'User with this username already exists',
          error: 'Bad Request',
        });
      }

      const hashedPassword = await hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          ...dto,
          email: dto.email.toLowerCase(),
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        isSuccess: true,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        isSuccess: false,
        message: 'Failed to create user',
        error: 'Bad Request',
      });
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      if (!id) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Id is required',
          error: 'Bad Request',
        });
      }

      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException({
          isSuccess: false,
          message: 'User not found',
          error: 'Not Found',
        });
      }

      if (dto.email) {
        const existingUserEmail = await this.prisma.user.findFirst({
          where: {
            email: dto.email.toLowerCase(),
            NOT: { id },
          },
        });

        if (existingUserEmail) {
          throw new BadRequestException({
            isSuccess: false,
            message: 'Email already in use',
            error: 'Bad Request',
          });
        }
      }

      const updateData: Partial<UpdateUserDto> = {};

      if (dto.email) {
        updateData.email = dto.email.toLowerCase();
      }

      if (dto.username) {
        updateData.username = dto.username;
      }

      if (dto.password) {
        updateData.password = await hash(dto.password);
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'No data provided for update',
          error: 'Bad Request',
        });
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        isSuccess: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException({
        isSuccess: false,
        message: 'Failed to update user',
        error: 'Bad Request',
      });
    }
  }

  async delete(id: string) {
    try {
      if (!id) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Id is required',
          error: 'Bad Request',
        });
      }

      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException({
          isSuccess: false,
          message: 'User not found',
          error: 'Not Found',
        });
      }

      await this.prisma.user.delete({ where: { id } });

      return {
        isSuccess: true,
        message: 'User deleted successfully',
        data: null,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException({
        isSuccess: false,
        message: 'Failed to delete user',
        error: 'Bad Request',
      });
    }
  }
}
