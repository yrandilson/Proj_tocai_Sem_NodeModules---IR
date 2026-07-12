import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Proposal } from './Proposal';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  value: number; // e.g., 1 to 5

  @Column('text', { nullable: true })
  comment: string;

  // Campos de Feedback Detalhado
  @Column({ type: 'boolean', default: false })
  itemConformeDescricao: boolean;

  @Column({ type: 'boolean', default: false })
  comunicacaoClara: boolean;

  @Column({ type: 'boolean', default: false })
  prazoCumprido: boolean;

  @Column({ type: 'boolean', default: false })
  recomendariaUsuario: boolean;

  @ManyToOne(() => User, user => user.givenRatings)
  fromUser: User;

  @ManyToOne(() => User, user => user.receivedRatings)
  toUser: User;

  @ManyToOne(() => Proposal, proposal => proposal.ratings)
  proposal: Proposal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}