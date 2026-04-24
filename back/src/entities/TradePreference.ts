import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from './Item'; // Caminho já estava correto, mantido para clareza.

@Entity('trade_preferences')
export class TradePreference {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'int' })
  itemId!: number;

  @ManyToOne(() => Item, item => item.tradePreferences, {
    onDelete: 'CASCADE',
    nullable: false // ⭐ A preferência DEVE ter um item associado
  })
  @JoinColumn({ name: 'itemId' })
  item!: Item;
}
