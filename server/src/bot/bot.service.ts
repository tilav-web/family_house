import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import { BotSettingsService } from './bot-settings.service';

interface LoadedSettings {
  botToken: string | null;
  channelId: string | null;
  webhookSecret: string | null;
}

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);
  private readonly apiBase = 'https://api.telegram.org';
  private cached: LoadedSettings = {
    botToken: null,
    channelId: null,
    webhookSecret: null,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly botSettingsService: BotSettingsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.reloadAndRegister();
  }

  get webhookSecret(): string | null {
    return this.cached.webhookSecret;
  }

  async reloadAndRegister(): Promise<void> {
    await this.loadSettings();

    if (!this.cached.botToken) {
      this.logger.warn('Bot token is not configured — skipping webhook registration.');
      return;
    }

    const webhookUrl = this.buildWebhookUrl();
    if (!webhookUrl) {
      this.logger.warn(
        'SERVER_PUBLIC_URL is not set — webhook will not be registered.',
      );
      return;
    }

    try {
      const body: Record<string, unknown> = {
        url: webhookUrl,
        allowed_updates: ['message', 'channel_post'],
      };
      if (this.cached.webhookSecret) {
        body.secret_token = this.cached.webhookSecret;
      }

      const res = await this.callApi(this.cached.botToken, 'setWebhook', body);
      this.logger.log(
        `Telegram webhook registered: ${webhookUrl} (ok=${res.ok})`,
      );
    } catch (err) {
      this.logger.error('Failed to register Telegram webhook', err as Error);
    }
  }

  async handleUpdate(update: unknown): Promise<void> {
    const chat = this.extractChat(update);
    if (chat) {
      this.logger.log(
        `Telegram chat detected → id=${chat.id}, type=${chat.type}, title=${chat.title ?? chat.username ?? '-'}`,
      );
    } else {
      this.logger.debug(`Telegram update: ${JSON.stringify(update)}`);
    }
  }

  async sendMessageToChannel(text: string): Promise<boolean> {
    if (!this.cached.botToken) {
      await this.loadSettings();
    }

    const { botToken, channelId } = this.cached;
    if (!botToken || !channelId) {
      this.logger.warn(
        'Cannot send message — bot token or channel ID is missing.',
      );
      return false;
    }

    try {
      await this.callApi(botToken, 'sendMessage', {
        chat_id: channelId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      return true;
    } catch (err) {
      this.logger.error('Failed to send Telegram message', err as Error);
      return false;
    }
  }

  private async loadSettings(): Promise<void> {
    const settings = await this.botSettingsService.getOrCreate();
    this.cached = {
      botToken: settings.botToken,
      channelId: settings.channelId,
      webhookSecret: settings.webhookSecret,
    };
  }

  private buildWebhookUrl(): string | null {
    const base = this.configService.get<AppConfig['serverPublicUrl']>(
      'serverPublicUrl',
    );
    if (!base) return null;
    const trimmed = base.replace(/\/+$/, '');
    return `${trimmed}/api/bot/webhook`;
  }

  private extractChat(update: unknown): {
    id: number | string;
    type: string;
    title?: string;
    username?: string;
  } | null {
    if (!update || typeof update !== 'object') return null;
    const u = update as Record<string, any>;
    const source =
      u.channel_post ??
      u.edited_channel_post ??
      u.message ??
      u.edited_message ??
      u.my_chat_member ??
      u.chat_member;
    const chat = source?.chat;
    if (!chat || typeof chat.id === 'undefined') return null;
    return {
      id: chat.id,
      type: chat.type,
      title: chat.title,
      username: chat.username,
    };
  }

  private async callApi(
    token: string,
    method: string,
    body: Record<string, unknown>,
  ): Promise<{ ok: boolean; result?: unknown; description?: string }> {
    const response = await fetch(`${this.apiBase}/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as {
      ok: boolean;
      result?: unknown;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(`Telegram API ${method} failed: ${data.description}`);
    }
    return data;
  }
}
