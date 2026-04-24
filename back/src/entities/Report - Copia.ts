import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { ReportStatus } from '../types';
import { Item } from './Item';
import { ReportHistory } from './ReportHistory';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' }) // Revertido para string para corrigir o erro de importação
  reason!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'varchar', enum: ReportStatus, default: ReportStatus.PENDENTE })
  status!: ReportStatus;

  @Column({ type: 'int', nullable: true }) // Correção: Permitir que o reporter seja nulo se o usuário for deletado
  reporterId?: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true }) // Correção: Não deletar a denúncia se o reporter for deletado
  @JoinColumn({ name: 'reporterId' })
  reporter!: User;

  @Column({ type: 'int', nullable: true })
  reportedUserId?: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: User;

  @Column({ type: 'int', nullable: true }) // Correção: A denúncia pode não ser sobre um item
  reportedItemId?: number;

  @ManyToOne(() => Item, item => item.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedItemId' })
  reportedItem!: Item;

  // Histórico de status (P2)
  @OneToMany(() => ReportHistory, (history) => history.report, { cascade: true })
  history!: ReportHistory[];

  @CreateDateColumn()
  createdAt!: Date;
}
