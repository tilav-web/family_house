import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../../common/types/i18n-field.type';
import { PanoramaScene } from './panorama-scene.entity';

export type PanoramaHotspotType = 'scene' | 'info';

@Entity('panorama_hotspots')
export class PanoramaHotspot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  sceneId: string;

  @ManyToOne(() => PanoramaScene, (scene) => scene.hotspots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sceneId' })
  scene: PanoramaScene;

  @Column({ type: 'varchar', nullable: true })
  targetSceneId: string | null;

  @ManyToOne(() => PanoramaScene, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'targetSceneId' })
  targetScene?: PanoramaScene | null;

  @Column({ default: 'scene' })
  type: PanoramaHotspotType;

  @Column({ type: 'jsonb' })
  label: I18nField;

  @Column({ type: 'float' })
  yaw: number;

  @Column({ type: 'float' })
  pitch: number;

  @Column({ type: 'varchar', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'float', nullable: true })
  targetYaw: number | null;

  @Column({ type: 'float', nullable: true })
  targetPitch: number | null;

  @Column({ type: 'float', nullable: true })
  targetHfov: number | null;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
