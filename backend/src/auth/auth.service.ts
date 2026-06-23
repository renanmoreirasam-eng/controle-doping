import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

const PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES = 60;
const MIN_PASSWORD_LENGTH = 6;

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

  async forgotPassword(data: { email: string }) {
    const email = this.normalizeEmail(data.email);

    if (!email) {
      throw new BadRequestException('Informe o e-mail para recuperar a senha.');
    }

    const genericResponse = {
      message:
        'Se o e-mail estiver cadastrado, enviaremos um link para redefinição de senha.',
    };

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return genericResponse;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(token);
    const expiresAt = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
    );

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = this.buildResetPasswordUrl(token);

    await this.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return genericResponse;
  }

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) {
    const token = String(data.token || '').trim();
    const password = String(data.password || '');
    const confirmPassword = String(data.confirmPassword || '');

    if (!token) {
      throw new BadRequestException('Link de recuperação inválido.');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('A confirmação da senha não confere.');
    }

    const tokenHash = this.hashResetToken(token);

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken || resetToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Link de recuperação inválido ou expirado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return {
      message: 'Senha redefinida com sucesso. Você já pode acessar o sistema.',
    };
  }

  private normalizeEmail(email: string) {
    return String(email || '').trim().toLowerCase();
  }

  private hashResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildResetPasswordUrl(token: string) {
    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    return `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
  }

  private async sendPasswordResetEmail(params: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpFrom) {
      console.warn(
        `[RECUPERAÇÃO DE SENHA] SMTP não configurado. Link para ${params.to}: ${params.resetUrl}`,
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth:
        smtpUser && smtpPass
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: params.to,
      subject: 'Recuperação de senha - Controle de Doping',
      text: [
        `Olá, ${params.name}.`,
        '',
        'Recebemos uma solicitação para redefinir sua senha no Controle de Doping.',
        `Acesse o link abaixo para criar uma nova senha. O link expira em ${PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES} minutos.`,
        '',
        params.resetUrl,
        '',
        'Se você não solicitou essa recuperação, ignore este e-mail.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
          <h2>Recuperação de senha</h2>
          <p>Olá, <strong>${params.name}</strong>.</p>
          <p>Recebemos uma solicitação para redefinir sua senha no Controle de Doping.</p>
          <p>O link abaixo expira em <strong>${PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES} minutos</strong>.</p>
          <p>
            <a href="${params.resetUrl}" style="display: inline-block; background: #004aad; color: #ffffff; padding: 12px 18px; border-radius: 12px; text-decoration: none; font-weight: bold;">
              Redefinir senha
            </a>
          </p>
          <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
          <p>${params.resetUrl}</p>
          <p>Se você não solicitou essa recuperação, ignore este e-mail.</p>
        </div>
      `,
    });
  }
}
