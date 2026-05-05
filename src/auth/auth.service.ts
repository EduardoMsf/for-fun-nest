import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !bcryptjs.compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _pw, ...userData } = user;
    return { token: this.signToken(userData), user: userData };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        password: bcryptjs.hashSync(dto.password, 10),
      },
    });

    const { password: _pw, ...userData } = user;
    return { token: this.signToken(userData), user: userData };
  }

  private signToken(user: Record<string, unknown>) {
    return this.jwt.sign({ data: user });
  }
}
