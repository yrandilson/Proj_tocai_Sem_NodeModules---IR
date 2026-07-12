import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Report } from './Report';
import { User } from './User';
import { ReportStatus } from '../types';

@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  reportId!: number;

  @ManyToOne(() => Report, (report) => report.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report!: Report;

  @Column({ type: 'int' })
  changedByUserId!: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'changedByUserId' })
  changedByUser!: User;

  @Column({ type: 'varchar', length: 20 })
  oldStatus!: ReportStatus;

  @Column({ type: 'varchar', length: 20 })
  newStatus!: ReportStatus;

  @Column({ type: 'text', nullable: true })
  actionTaken?: string;

  @CreateDateColumn()
  changedAt!: Date;
}

