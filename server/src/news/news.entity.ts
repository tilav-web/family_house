import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { I18nField } from '../common/types/i18n-field.type';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'jsonb' })
  title: I18nField;

  @Column({ type: 'jsonb' })
  excerpt: I18nField;

  @Column({ type: 'jsonb' })
  content: I18nField;

  @Column({ type: 'varchar', nullable: true })
  thumbnailUrl: string;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
