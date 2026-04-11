import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomImage } from './entities/room-image.entity';
import { PanoramaScene } from './entities/panorama-scene.entity';
import { PanoramaHotspot } from './entities/panorama-hotspot.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomImage, PanoramaScene, PanoramaHotspot]),
  ],
  providers: [RoomsService],
  controllers: [RoomsController],
})
export class RoomsModule {}
