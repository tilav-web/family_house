import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { News } from '../news/news.entity';
import { Service } from '../services/service.entity';
import { Testimonial } from '../testimonials/testimonial.entity';
import { Video } from '../videos/video.entity';
import { Contact } from '../contacts/contact.entity';

@Controller()
export class StatsController {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Testimonial)
    private testimonialsRepository: Repository<Testimonial>,
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  @Get('api/admin/stats')
  async getStats() {
    const [
      rooms,
      news,
      services,
      testimonials,
      videos,
      contacts,
      unreadContacts,
    ] = await Promise.all([
      this.roomsRepository.count(),
      this.newsRepository.count(),
      this.servicesRepository.count(),
      this.testimonialsRepository.count(),
      this.videosRepository.count(),
      this.contactsRepository.count(),
      this.contactsRepository.count({ where: { isRead: false } }),
    ]);

    return {
      rooms,
      news,
      services,
      testimonials,
      videos,
      contacts,
      totalRooms: rooms,
      totalNews: news,
      totalServices: services,
      totalTestimonials: testimonials,
      totalVideos: videos,
      totalContacts: contacts,
      unreadContacts,
    };
  }
}
