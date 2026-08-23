import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private getAuthenticatedUserId(user: any) {
    return String(
      user?.id ||
        user?.userId ||
        user?.sub ||
        user?.user?.id ||
        user?.user?.userId ||
        '',
    ).trim();
  }

  private getAuthenticatedUserRole(user: any) {
    return String(user?.role || user?.user?.role || '')
      .trim()
      .toUpperCase();
  }

  private validateNewPassword(
    newPassword: string,
    confirmPassword: string,
  ) {
    const normalizedNewPassword = String(newPassword || '');
    const normalizedConfirmPassword = String(confirmPassword || '');

    if (!normalizedNewPassword) {
      throw new BadRequestException('Informe a nova senha.');
    }

    if (normalizedNewPassword.length < 8) {
      throw new BadRequestException(
        'A nova senha deve possuir no mínimo 8 caracteres.',
      );
    }

    if (normalizedNewPassword !== normalizedConfirmPassword) {
      throw new BadRequestException(
        'A confirmação da nova senha não confere.',
      );
    }

    return normalizedNewPassword;
  }

  async changeMyPassword(
    authenticatedUser: any,
    data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    const userId = this.getAuthenticatedUserId(authenticatedUser);

    if (!userId) {
      throw new UnauthorizedException(
        'Não foi possível identificar o usuário autenticado.',
      );
    }

    const currentPassword = String(data.currentPassword || '');

    if (!currentPassword) {
      throw new BadRequestException('Informe a senha atual.');
    }

    const newPassword = this.validateNewPassword(
      data.newPassword,
      data.confirmPassword,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!currentPasswordMatches) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password,
    );

    if (samePassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    return {
      message: 'Senha alterada com sucesso.',
    };
  }

  async resetPassword(
    targetUserId: string,
    authenticatedUser: any,
    data: {
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    const authenticatedUserRole =
      this.getAuthenticatedUserRole(authenticatedUser);

    if (authenticatedUserRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Somente administradores podem redefinir a senha de outros usuários.',
      );
    }

    const normalizedTargetUserId = String(targetUserId || '').trim();

    if (!normalizedTargetUserId) {
      throw new BadRequestException('Usuário inválido.');
    }

    const newPassword = this.validateNewPassword(
      data.newPassword,
      data.confirmPassword,
    );

    const targetUser = await this.prisma.user.findUnique({
      where: { id: normalizedTargetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      targetUser.password,
    );

    if (samePassword) {
      throw new BadRequestException(
        'A nova senha deve ser diferente da senha atual do usuário.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: targetUser.id },
      data: { password: passwordHash },
    });

    return {
      message: 'Senha redefinida com sucesso.',
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    };
  }
}
