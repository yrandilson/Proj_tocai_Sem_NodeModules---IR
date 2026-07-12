import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Proposal } from './Proposal';
import { TradePreference } from './TradePreference';
import { ItemStatus } from '../types';
import { ChatMessage } from './ChatMessage';
import { Report } from './Report';
import { Image } from './image.entity';

@Entity('items')
@Index(['categoria'])
@Index(['status'])
@Index(['ownerId'])
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  ownerId!: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column('text')
  descricao!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  categoria?: string;

  @Column({ type: 'simple-enum', enum: ItemStatus, default: ItemStatus.DISPONIVEL })
  status!: ItemStatus;

  @OneToMany(() => Image, (image: Image) => image.item, { cascade: true, eager: true })
  imagens!: Image[];

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Relação com as preferências de troca
  @OneToMany(() => TradePreference, (preference) => preference.item, {
    onDelete: 'CASCADE'
  })
  tradePreferences!: TradePreference[];

  @OneToMany(() => Proposal, (proposal) => proposal.item, { onDelete: 'CASCADE' })
  proposals!: Proposal[];

  @OneToMany(() => ChatMessage, (message) => message.item, { onDelete: 'CASCADE' })
  chatMessages!: ChatMessage[];

  @OneToMany(() => Report, (report) => report.reportedItem, { onDelete: 'CASCADE' })
  reports!: Report[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}