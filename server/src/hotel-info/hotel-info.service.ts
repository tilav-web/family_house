import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelInfo } from './hotel-info.entity';
import { UpdateHotelInfoDto } from './dto/update-hotel-info.dto';
import type { I18nField } from '../common/types/i18n-field.type';

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
    info.imageUrl = imageUrl;
    return this.hotelInfoRepository.save(info);
  }

  async updateHeroVideoDesktop(videoUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    info.heroVideoDesktop = videoUrl;
    return this.hotelInfoRepository.save(info);
  }

  async updateHeroVideoMobile(videoUrl: string): Promise<HotelInfo> {
    const info = await this.getInfo();
    info.heroVideoMobile = videoUrl;
    return this.hotelInfoRepository.save(info);
  }
}
