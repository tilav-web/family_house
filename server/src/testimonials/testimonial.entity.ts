import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../common/types/i18n-field.type';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  authorName: string;

  @Column({ type: 'varchar', nullable: true })
  authorPhotoUrl: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  authorCountry: string;

  @Column({ type: 'jsonb' })
  text: I18nField;

  @Column({ type: 'int' })
  rating: number;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
