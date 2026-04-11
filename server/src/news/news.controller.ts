import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import { createImageUploadOptions } from '../common/storage/upload.util';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('admin')
  async findAllAdmin(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.newsService.findAll(page, limit, true);
  }

  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    return this.newsService.findOne(id, true);
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.newsService.findAll(page, limit);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Post('admin')
  async create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.newsService.remove(id);
    return { message: 'News deleted successfully' };
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
    return this.newsService.updateThumbnail(id, thumbnailUrl);
  }
}
