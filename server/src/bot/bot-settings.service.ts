import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotSettings } from './bot-settings.entity';
import { UpdateBotSettingsDto } from './dto/update-bot-settings.dto';

export interface BotSettingsView {
  botTokenMasked: string | null;
  hasBotToken: boolean;
  channelId: string | null;
  hasWebhookSecret: boolean;
  updatedAt: Date | null;
}

@Injectable()
export class BotSettingsService {
  constructor(
    @InjectRepository(BotSettings)
    private readonly repository: Repository<BotSettings>,
  ) {}

  async getOrCreate(): Promise<BotSettings> {
    const existing = await this.repository.findOne({ where: {} });
    if (existing) return existing;
    const created = this.repository.create({
      botToken: null,
      channelId: null,
      webhookSecret: null,
    });
    return this.repository.save(created);
  }

  async getView(): Promise<BotSettingsView> {
    const settings = await this.getOrCreate();
    return {
      botTokenMasked: this.maskToken(settings.botToken),
      hasBotToken: !!settings.botToken,
      channelId: settings.channelId,
      hasWebhookSecret: !!settings.webhookSecret,
      updatedAt: settings.updatedAt ?? null,
    };
  }

  async update(dto: UpdateBotSettingsDto): Promise<BotSettings> {
    const settings = await this.getOrCreate();

    if (dto.botToken !== undefined) {
      settings.botToken = dto.botToken.trim() || null;
    }
    if (dto.channelId !== undefined) {
      settings.channelId = dto.channelId.trim() || null;
    }
    if (dto.webhookSecret !== undefined) {
      settings.webhookSecret = dto.webhookSecret.trim() || null;
    }

    return this.repository.save(settings);
  }

  private maskToken(token: string | null): string | null {
    if (!token) return null;
    if (token.length <= 8) return '••••';
    return `${token.slice(0, 4)}••••${token.slice(-4)}`;
  }
}
