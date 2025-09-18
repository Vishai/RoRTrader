import { CreateBotDto } from './create-bot.dto';
import { BotStatus } from '@prisma/client';

export interface UpdateBotDto extends Partial<CreateBotDto> {
  status?: BotStatus;
}
