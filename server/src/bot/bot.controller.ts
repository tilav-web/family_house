import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { BotService } from './bot.service';

@Controller('api/bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-telegram-bot-api-secret-token') secretToken: string,
    @Body() update: unknown,
  ): Promise<{ ok: true }> {
    const expected = this.botService.webhookSecret;
    if (expected && secretToken !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    await this.botService.handleUpdate(update);
    return { ok: true };
  }
}
