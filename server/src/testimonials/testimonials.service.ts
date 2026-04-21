import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { deleteUploadedFile } from '../common/storage/upload.util';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepository: Repository<Testimonial>,
  ) {}

  async findAll(includeInactive = false): Promise<Testimonial[]> {
    return this.testimonialRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Testimonial> {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with id ${id} not found`);
    }
    return testimonial;
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const testimonial = this.testimonialRepository.create(dto);
    return this.testimonialRepository.save(testimonial);
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    Object.assign(testimonial, dto);
    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.findOne(id);
    const photoUrl = testimonial.authorPhotoUrl;
    await this.testimonialRepository.remove(testimonial);
    await deleteUploadedFile(photoUrl);
  }

  async updatePhoto(id: string, url: string): Promise<Testimonial> {
    const testimonial = await this.findOne(id);
    const previousUrl = testimonial.authorPhotoUrl;
    testimonial.authorPhotoUrl = url;
    const saved = await this.testimonialRepository.save(testimonial);
    if (previousUrl && previousUrl !== url) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async reorder(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.testimonialRepository.update(ids[i], { order: i });
    }
  }
}
