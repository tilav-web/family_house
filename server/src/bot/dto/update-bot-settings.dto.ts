import { IsOptional, IsString } from 'class-validator';

export class UpdateBotSettingsDto {
  @IsString()
  @IsOptional()
  botToken?: string;

  @IsString()
  @IsOptional()
  channelId?: string;

  @IsString()
  @IsOptional()
  webhookSecret?: string;
}
