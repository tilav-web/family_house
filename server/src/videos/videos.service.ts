import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { deleteUploadedFile } from '../common/storage/upload.util';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async findAll(includeInactive = false): Promise<Video[]> {
    return this.videoRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video with id ${id} not found`);
    }
    return video;
  }

  async create(dto: CreateVideoDto): Promise<Video> {
    const video = this.videoRepository.create(dto);
    return this.videoRepository.save(video);
  }

  async update(id: string, dto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id);
    Object.assign(video, dto);
    return this.videoRepository.save(video);
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);
    const thumbnailUrl = video.thumbnailUrl;
    const previewVideoUrl = video.previewVideoUrl;
    await this.videoRepository.remove(video);
    await deleteUploadedFile(thumbnailUrl);
    await deleteUploadedFile(previewVideoUrl);
  }

  async updateThumbnail(id: string, url: string): Promise<Video> {
    const video = await this.findOne(id);
    const previousUrl = video.thumbnailUrl;
    video.thumbnailUrl = url;
    const saved = await this.videoRepository.save(video);
    if (previousUrl && previousUrl !== url) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async updatePreviewVideo(id: string, url: string): Promise<Video> {
    const video = await this.findOne(id);
    const previousUrl = video.previewVideoUrl;
    video.previewVideoUrl = url;
    const saved = await this.videoRepository.save(video);
    if (previousUrl && previousUrl !== url) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async reorder(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.videoRepository.update(ids[i], { order: i });
    }
  }
}
