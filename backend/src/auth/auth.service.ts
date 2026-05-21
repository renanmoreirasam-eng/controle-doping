import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const userExists = await this.usersService.findByEmail(data.email);

    if (userExists) {
      throw new UnauthorizedException('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async login(data: {
    email: string;
    password: string;
  }) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const official = await this.prisma.official.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (official && official.active === false) {
      throw new UnauthorizedException(
        'Usuário inativo. Acesso bloqueado.',
      );
    }

    const payload = {
      sub: user.id,
      id: user.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}