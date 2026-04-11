import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async findAll(page: number = 1, limit: number = 10, includeDrafts = false) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.newsRepository.findAndCount({
      where: includeDrafts ? {} : { isPublished: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, includeDrafts = false): Promise<News> {
    const news = await this.newsRepository.findOne({
      where: includeDrafts ? { id } : { id, isPublished: true },
    });
    if (!news) {
      throw new NotFoundException(`News with id ${id} not found`);
    }
    return news;
  }

  async create(dto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(dto);
    return this.newsRepository.save(news);
  }

  async update(id: string, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findOne(id, true);
    Object.assign(news, dto);
    return this.newsRepository.save(news);
  }

  async remove(id: string): Promise<void> {
    const news = await this.findOne(id, true);
    await this.newsRepository.remove(news);
  }

  async updateThumbnail(id: string, url: string): Promise<News> {
    const news = await this.findOne(id, true);
    news.thumbnailUrl = url;
    return this.newsRepository.save(news);
  }
}
