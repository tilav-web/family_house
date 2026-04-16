import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from '../common/decorators/public.decorator';
import {
  createImageUploadOptions,
  createPanoramaUploadOptions,
} from '../common/storage/upload.util';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreatePanoramaSceneDto } from './dto/create-panorama-scene.dto';
import { UpdatePanoramaSceneDto } from './dto/update-panorama-scene.dto';
import { CreatePanoramaHotspotDto } from './dto/create-panorama-hotspot.dto';
import { UpdatePanoramaHotspotDto } from './dto/update-panorama-hotspot.dto';

@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('admin')
  async findAllAdmin() {
    return this.roomsService.findAllAdmin();
  }

  @Get('admin/:id')
  async findOneAdmin(@Param('id') id: string) {
    return this.roomsService.findOneAdmin(id);
  }

  @Public()
  @Get()
  async findAllPublic() {
    return this.roomsService.findAllPublic();
  }

  @Public()
  @Get(':id')
  async findOnePublic(@Param('id') id: string) {
    return this.roomsService.findOnePublic(id);
  }

  @Post('admin')
  async create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Patch('admin/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Delete('admin/:id')
  async remove(@Param('id') id: string) {
    await this.roomsService.remove(id);
    return { message: 'Room deleted successfully' };
  }

  @Post('admin/:id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, createImageUploadOptions('images')),
  )
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.roomsService.addImages(id, files ?? []);
  }

  @Delete('admin/:id/images/:imageId')
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    await this.roomsService.removeImage(id, imageId);
    return { message: 'Image deleted successfully' };
  }

  @Patch('admin/:id/images/reorder')
  async reorderImages(
    @Param('id') id: string,
    @Body() payload: { imageIds: string[] },
  ) {
    await this.roomsService.reorderImages(id, payload.imageIds ?? []);
    return { message: 'Images reordered successfully' };
  }

  @Post('admin/:id/scenes')
  async createScene(
    @Param('id') id: string,
    @Body() dto: CreatePanoramaSceneDto,
  ) {
    return this.roomsService.createScene(id, dto);
  }

  @Patch('admin/:id/scenes/:sceneId')
  async updateScene(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @Body() dto: UpdatePanoramaSceneDto,
  ) {
    return this.roomsService.updateScene(id, sceneId, dto);
  }

  @Delete('admin/:id/scenes/:sceneId')
  async removeScene(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
  ) {
    await this.roomsService.removeScene(id, sceneId);
    return { message: 'Scene deleted successfully' };
  }

  @Post('admin/:id/scenes/:sceneId/panorama')
  @UseInterceptors(
    FileInterceptor('file', createPanoramaUploadOptions('panoramas')),
  )
  async uploadScenePanorama(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Panorama image is required');
    }

    return this.roomsService.uploadScenePanorama(id, sceneId, file);
  }

  @Post('admin/:id/scenes/:sceneId/thumbnail')
  @UseInterceptors(
    FileInterceptor('file', createImageUploadOptions('scene-thumbnails')),
  )
  async uploadSceneThumbnail(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Scene thumbnail is required');
    }

    return this.roomsService.uploadSceneThumbnail(id, sceneId, file);
  }

  @Post('admin/:id/scenes/:sceneId/hotspots')
  async createHotspot(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @Body() dto: CreatePanoramaHotspotDto,
  ) {
    return this.roomsService.createHotspot(id, sceneId, dto);
  }

  @Patch('admin/:id/scenes/:sceneId/hotspots/:hotspotId')
  async updateHotspot(
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() dto: UpdatePanoramaHotspotDto,
  ) {
    return this.roomsService.updateHotspot(id, sceneId, hotspotId, dto);
  }

  @Delete('admin/:id/scenes/:sceneId/hotspots/:hotspotId')
  async removeHotspot(
    @Param('sceneId') sceneId: string,
    @Param('hotspotId') hotspotId: string,
  ) {
    await this.roomsService.removeHotspot(sceneId, hotspotId);
    return { message: 'Hotspot deleted successfully' };
  }
}
