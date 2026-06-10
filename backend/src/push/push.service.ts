import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type PushNotificationPayload = {
  title: string;
  body: string;
  url?: string;
  module?: string;
  entityId?: string;
  entityType?: string;
};

@Injectable()
export class PushService {
  constructor(private readonly prisma: PrismaService) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject =
      process.env.VAPID_SUBJECT || 'mailto:admin@sampsolucoes.com.br';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    }
  }

  async subscribe(
    userId: string,
    subscription: PushSubscriptionPayload,
    userAgent?: string,
  ) {
    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      throw new BadRequestException('Inscrição push inválida.');
    }

    return this.prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
    });
  }

  private inferModule(notification: PushNotificationPayload) {
    const searchableText = `
      ${notification.module || ''}
      ${notification.title || ''}
      ${notification.body || ''}
      ${notification.url || ''}
    `.toLowerCase();

    if (notification.module) return notification.module;
    if (searchableText.includes('escala')) return 'SCALES';
    if (searchableText.includes('ordem de missão')) return 'MISSION_ORDER';
    if (searchableText.includes('missão')) return 'MISSION_ORDER';
    if (searchableText.includes('sorteio')) return 'DRAWS';
    if (searchableText.includes('/dashboard/matches')) return 'MATCHES';
    if (searchableText.includes('/dashboard/inventory')) return 'INVENTORY';
    if (searchableText.includes('/dashboard/lbcd-shipping')) return 'LAB_SHIPPING';
    if (searchableText.includes('comunicado')) return 'ANNOUNCEMENTS';

    return 'PUSH';
  }

  private getLogStatus(total: number, sent: number, failed: number) {
    if (total === 0) return 'NO_SUBSCRIPTION';
    if (failed === 0 && sent > 0) return 'SENT';
    if (sent > 0 && failed > 0) return 'PARTIAL';
    return 'FAILED';
  }

  private async createPushLog(params: {
    userId: string;
    notification: PushNotificationPayload;
    total: number;
    sent: number;
    failed: number;
    error?: string | null;
  }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: params.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await this.prisma.pushNotificationLog.create({
        data: {
          userId: user?.id || params.userId,
          userName: user?.name || null,
          userEmail: user?.email || null,
          userRole: user?.role ? String(user.role) : null,
          title: params.notification.title,
          message: params.notification.body,
          url: params.notification.url || '/dashboard',
          module: this.inferModule(params.notification),
          entityId: params.notification.entityId || null,
          entityType: params.notification.entityType || null,
          status: this.getLogStatus(params.total, params.sent, params.failed),
          error: params.error || null,
          subscriptionCount: params.total,
          sentCount: params.sent,
          failedCount: params.failed,
        },
      });
    } catch (error) {
      console.warn('Não foi possível registrar o log da notificação push.', error);
    }
  }

  async sendToUser(userId: string, notification: PushNotificationPayload) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      url: notification.url || '/dashboard',
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (item) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: item.endpoint,
              keys: {
                p256dh: item.p256dh,
                auth: item.auth,
              },
            },
            payload,
          );

          return {
            id: item.id,
            status: 'sent',
          };
        } catch (error: any) {
          const statusCode = error?.statusCode;

          if (statusCode === 404 || statusCode === 410) {
            await this.prisma.pushSubscription.delete({
              where: {
                id: item.id,
              },
            });
          }

          return {
            id: item.id,
            status: 'failed',
            statusCode,
            error: error?.message || 'Falha ao enviar push.',
          };
        }
      }),
    );

    const sent = results.filter(
      (result) =>
        result.status === 'fulfilled' &&
        result.value.status === 'sent',
    ).length;

    const failed = results.filter(
      (result) =>
        result.status === 'rejected' ||
        (result.status === 'fulfilled' &&
          result.value.status === 'failed'),
    ).length;

    const firstError = results.find(
      (result) =>
        result.status === 'rejected' ||
        (result.status === 'fulfilled' && result.value.status === 'failed'),
    );

    const errorMessage =
      firstError?.status === 'rejected'
        ? firstError.reason?.message || 'Falha ao enviar push.'
        : firstError?.status === 'fulfilled'
          ? firstError.value.error ||
            (firstError.value.statusCode
              ? `Falha ao enviar push. Status ${firstError.value.statusCode}.`
              : 'Falha ao enviar push.')
          : subscriptions.length === 0
            ? 'Usuário sem inscrição ativa para receber notificações push.'
            : null;

    await this.createPushLog({
      userId,
      notification,
      total: subscriptions.length,
      sent,
      failed,
      error: errorMessage,
    });

    return {
      total: subscriptions.length,
      sent,
      failed,
    };
  }

  async sendTest(userId: string) {
    return this.sendToUser(userId, {
      title: 'Controle de Doping',
      body: 'Notificação de teste enviada com sucesso.',
      url: '/dashboard',
      module: 'TEST',
    });
  }
}

