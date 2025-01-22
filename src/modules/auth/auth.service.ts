import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db/prisma.service';
import { hash, verify } from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { Tokens } from 'src/interfaces/tokens.interface';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatches = await verify(user.password, dto.password);

      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.getTokens(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(dto: RegisterDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (userExists) {
        throw new BadRequestException('Email already registered');
      }

      const hashedPassword = await hash(dto.password.toString());
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          username: dto.email,
          role: 'SELLER',
        },
      });

      const tokens = await this.getTokens(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        ...tokens,
      };
    } catch (error) {
      console.error('Register error:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async refreshToken(token: string): Promise<Tokens> {
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const decoded = await this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.getTokens(user.id, user.email);
      return tokens;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getTokens(userId: string, email: string): Promise<Tokens> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
          },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '15m',
          },
        ),
        this.jwtService.signAsync(
          {
            sub: userId,
            email,
          },
          {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
          },
        ),
      ]);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new InternalServerErrorException('Failed to generate tokens');
    }
  }
}
