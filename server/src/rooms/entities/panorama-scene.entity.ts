import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../../common/types/i18n-field.type';
import { Room } from './room.entity';
import { PanoramaHotspot } from './panorama-hotspot.entity';

@Entity('panorama_scenes')
export class PanoramaScene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  roomId: string;

  @ManyToOne(() => Room, (room) => room.scenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'jsonb' })
  title: I18nField;

  @Column({ type: 'varchar', nullable: true })
  panoramaUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'float', default: 0 })
  initialYaw: number;

  @Column({ type: 'float', default: 0 })
  initialPitch: number;

  @Column({ type: 'float', default: 100 })
  initialHfov: number;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  targetForwardId: string | null;

  @Column({ type: 'float', nullable: true })
  targetForwardYaw: number | null;

  @Column({ type: 'varchar', nullable: true })
  targetRightId: string | null;

  @Column({ type: 'float', nullable: true })
  targetRightYaw: number | null;

  @Column({ type: 'varchar', nullable: true })
  targetBackId: string | null;

  @Column({ type: 'float', nullable: true })
  targetBackYaw: number | null;

  @Column({ type: 'varchar', nullable: true })
  targetLeftId: string | null;

  @Column({ type: 'float', nullable: true })
  targetLeftYaw: number | null;

  @OneToMany(() => PanoramaHotspot, (hotspot) => hotspot.scene, {
    cascade: true,
    eager: false,
  })
  hotspots: PanoramaHotspot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
