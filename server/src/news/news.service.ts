import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './news.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { deleteUploadedFile } from '../common/storage/upload.util';
import { pickSlugSource, slugify } from '../common/utils/slugify.util';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  async findOne(idOrSlug: string, includeDrafts = false): Promise<News> {
    const isUuid = UUID_REGEX.test(idOrSlug);
    const where = isUuid
      ? includeDrafts
        ? { id: idOrSlug }
        : { id: idOrSlug, isPublished: true }
      : includeDrafts
        ? { slug: idOrSlug }
        : { slug: idOrSlug, isPublished: true };
    const news = await this.newsRepository.findOne({ where });
    if (!news) {
      throw new NotFoundException(`News ${idOrSlug} not found`);
    }
    return news;
  }

  async create(dto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create(dto);
    news.slug = await this.generateUniqueSlug(pickSlugSource(news.title), null);
    return this.newsRepository.save(news);
  }

  async update(id: string, dto: UpdateNewsDto): Promise<News> {
    const news = await this.findOne(id, true);
    const previousTitleSource = pickSlugSource(news.title);
    Object.assign(news, dto);
    const nextTitleSource = pickSlugSource(news.title);
    if (!news.slug || previousTitleSource !== nextTitleSource) {
      news.slug = await this.generateUniqueSlug(nextTitleSource, news.id);
    }
    return this.newsRepository.save(news);
  }

  async remove(id: string): Promise<void> {
    const news = await this.findOne(id, true);
    const thumbnailUrl = news.thumbnailUrl;
    await this.newsRepository.remove(news);
    await deleteUploadedFile(thumbnailUrl);
  }

  async updateThumbnail(id: string, url: string): Promise<News> {
    const news = await this.findOne(id, true);
    const previousUrl = news.thumbnailUrl;
    news.thumbnailUrl = url;
    const saved = await this.newsRepository.save(news);
    if (previousUrl && previousUrl !== url) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  private async generateUniqueSlug(
    source: string,
    excludeId: string | null,
  ): Promise<string> {
    const base = slugify(source) || 'news';
    let candidate = base;
    let counter = 2;
    while (true) {
      const existing = await this.newsRepository.findOne({
        where: { slug: candidate },
        select: { id: true, slug: true },
      });
      if (!existing || existing.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${counter}`;
      counter += 1;
    }
  }
}
