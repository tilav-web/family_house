import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { basename, extname, join, parse } from 'path';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomImage } from './entities/room-image.entity';
import { PanoramaScene } from './entities/panorama-scene.entity';
import { PanoramaHotspot } from './entities/panorama-hotspot.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreatePanoramaSceneDto } from './dto/create-panorama-scene.dto';
import { UpdatePanoramaSceneDto } from './dto/update-panorama-scene.dto';
import { CreatePanoramaHotspotDto } from './dto/create-panorama-hotspot.dto';
import { UpdatePanoramaHotspotDto } from './dto/update-panorama-hotspot.dto';
import { deleteUploadedFile, getUploadsRoot } from '../common/storage/upload.util';
import { spawn } from 'child_process';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(RoomImage)
    private readonly roomImagesRepository: Repository<RoomImage>,
    @InjectRepository(PanoramaScene)
    private readonly panoramaScenesRepository: Repository<PanoramaScene>,
    @InjectRepository(PanoramaHotspot)
    private readonly panoramaHotspotsRepository: Repository<PanoramaHotspot>,
  ) {}

  async findAllPublic(): Promise<Room[]> {
    const rooms = await this.roomsRepository.find({
      where: { isActive: true },
      relations: {
        images: true,
        scenes: {
          hotspots: {
            targetScene: true,
          },
        },
      },
      order: {
        order: 'ASC',
      },
    });

    return rooms.map((room) => this.serializeRoom(room, false));
  }

  async findAllAdmin(): Promise<Room[]> {
    const rooms = await this.roomsRepository.find({
      relations: {
        images: true,
        scenes: {
          hotspots: {
            targetScene: true,
          },
        },
      },
      order: {
        order: 'ASC',
      },
    });

    return rooms.map((room) => this.serializeRoom(room, true));
  }

  async findOnePublic(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id, isActive: true },
      relations: {
        images: true,
        scenes: {
          hotspots: {
            targetScene: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    return this.serializeRoom(room, false);
  }

  async findOneAdmin(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: {
        images: true,
        scenes: {
          hotspots: {
            targetScene: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }

    return this.serializeRoom(room, true);
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const room = this.roomsRepository.create(dto);
    const savedRoom = await this.roomsRepository.save(room);
    return this.findOneAdmin(savedRoom.id);
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOneEntityOrThrow(id);
    Object.assign(room, dto);
    await this.roomsRepository.save(room);
    return this.findOneAdmin(id);
  }

  async remove(id: string): Promise<void> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: { images: true, scenes: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    const filesToDelete: (string | null | undefined)[] = [
      ...(room.images ?? []).map((img) => img.url),
      ...(room.scenes ?? []).flatMap((s) => [s.panoramaUrl, s.thumbnailUrl]),
    ];
    await this.roomsRepository.remove(room);
    await Promise.all(filesToDelete.map((url) => deleteUploadedFile(url)));
  }

  async addImages(
    roomId: string,
    files: Express.Multer.File[],
  ): Promise<RoomImage[]> {
    await this.findOneEntityOrThrow(roomId);

    if (!files.length) {
      throw new BadRequestException('At least one image is required');
    }

    const existingImagesCount = await this.roomImagesRepository.count({
      where: { roomId },
    });

    const images = await Promise.all(
      files.map((file, index) =>
        this.roomImagesRepository.save(
          this.roomImagesRepository.create({
            url: `/uploads/images/${file.filename}`,
            roomId,
            order: existingImagesCount + index,
          }),
        ),
      ),
    );

    const room = await this.findOneEntityOrThrow(roomId);
    if (!room.thumbnailUrl && images[0]) {
      room.thumbnailUrl = images[0].url;
      await this.roomsRepository.save(room);
    }

    return images;
  }

  async removeImage(roomId: string, imageId: string): Promise<void> {
    const image = await this.roomImagesRepository.findOne({
      where: { id: imageId, roomId },
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${imageId} not found`);
    }

    await this.roomImagesRepository.remove(image);
    await deleteUploadedFile(image.url);

    const room = await this.findOneEntityOrThrow(roomId);
    if (room.thumbnailUrl === image.url) {
      const nextImage = await this.roomImagesRepository.findOne({
        where: { roomId },
        order: { order: 'ASC' },
      });
      room.thumbnailUrl = nextImage?.url ?? null;
      await this.roomsRepository.save(room);
    }
  }


  async setThumbnail(roomId: string, imageId: string): Promise<void> {
    const room = await this.findOneEntityOrThrow(roomId);
    const image = await this.roomImagesRepository.findOne({
      where: { id: imageId, roomId },
    });
    if (!image) {
      throw new NotFoundException(`Image with id ${imageId} not found`);
    }
    room.thumbnailUrl = image.url;
    await this.roomsRepository.save(room);
  }

  async reorderImages(roomId: string, imageIds: string[]): Promise<void> {
    await this.findOneEntityOrThrow(roomId);

    const images = await this.roomImagesRepository.find({
      where: { roomId },
    });

    if (images.length !== imageIds.length) {
      throw new BadRequestException(
        'Image reorder payload does not match room images',
      );
    }

    const imageIdsSet = new Set(images.map((image) => image.id));
    imageIds.forEach((imageId) => {
      if (!imageIdsSet.has(imageId)) {
        throw new BadRequestException(
          'All reordered images must belong to the room',
        );
      }
    });

    await Promise.all(
      imageIds.map((imageId, index) =>
        this.roomImagesRepository.update(imageId, { order: index }),
      ),
    );
  }

  async createScene(
    roomId: string,
    dto: CreatePanoramaSceneDto,
  ): Promise<PanoramaScene> {
    await this.findOneEntityOrThrow(roomId);

    const scene = this.panoramaScenesRepository.create({
      roomId,
      title: dto.title,
      initialYaw: dto.initialYaw ?? 0,
      initialPitch: dto.initialPitch ?? 0,
      initialHfov: dto.initialHfov ?? 100,
      isDefault: dto.isDefault ?? false,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    const savedScene = await this.panoramaScenesRepository.save(scene);
    await this.ensureSingleDefaultScene(
      roomId,
      savedScene.id,
      savedScene.isDefault,
    );

    return this.findSceneOrThrow(roomId, savedScene.id);
  }

  async updateScene(
    roomId: string,
    sceneId: string,
    dto: UpdatePanoramaSceneDto,
  ): Promise<PanoramaScene> {
    const scene = await this.findSceneOrThrow(roomId, sceneId);
    Object.assign(scene, dto);
    await this.panoramaScenesRepository.save(scene);
    await this.ensureSingleDefaultScene(
      roomId,
      sceneId,
      dto.isDefault === true,
    );
    return this.findSceneOrThrow(roomId, sceneId);
  }

  async removeScene(roomId: string, sceneId: string): Promise<void> {
    const scene = await this.findSceneOrThrow(roomId, sceneId);
    const panoramaUrl = scene.panoramaUrl;
    const thumbnailUrl = scene.thumbnailUrl;
    await this.panoramaScenesRepository.remove(scene);
    await deleteUploadedFile(panoramaUrl);
    await deleteUploadedFile(thumbnailUrl);
    await this.ensureRoomHasDefaultScene(roomId);
  }

  async uploadScenePanorama(
    roomId: string,
    sceneId: string,
    file: Express.Multer.File,
  ): Promise<PanoramaScene> {
    const scene = await this.findSceneOrThrow(roomId, sceneId);
    const previousPanoramaUrl = scene.panoramaUrl;
    const previousThumbnailUrl = scene.thumbnailUrl;
    const originalExt = extname(file.originalname || file.filename).toLowerCase();
    const uploadsRoot = getUploadsRoot();
    const panoramaFolder = join(uploadsRoot, 'panoramas');
    const sourcePath = file.path || join(panoramaFolder, file.filename);

    let panoramaFilename = file.filename;
    let panoramaPath = sourcePath;

    if (originalExt === '.insp') {
      const parsed = parse(file.filename);
      panoramaFilename = `${parsed.name}.jpg`;
      panoramaPath = join(panoramaFolder, panoramaFilename);

      await this.runFfmpeg([
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        sourcePath,
        '-vf',
        'v360=input=dfisheye:output=equirect:ih_fov=190:iv_fov=190:w=4096:h=2048',
        '-frames:v',
        '1',
        panoramaPath,
      ]);

      await fs.unlink(sourcePath).catch(() => undefined);
    }

    scene.panoramaUrl = `/uploads/panoramas/${panoramaFilename}`;

    const shouldUpdateThumbnail =
      !scene.thumbnailUrl ||
      scene.thumbnailUrl.startsWith('/uploads/scene-thumbnails/') ||
      scene.thumbnailUrl === `/uploads/panoramas/${file.filename}`;

    if (shouldUpdateThumbnail) {
      const previewFilename = `${basename(panoramaFilename, '.jpg')}-preview.jpg`;
      const previewFolder = join(uploadsRoot, 'scene-thumbnails');
      const previewPath = join(previewFolder, previewFilename);

      await fs.mkdir(previewFolder, { recursive: true });
      await this.runFfmpeg([
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        panoramaPath,
        '-vf',
        'v360=input=equirect:output=flat:yaw=0:pitch=0:h_fov=105:v_fov=68:w=1600:h=900',
        '-frames:v',
        '1',
        previewPath,
      ]);

      scene.thumbnailUrl = `/uploads/scene-thumbnails/${previewFilename}`;
    }

    await this.panoramaScenesRepository.save(scene);

    // Clean up previous files (only if they differ from new ones)
    if (previousPanoramaUrl && previousPanoramaUrl !== scene.panoramaUrl) {
      await deleteUploadedFile(previousPanoramaUrl);
    }
    if (previousThumbnailUrl && previousThumbnailUrl !== scene.thumbnailUrl) {
      await deleteUploadedFile(previousThumbnailUrl);
    }

    return this.findSceneOrThrow(roomId, sceneId);
  }

  async uploadSceneThumbnail(
    roomId: string,
    sceneId: string,
    file: Express.Multer.File,
  ): Promise<PanoramaScene> {
    const scene = await this.findSceneOrThrow(roomId, sceneId);
    const previousThumbnailUrl = scene.thumbnailUrl;
    scene.thumbnailUrl = `/uploads/scene-thumbnails/${file.filename}`;
    await this.panoramaScenesRepository.save(scene);
    if (previousThumbnailUrl && previousThumbnailUrl !== scene.thumbnailUrl) {
      await deleteUploadedFile(previousThumbnailUrl);
    }
    return this.findSceneOrThrow(roomId, sceneId);
  }

  async createHotspot(
    roomId: string,
    sceneId: string,
    dto: CreatePanoramaHotspotDto,
  ): Promise<PanoramaHotspot> {
    await this.findSceneOrThrow(roomId, sceneId);
    await this.validateHotspot(roomId, dto.type, dto.targetSceneId);

    const hotspot = this.panoramaHotspotsRepository.create({
      sceneId,
      type: dto.type,
      label: dto.label,
      yaw: dto.yaw,
      pitch: dto.pitch,
      targetSceneId: dto.targetSceneId ?? null,
      iconUrl: dto.iconUrl ?? null,
      targetYaw: dto.targetYaw ?? null,
      targetPitch: dto.targetPitch ?? null,
      targetHfov: dto.targetHfov ?? null,
      order: dto.order ?? 0,
    });

    const savedHotspot = await this.panoramaHotspotsRepository.save(hotspot);
    return this.findHotspotOrThrow(sceneId, savedHotspot.id);
  }

  async updateHotspot(
    roomId: string,
    sceneId: string,
    hotspotId: string,
    dto: UpdatePanoramaHotspotDto,
  ): Promise<PanoramaHotspot> {
    await this.findSceneOrThrow(roomId, sceneId);
    const hotspot = await this.findHotspotOrThrow(sceneId, hotspotId);

    const nextType = dto.type ?? hotspot.type;
    const nextTargetSceneId =
      nextType === 'info'
        ? null
        : (dto.targetSceneId ?? hotspot.targetSceneId);

    await this.validateHotspot(
      roomId,
      nextType,
      nextTargetSceneId ?? undefined,
    );

    Object.assign(hotspot, dto);
    hotspot.type = nextType;
    hotspot.targetSceneId = nextTargetSceneId;

    if (nextType === 'info') {
      hotspot.targetYaw = null;
      hotspot.targetPitch = null;
      hotspot.targetHfov = null;
    }

    await this.panoramaHotspotsRepository.save(hotspot);
    return this.findHotspotOrThrow(sceneId, hotspotId);
  }

  async removeHotspot(sceneId: string, hotspotId: string): Promise<void> {
    const hotspot = await this.findHotspotOrThrow(sceneId, hotspotId);
    await this.panoramaHotspotsRepository.remove(hotspot);
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', args, { stdio: 'ignore' });

      ffmpeg.on('error', () => {
        reject(
          new BadRequestException(
            'ffmpeg topilmadi yoki ishga tushmadi. Serverga ffmpeg o‘rnatilishi kerak.',
          ),
        );
      });

      ffmpeg.on('exit', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new BadRequestException(
            'Panorama faylini konvert qilishda xatolik yuz berdi.',
          ),
        );
      });
    });
  }

  private async findOneEntityOrThrow(id: string): Promise<Room> {
    const room = await this.roomsRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found`);
    }
    return room;
  }

  private async findSceneOrThrow(
    roomId: string,
    sceneId: string,
  ): Promise<PanoramaScene> {
    const scene = await this.panoramaScenesRepository.findOne({
      where: { id: sceneId, roomId },
      relations: {
        hotspots: {
          targetScene: true,
        },
      },
    });

    if (!scene) {
      throw new NotFoundException(`Scene with id ${sceneId} not found`);
    }

    scene.hotspots = [...(scene.hotspots ?? [])].sort(
      (a, b) => a.order - b.order,
    );
    return scene;
  }

  private async findHotspotOrThrow(
    sceneId: string,
    hotspotId: string,
  ): Promise<PanoramaHotspot> {
    const hotspot = await this.panoramaHotspotsRepository.findOne({
      where: { id: hotspotId, sceneId },
      relations: {
        targetScene: true,
      },
    });

    if (!hotspot) {
      throw new NotFoundException(`Hotspot with id ${hotspotId} not found`);
    }

    return hotspot;
  }

  private serializeRoom(room: Room, includeInactiveScenes: boolean): Room {
    room.images = [...(room.images ?? [])].sort((a, b) => a.order - b.order);

    const sortedScenes = [...(room.scenes ?? [])]
      .filter((scene) => includeInactiveScenes || scene.isActive)
      .sort((a, b) => a.order - b.order);

    const activeSceneIds = new Set(sortedScenes.map((scene) => scene.id));

    room.scenes = sortedScenes.map((scene) => {
      scene.hotspots = [...(scene.hotspots ?? [])]
        .filter((hotspot) => {
          if (includeInactiveScenes || hotspot.type !== 'scene') {
            return true;
          }

          return hotspot.targetSceneId
            ? activeSceneIds.has(hotspot.targetSceneId)
            : false;
        })
        .sort((a, b) => a.order - b.order);

      return scene;
    });

    return room;
  }

  private async validateHotspot(
    roomId: string,
    type: 'scene' | 'info',
    targetSceneId?: string,
  ): Promise<void> {
    if (type === 'scene' && !targetSceneId) {
      throw new BadRequestException('Scene hotspots must have a target scene');
    }

    if (!targetSceneId) {
      return;
    }

    const targetScene = await this.panoramaScenesRepository.findOne({
      where: { id: targetSceneId, roomId },
    });

    if (!targetScene) {
      throw new BadRequestException(
        'Hotspot target scene must belong to the same room',
      );
    }
  }

  private async ensureSingleDefaultScene(
    roomId: string,
    sceneId: string,
    shouldBeDefault: boolean,
  ): Promise<void> {
    const scenes = await this.panoramaScenesRepository.find({
      where: { roomId },
      order: { order: 'ASC' },
    });

    if (!scenes.length) {
      return;
    }

    const fallbackSceneId = scenes[0]?.id;
    const defaultSceneId = shouldBeDefault
      ? sceneId
      : (scenes.find((scene) => scene.isDefault)?.id ?? fallbackSceneId);

    await this.panoramaScenesRepository.update(
      { roomId },
      { isDefault: false },
    );

    if (defaultSceneId) {
      await this.panoramaScenesRepository.update(defaultSceneId, {
        isDefault: true,
      });
    }
  }

  private async ensureRoomHasDefaultScene(roomId: string): Promise<void> {
    const scenes = await this.panoramaScenesRepository.find({
      where: { roomId },
      order: { order: 'ASC' },
    });

    const defaultScene = scenes.find((scene) => scene.isDefault);
    if (!defaultScene && scenes[0]) {
      await this.panoramaScenesRepository.update(scenes[0].id, {
        isDefault: true,
      });
    }
  }
}
