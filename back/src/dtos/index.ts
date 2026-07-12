import { IsString, IsEmail, MinLength, IsOptional, IsEnum, MaxLength, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { UserRole, ItemStatus, ProposalStatus, ReportStatus } from '../types';

/**
 * DTOs (Data Transfer Objects) com validação usando class-validator
 * Garante que os dados de entrada sejam válidos antes de processar
 */

// ========================================
// USER DTOs
// ========================================

export class CreateUserDTO {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senha: string;
}

export class LoginUserDTO {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senha: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senha?: string;
}

export class UpdateUserRoleDTO {
  @IsEnum(UserRole, { message: 'Papel inválido' })
  role: UserRole;
}

export class BlockUserDTO {
  @IsBoolean({ message: 'isBlocked deve ser um booleano' })
  isBlocked: boolean;
}

// ========================================
// ITEM DTOs
// ========================================

export class CreateItemDTO {
  @IsString({ message: 'Título deve ser uma string' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  titulo: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  descricao: string;

  @IsString({ message: 'Categoria deve ser uma string' })
  @MaxLength(50, { message: 'Categoria deve ter no máximo 50 caracteres' })
  categoria: string;
}

export class UpdateItemDTO {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  @MinLength(3, { message: 'Título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MinLength(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
  descricao?: string;

  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  @MaxLength(50, { message: 'Categoria deve ter no máximo 50 caracteres' })
  categoria?: string;
}

export class UpdateItemStatusDTO {
  @IsEnum(ItemStatus, { message: 'Status inválido' })
  status: ItemStatus;
}

// ========================================
// PROPOSAL DTOs
// ========================================

export class CreateProposalDTO {
  @IsNumber({}, { message: 'ID do item deve ser um número' })
  itemId: number;

  @IsString({ message: 'Mensagem deve ser uma string' })
  @MinLength(10, { message: 'Mensagem deve ter pelo menos 10 caracteres' })
  @MaxLength(1000, { message: 'Mensagem deve ter no máximo 1000 caracteres' })
  mensagem: string;
}

export class UpdateProposalStatusDTO {
  @IsEnum(ProposalStatus, { message: 'Status inválido' })
  status: ProposalStatus;
}

// ========================================
// RATING DTOs
// ========================================

export class CreateRatingDTO {
  @IsNumber({}, { message: 'ID do usuário avaliado deve ser um número' })
  toUserId: number;

  @IsNumber({}, { message: 'ID da proposta deve ser um número' })
  proposalId: number;

  @IsNumber({}, { message: 'Avaliação deve ser um número' })
  @Min(1, { message: 'Avaliação mínima é 1 estrela' })
  @Max(5, { message: 'Avaliação máxima é 5 estrelas' })
  value: number;

  @IsOptional()
  @IsString({ message: 'Comentário deve ser uma string' })
  @MaxLength(500, { message: 'Comentário deve ter no máximo 500 caracteres' })
  comment?: string;

  // Campos de Feedback Detalhado
  @IsOptional()
  @IsBoolean({ message: 'itemConformeDescricao deve ser um booleano' })
  itemConformeDescricao?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'comunicacaoClara deve ser um booleano' })
  comunicacaoClara?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'prazoCumprido deve ser um booleano' })
  prazoCumprido?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'recomendariaUsuario deve ser um booleano' })
  recomendariaUsuario?: boolean;
}

// ========================================
// REPORT DTOs
// ========================================

export class CreateReportDTO {
  // Pelo menos um dos dois (reportedUserId ou reportedItemId) deve ser fornecido.
  // A validação da regra de negócio é feita no service.
  @IsOptional()
  @IsNumber({}, { message: 'ID do usuário denunciado deve ser um número.' })
  reportedUserId?: number;

  @IsString({ message: 'Motivo deve ser uma string' })
  @MinLength(5, { message: 'Motivo deve ter pelo menos 5 caracteres' })
  @MaxLength(100, { message: 'Motivo deve ter no máximo 100 caracteres' })
  reason: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'ID do item denunciado deve ser um número.' })
  reportedItemId?: number;
}

export class UpdateReportStatusDTO {
  @IsEnum(ReportStatus, { message: 'Status de denúncia inválido' })
  status: ReportStatus;

  @IsOptional()
  @IsString({ message: 'Ação tomada deve ser uma string' })
  @MaxLength(1000, { message: 'Ação tomada deve ter no máximo 1000 caracteres' })
  actionTaken?: string;
}