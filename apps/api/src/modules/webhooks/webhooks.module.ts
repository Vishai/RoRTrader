import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookProcessor } from './webhook.processor';
import { PrismaModule } from '../../database/prisma.module';
import { BotsModule } from '../bots/bots.module';

@Module({
  imports: [
    PrismaModule,
    BotsModule,
    BullModule.registerQueue(
      {
        name: 'webhook-processing',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'trading',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }
    ),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
