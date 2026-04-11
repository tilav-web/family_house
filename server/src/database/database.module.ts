import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../config/configuration';
import { Admin } from '../admin/admin.entity';
import { HotelInfo } from '../hotel-info/hotel-info.entity';
import { Service } from '../services/service.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomImage } from '../rooms/entities/room-image.entity';
import { PanoramaScene } from '../rooms/entities/panorama-scene.entity';
import { PanoramaHotspot } from '../rooms/entities/panorama-hotspot.entity';
import { News } from '../news/news.entity';
import { Testimonial } from '../testimonials/testimonial.entity';
import { Video } from '../videos/video.entity';
import { Contact } from '../contacts/contact.entity';
import { SeedService } from './seed.service';

const entities = [
  Admin,
  HotelInfo,
  Service,
  Room,
  RoomImage,
  PanoramaScene,
  PanoramaHotspot,
  News,
  Testimonial,
  Video,
  Contact,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const dbConfig =
          configService.getOrThrow<AppConfig['database']>('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          schema: 'public',
          entities,
          synchronize: true, // development only; use migrations for production
          logging: process.env.NODE_ENV !== 'production',
        };
      },
    }),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
