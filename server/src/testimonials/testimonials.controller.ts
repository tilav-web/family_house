import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import { createImageUploadOptions } from '../common/storage/upload.util';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Controller('api/testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get('admin')
  async findAllAdmin() {
    return this.testimonialsService.findAll(true);
  }

  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Public()
  @Get()
  async findAll() {
    return this.testimonialsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Post('admin')
  async create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
  }

  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, dto);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.testimonialsService.remove(id);
    return { message: 'Testimonial deleted successfully' };
  }

  @Post('admin/:id/photo')
  @UseInterceptors(FileInterceptor('file', createImageUploadOptions('images')))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Photo is required');
    }

    const photoUrl = `/uploads/images/${file.filename}`;
    return this.testimonialsService.updatePhoto(id, photoUrl);
  }

  @Patch('admin/reorder')
  async reorder(@Body() { ids }: { ids: string[] }) {
    await this.testimonialsService.reorder(ids);
    return { message: 'Testimonials reordered successfully' };
  }
}
