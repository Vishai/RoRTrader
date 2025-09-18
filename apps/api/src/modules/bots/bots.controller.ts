import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseEnumPipe,
  BadRequestException
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { CreateBotDto, UpdateBotDto, BotResponse, BotListResponse } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BotStatus } from '@prisma/client';

@Controller('api/bots')
@UseGuards(JwtAuthGuard)
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  /**
   * Create a new bot
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req,
    @Body() createBotDto: CreateBotDto
  ): Promise<BotResponse> {
    return this.botsService.create(req.user.id, createBotDto);
  }

  /**
   * Get all bots for the authenticated user
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status', new ParseEnumPipe(BotStatus, { optional: true })) status?: BotStatus
  ): Promise<BotListResponse> {
    return this.botsService.findAll(
      req.user.id,
      page || 1,
      limit || 10,
      status
    );
  }

  /**
   * Get a specific bot by ID
   */
  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<BotResponse> {
    return this.botsService.findOne(id, req.user.id);
  }

  /**
   * Update a bot
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBotDto: UpdateBotDto
  ): Promise<BotResponse> {
    return this.botsService.update(id, req.user.id, updateBotDto);
  }

  /**
   * Delete a bot
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    return this.botsService.remove(id, req.user.id);
  }

  /**
   * Start/stop a bot
   */
  @Post(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status', new ParseEnumPipe(BotStatus)) status: BotStatus
  ): Promise<BotResponse> {
    return this.botsService.updateStatus(id, req.user.id, status);
  }

  /**
   * Clone a bot
   */
  @Post(':id/clone')
  async clone(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string
  ): Promise<BotResponse> {
    if (!name) {
      throw new BadRequestException('Name is required for cloning');
    }
    return this.botsService.clone(id, req.user.id, name);
  }

  /**
   * Get bot performance metrics
   */
  @Get(':id/performance')
  async getPerformance(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // TODO: Implement performance endpoint
    // This will be implemented when we create the analytics module
    return {
      message: 'Performance endpoint coming soon',
      botId: id,
      period,
      startDate,
      endDate
    };
  }

  /**
   * Get bot trades
   */
  @Get(':id/trades')
  async getTrades(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    // TODO: Implement trades endpoint
    // This will be implemented when we create the trading module
    return {
      message: 'Trades endpoint coming soon',
      botId: id,
      page: page || 1,
      limit: limit || 50
    };
  }

  /**
   * Test bot webhook
   */
  @Post(':id/test-webhook')
  async testWebhook(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() testData: any
  ) {
    // TODO: Implement webhook testing
    // This will send a test signal to the bot's webhook
    return {
      message: 'Webhook test endpoint coming soon',
      botId: id,
      testData
    };
  }
}
