import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { NotificationType } from '../types';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'varchar',
    enum: [
      'NEW_PROPOSAL',
      'PROPOSAL_ACCEPTED',
      'PROPOSAL_REJECTED',
      'NEW_MESSAGE',
      'item_deleted',
      'item_deleted_by_admin',
      'match_found',
      'item_created',
      'item_updated',
      'user_registered',
      'item_available' // 👈 ADICIONE ESTA LINHA
    ]
  })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'varchar', nullable: true })
  link?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}