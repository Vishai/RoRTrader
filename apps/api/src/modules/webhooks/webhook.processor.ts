import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WebhooksService } from './webhooks.service';

interface WebhookJobData {
  webhookLogId: string;
  botId: string;
  signal: any;
}

@Processor('webhook-processing')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Process('process-webhook')
  async handleWebhook(job: Job<WebhookJobData>) {
    const { webhookLogId, botId, signal } = job.data;
    
    this.logger.log(`Processing webhook ${webhookLogId} for bot ${botId}`);
    
    try {
      const result = await this.webhooksService.processWebhookWithIndicators(webhookLogId);
      
      this.logger.log(`Webhook processed: ${result.traded ? 'TRADED' : 'NO TRADE'}`);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`, error.stack);
      throw error;
    }
  }
}
