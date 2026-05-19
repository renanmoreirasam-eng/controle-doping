import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }
}