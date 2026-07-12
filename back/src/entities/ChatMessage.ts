import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './User';
import { Item } from './Item';
import { Proposal } from './Proposal';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @Column({ type: 'int' })
  senderId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @Column({ type: 'int' })
  receiverId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver!: User;

  @Column({ type: 'int' })
  itemId!: number;

  @ManyToOne(() => Item, item => item.chatMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @Column({ type: 'int', nullable: true })
  proposalId?: number;

  @ManyToOne(() => Proposal, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'proposalId' })
  proposal?: Proposal;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}