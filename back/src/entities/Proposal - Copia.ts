import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Item } from './Item';
import { Rating } from './Rating';
import { ProposalStatus } from '../types'; // Assumindo que ProposalStatus está definido em types

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  itemId!: number;

  @ManyToOne(() => Item, (item) => item.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: Item;

  @Column({ type: 'int' })
  proposerId!: number;

  @ManyToOne(() => User, (user) => user.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposerId' })
  proposer!: User;

  @Column('text')
  mensagem!: string;

  @Column({ type: 'varchar', enum: ProposalStatus, default: ProposalStatus.PENDENTE })
  status!: ProposalStatus;

  @OneToMany(() => Rating, (rating) => rating.proposal)
  ratings!: Rating[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}