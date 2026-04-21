import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelInfo } from './hotel-info.entity';
import { UpdateHotelInfoDto } from './dto/update-hotel-info.dto';
import type { I18nField } from '../common/types/i18n-field.type';
import { deleteUploadedFile } from '../common/storage/upload.util';

@Injectable()
export class HotelInfoService {
  constructor(
    @InjectRepository(HotelInfo)
    private readonly hotelInfoRepository: Repository<HotelInfo>,
  ) {}

  async getInfo(): Promise<HotelInfo> {
    let info = await this.hotelInfoRepository.findOne({ where: {} });
    if (!info) {
      // Create default if not exists
      const defaultI18n: I18nField = { uz: '', ru: '', en: '' };
      info = this.hotelInfoRepository.create({
        description: defaultI18n,
        heroText: defaultI18n,
        heroSubtext: defaultI18n,
      });
      await this.hotelInfoRepository.save(info);
    }
    return info;
  }

  async updateInfo(updateDto: UpdateHotelInfoDto): Promise<HotelInfo> {
    const info = await this.getInfo();
    Object.assign(info, updateDto);
    return this.hotelInfoRepository.save(info);
  }

  async updateImage(imageUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    const previousUrl = info.imageUrl;
    info.imageUrl = imageUrl;
    const saved = await this.hotelInfoRepository.save(info);
    if (previousUrl && previousUrl !== imageUrl) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async updateHeroVideoDesktop(videoUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    const previousUrl = info.heroVideoDesktop;
    info.heroVideoDesktop = videoUrl;
    const saved = await this.hotelInfoRepository.save(info);
    if (previousUrl && previousUrl !== videoUrl) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async updateHeroVideoMobile(videoUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    const previousUrl = info.heroVideoMobile;
    info.heroVideoMobile = videoUrl;
    const saved = await this.hotelInfoRepository.save(info);
    if (previousUrl && previousUrl !== videoUrl) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async updateHeroPosterDesktop(imageUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    const previousUrl = info.heroPosterDesktop;
    info.heroPosterDesktop = imageUrl;
    const saved = await this.hotelInfoRepository.save(info);
    if (previousUrl && previousUrl !== imageUrl) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }

  async updateHeroPosterMobile(imageUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    const previousUrl = info.heroPosterMobile;
    info.heroPosterMobile = imageUrl;
    const saved = await this.hotelInfoRepository.save(info);
    if (previousUrl && previousUrl !== imageUrl) {
      await deleteUploadedFile(previousUrl);
    }
    return saved;
  }
}
