import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelInfo } from './hotel-info.entity';
import { HotelInfoService } from './hotel-info.service';
import { HotelInfoController } from './hotel-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HotelInfo])],
  providers: [HotelInfoService],
  controllers: [HotelInfoController],
})
export class HotelInfoModule {}
