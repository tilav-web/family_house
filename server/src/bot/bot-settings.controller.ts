import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { BotSettingsService, BotSettingsView } from './bot-settings.service';
import { BotService } from './bot.service';
import { UpdateBotSettingsDto } from './dto/update-bot-settings.dto';

@Controller('api/admin/bot-settings')
export class BotSettingsController {
  constructor(
    private readonly botSettingsService: BotSettingsService,
    private readonly botService: BotService,
  ) {}

  @Get()
  async find(): Promise<BotSettingsView> {
    return this.botSettingsService.getView();
  }

  @Patch()
  async update(
    @Body() dto: UpdateBotSettingsDto,
  ): Promise<BotSettingsView> {
    await this.botSettingsService.update(dto);
    await this.botService.reloadAndRegister();
    return this.botSettingsService.getView();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async test(): Promise<{ ok: true }> {
    const sent = await this.botService.sendMessageToChannel(
      '🧪 Test xabar — Family House admin paneldan yuborildi.',
    );
    if (!sent) {
      throw new BadRequestException(
        'Xabar yuborilmadi — token va kanal ID to\'g\'ri to\'ldirilganini tekshiring.',
      );
    }
    return { ok: true };
  }
}
