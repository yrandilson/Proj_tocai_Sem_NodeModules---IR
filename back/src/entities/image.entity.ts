import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn
} from 'typeorm';
import { Item } from './Item';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 2048 }) // URLs podem ser longas
  url!: string;

  // 🔴 CORREÇÃO: Garantir que itemId seja obrigatório
  @Column({ type: 'int' })
  itemId: number;

  @ManyToOne(() => Item, item => item.imagens, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @CreateDateColumn()
  createdAt!: Date;
}