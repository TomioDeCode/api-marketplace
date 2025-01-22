import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db/prisma.service';
import { hash, verify } from 'argon2';
import { Tokens } from 'src/interfaces/tokens.interface';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      if (!dto || !dto.email || !dto.password || !dto.username) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Missing required fields',
          error: 'Bad Request',
        });
      }

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
          message: 'Email already registered',
          error: 'Bad Request',
        });
      }

      if (existingUsername) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Username already taken',
          error: 'Bad Request',
        });
      }

      const hashedPassword = await hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          username: dto.username,
          role: 'SELLER',
        },
      });

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        isSuccess: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
      };
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        isSuccess: false,
        message: 'Registration failed',
        error: 'Bad Request',
      });
    }
  }

  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException({
          isSuccess: false,
          message: 'Missing required fields',
          error: 'Bad Request',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Invalid credentials',
          error: 'Unauthorized',
        });
      }

      const passwordMatches = await verify(user.password, password);
      if (!passwordMatches) {
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Invalid credentials',
          error: 'Unauthorized',
        });
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        isSuccess: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          ...tokens,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        isSuccess: false,
        message: 'Login failed',
        error: 'Unauthorized',
      });
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      console.log('refreshTokens called with userId:', userId);
      console.log('refreshTokens called with refreshToken:', refreshToken);

      if (!userId || !refreshToken) {
        console.log('Missing userId or refreshToken');
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Missing required fields',
          error: 'Unauthorized',
        });
      }

      console.log('refreshToken:', refreshToken);
      console.log('userId:', userId);

      if (refreshToken.trim() === '') {
        console.log('Empty refresh token received');
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Invalid refresh token',
          error: 'Unauthorized',
        });
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Access denied',
          error: 'Unauthorized',
        });
      }

      const refreshTokenMatches = await verify(user.refreshToken, refreshToken);

      if (!refreshTokenMatches) {
        throw new UnauthorizedException({
          isSuccess: false,
          message: 'Access denied',
          error: 'Unauthorized',
        });
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        isSuccess: true,
        message: 'Token refresh successful',
        data: {
          ...tokens,
        },
      };
    } catch (error) {
      console.error('Refresh token error details:', {
        error: error.message,
        userId,
        hasRefreshToken: !!refreshToken,
      });
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException({
        isSuccess: false,
        message: 'Token refresh failed',
        error: 'Unauthorized',
      });
    }
  }

  async logout(userId: string) {
    try {
      await this.prisma.user.updateMany({
        where: {
          id: userId,
          refreshToken: {
            not: null,
          },
        },
        data: {
          refreshToken: null,
        },
      });

      return {
        isSuccess: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw new BadRequestException({
        isSuccess: false,
        message: 'Logout failed',
        error: 'Bad Request',
      });
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  private async getTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '15m',
          secret: process.env.JWT_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_SECRET,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
