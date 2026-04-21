import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../common/types/i18n-field.type';

@Entity('hotel_info')
export class HotelInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  description: I18nField;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  heroVideoDesktop: string;

  @Column({ type: 'varchar', nullable: true })
  heroVideoMobile: string;

  @Column({ type: 'varchar', nullable: true })
  heroPosterDesktop: string;

  @Column({ type: 'varchar', nullable: true })
  heroPosterMobile: string;

  @Column({ type: 'jsonb', nullable: true })
  heroText: I18nField;

  @Column({ type: 'jsonb', nullable: true })
  heroSubtext: I18nField;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'double precision', nullable: true })
  latitude: number;

  @Column({ type: 'double precision', nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  mapEmbedUrl: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
