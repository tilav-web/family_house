import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { HotelInfoModule } from './hotel-info/hotel-info.module';
import { ServicesModule } from './services/services.module';
import { RoomsModule } from './rooms/rooms.module';
import { NewsModule } from './news/news.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { VideosModule } from './videos/videos.module';
import { ContactsModule } from './contacts/contacts.module';
import { StatsModule } from './stats/stats.module';
import { BotModule } from './bot/bot.module';
import { getUploadsRoot } from './common/storage/upload.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1_000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 120 },
      { name: 'long', ttl: 3_600_000, limit: 2_000 },
    ]),
    DatabaseModule,
    BotModule,
    AdminModule,
    AuthModule,
    HotelInfoModule,
    ServicesModule,
    RoomsModule,
    NewsModule,
    TestimonialsModule,
    VideosModule,
    ContactsModule,
    StatsModule,
    ServeStaticModule.forRoot({
      rootPath: getUploadsRoot(),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
