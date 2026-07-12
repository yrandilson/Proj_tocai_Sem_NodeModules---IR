import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';

/**
 * Entidade RefreshToken
 *
 * Armazena refresh tokens hasheados no banco.
 * O token real (não hasheado) é enviado ao cliente via cookie httpOnly.
 * Ao receber um refresh, o servidor compara o token recebido com o hash armazenado.
 *
 * Rotação automática: a cada uso, o token antigo é invalidado e um novo é gerado.
 */
@Entity('refresh_tokens')
@Index(['userId'])
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  tokenHash!: string; // SHA-256 do token real — nunca armazenamos o token em texto claro

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'boolean', default: false })
  revoked!: boolean;

  @Column({ type: 'datetime' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
