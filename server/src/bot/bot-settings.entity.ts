import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bot_settings')
export class BotSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  botToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  channelId: string | null;

  @Column({ type: 'varchar', nullable: true })
  webhookSecret: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
