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
    });
  }
}