import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/entities/room.entity';
import { News } from '../news/news.entity';
import { Service } from '../services/service.entity';
import { Testimonial } from '../testimonials/testimonial.entity';
import { Video } from '../videos/video.entity';
import { Contact } from '../contacts/contact.entity';
import { StatsController } from './stats.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      News,
      Service,
      Testimonial,
      Video,
      Contact,
    ]),
  ],
  controllers: [StatsController],
})
export class StatsModule {}
