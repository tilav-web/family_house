import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Body,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import {
  createImageUploadOptions,
  createVideoUploadOptions,
} from '../common/storage/upload.util';
import { HotelInfoService } from './hotel-info.service';
import { UpdateHotelInfoDto } from './dto/update-hotel-info.dto';

@Controller('api/hotel-info')
export class HotelInfoController {
  constructor(private readonly hotelInfoService: HotelInfoService) {}

  @Public()
  @Get()
  async getInfo() {
    return this.hotelInfoService.getInfo();
  }

  @Patch()
  async updateInfo(@Body() updateDto: UpdateHotelInfoDto) {
    return this.hotelInfoService.updateInfo(updateDto);
  }

  @Post('upload-about-image')
  @UseInterceptors(FileInterceptor('file', createImageUploadOptions('images')))
  async uploadAboutImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('About image is required');
    }

    const imageUrl = `/uploads/images/${file.filename}`;
    return this.hotelInfoService.updateImage(imageUrl);
  }

  @Post('upload-hero-desktop')
  @UseInterceptors(FileInterceptor('file', createVideoUploadOptions('videos')))
  async uploadHeroDesktop(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Desktop video is required');
    }

    const videoUrl = `/uploads/videos/${file.filename}`;
    return this.hotelInfoService.updateHeroVideoDesktop(videoUrl);
  }

  @Post('upload-hero-mobile')
  @UseInterceptors(FileInterceptor('file', createVideoUploadOptions('videos')))
  async uploadHeroMobile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Mobile video is required');
    }

    const videoUrl = `/uploads/videos/${file.filename}`;
    return this.hotelInfoService.updateHeroVideoMobile(videoUrl);
  }
}
