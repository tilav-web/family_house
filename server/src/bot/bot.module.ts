import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BotSettings } from './bot-settings.entity';
import { BotSettingsController } from './bot-settings.controller';
import { BotSettingsService } from './bot-settings.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BotSettings])],
  controllers: [BotController, BotSettingsController],
  providers: [BotService, BotSettingsService],
  exports: [BotService, BotSettingsService],
})
export class BotModule {}
