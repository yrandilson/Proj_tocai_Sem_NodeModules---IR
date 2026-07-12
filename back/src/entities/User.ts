import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn
} from 'typeorm';
import { Notification } from './Notification';
import { Rating } from './Rating';
import { ChatMessage } from './ChatMessage';
import { Item } from './Item';
import { Proposal } from './Proposal';
import { Report } from './Report';
import { UserRole } from '../types';

/**
 * Entidade User - Representa um usuário do sistema
 * 
 * Papéis:
 * - admin: Controle total da plataforma
 * - verified: Usuário verificado com benefícios extras
 * - common: Usuário comum padrão
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  nome!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;
  
  @Column({ type: 'varchar', length: 20, nullable: true }) // ← ADICIONAR
  telefone?: string; // ← ADICIONAR

  @Column({ type: 'varchar', length: 255 })
  senha!: string; // Hash da senha

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.COMMON
  })
  role!: UserRole;

  // Relacionamento: Um usuário pode ter vários itens
  @OneToMany(() => Item, (item) => item.owner, { onDelete: 'CASCADE' })
  items!: Item[];

  // Relacionamento: Um usuário pode fazer várias propostas
  @OneToMany(() => Proposal, (proposal) => proposal.proposer, { onDelete: 'CASCADE' })
  proposals!: Proposal[];

  // Relacionamento: Um usuário pode ter várias notificações
  @OneToMany(() => Notification, (notification) => notification.user, { onDelete: 'CASCADE' })
  notifications!: Notification[];

  // Relacionamento: Um usuário pode ter várias avaliações (como avaliado)
  @OneToMany(() => Rating, (rating) => rating.toUser, { onDelete: 'CASCADE' })
  receivedRatings!: Rating[];

  // Relacionamento: Um usuário pode fazer várias avaliações
  @OneToMany(() => Rating, (rating) => rating.fromUser, { onDelete: 'CASCADE' })
  givenRatings!: Rating[];

  // Relacionamento: Um usuário pode ser remetente de várias mensagens
  @OneToMany(() => ChatMessage, (message) => message.sender, { onDelete: 'CASCADE' })
  sentMessages!: ChatMessage[];

  // Relacionamento: Um usuário pode ser destinatário de várias mensagens
  @OneToMany(() => ChatMessage, (message) => message.receiver, { onDelete: 'CASCADE' })
  receivedMessages!: ChatMessage[];

  // Relacionamento: Denúncias feitas por este usuário
  @OneToMany(() => Report, (report) => report.reporter, { onDelete: 'SET NULL' })
  madeReports!: Report[];

  // Relacionamento: Denúncias recebidas por este usuário
  @OneToMany(() => Report, (report) => report.reportedUser, { onDelete: 'CASCADE' }) // Corrigido para apontar para a relação correta
  receivedReports!: Report[];

  @Column({ type: 'text', nullable: true })
  pushSubscription?: string | null;

  // Campo para Bloqueio de Usuário (P2)
  @Column({ type: 'boolean', default: false })
  isBlocked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  /**
   * Método para retornar dados públicos do usuário
   * Remove a senha do objeto
   */
  toJSON() {
    const { senha, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
