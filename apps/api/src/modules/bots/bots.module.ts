import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BotsController],
  providers: [BotsService],
  exports: [BotsService], // Export for use in other modules (e.g., webhooks)
})
export class BotsModule {}
