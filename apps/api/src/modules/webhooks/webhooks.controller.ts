import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Logger,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookSignalDto } from './dto/webhook-signal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Receive webhook from TradingView or other sources
   * No authentication required - security is via webhook secret
   */
  @Post('webhook/:botId/:secret')
  @HttpCode(HttpStatus.OK) // Always return 200 to acknowledge receipt
  async receiveWebhook(
    @Param('botId') botId: string,
    @Param('secret') secret: string,
    @Body() signal: WebhookSignalDto
  ) {
    this.logger.log(`Webhook received for bot ${botId}`);
    
    try {
      const result = await this.webhooksService.processWebhook(botId, secret, signal);
      return result;
    } catch (error) {
      // Log error but still return 200 to prevent webhook retries
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Webhook received but processing failed'
      };
    }
  }

  /**
   * Get webhook logs for a bot (authenticated)
   */
  @Get('api/bots/:botId/webhooks')
  @UseGuards(JwtAuthGuard)
  async getWebhookLogs(
    @Request() req,
    @Param('botId', ParseUUIDPipe) botId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.webhooksService.getWebhookLogs(
      botId,
      req.user.id,
      limit || 50
    );
  }

  /**
   * Test webhook endpoint (authenticated)
   * Allows users to test their webhook configuration
   */
  @Post('api/bots/:botId/test-webhook')
  @UseGuards(JwtAuthGuard)
  async testWebhook(
    @Request() req,
    @Param('botId', ParseUUIDPipe) botId: string,
    @Body() signal: WebhookSignalDto
  ) {
    // For testing, we'll create a test webhook signal
    // In production, this would verify ownership and use the actual webhook secret
    return {
      success: true,
      message: 'Test webhook endpoint - implementation pending',
      signal
    };
  }
}
