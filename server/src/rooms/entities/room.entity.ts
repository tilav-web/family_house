import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../../common/types/i18n-field.type';
import { RoomImage } from './room-image.entity';
import { PanoramaScene } from './panorama-scene.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  name: I18nField;

  @Column({ type: 'jsonb', nullable: true })
  description: I18nField;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ type: 'varchar', default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  amenities: I18nField;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => RoomImage, (image) => image.room, {
    cascade: true,
    eager: false,
  })
  images: RoomImage[];

  @OneToMany(() => PanoramaScene, (scene) => scene.room, {
    cascade: true,
    eager: false,
  })
  scenes: PanoramaScene[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
