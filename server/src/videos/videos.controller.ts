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
import {
  createImageUploadOptions,
  createVideoUploadOptions,
} from '../common/storage/upload.util';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller('api/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('admin')
  async findAllAdmin() {
    return this.videosService.findAll(true);
  }

  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Public()
  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Post('admin')
  async create(@Body() dto: CreateVideoDto) {
    return this.videosService.create(dto);
  }

  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    return this.videosService.update(id, dto);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.videosService.remove(id);
    return { message: 'Video deleted successfully' };
  }

  @Post('admin/:id/thumbnail')
  @UseInterceptors(FileInterceptor('file', createImageUploadOptions('images')))
  async uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Thumbnail image is required');
    }

    const thumbnailUrl = `/uploads/images/${file.filename}`;
    return this.videosService.updateThumbnail(id, thumbnailUrl);
  }

  @Post('admin/:id/preview-video')
  @UseInterceptors(FileInterceptor('file', createVideoUploadOptions('videos')))
  async uploadPreviewVideo(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Preview video is required');
    }

    const previewVideoUrl = `/uploads/videos/${file.filename}`;
    return this.videosService.updatePreviewVideo(id, previewVideoUrl);
  }

  @Patch('admin/reorder')
  async reorder(@Body() { ids }: { ids: string[] }) {
    await this.videosService.reorder(ids);
    return { message: 'Videos reordered successfully' };
  }
}
