// Tipos e interfaces do sistema
import type { Request } from 'express';

/**
 * Papéis de usuário no sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  VERIFIED = 'verified',
  COMMON = 'common'
}

/**
 * Status possíveis para um item
 */
export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  EM_NEGOCIACAO = 'em_negociacao',
  TROCADO = 'trocado'
}

/**
 * Status possíveis para uma proposta
 */
export enum ProposalStatus {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada'
}

/**
 * Tipos de denúncia
 */
export enum ReportType {
  USER = 'user',
  ITEM = 'item'
}

/**
 * Status de uma denúncia
 */
export enum ReportStatus {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  RESOLVIDA = 'resolvida',
  REJEITADA = 'rejeitada'
}

/**
 * Tipos de notificação
 */
export enum NotificationType {
  NEW_PROPOSAL = 'NEW_PROPOSAL',
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  ITEM_DELETED = 'item_deleted',
  ITEM_DELETED_BY_ADMIN = 'item_deleted_by_admin',
  MATCH_FOUND = 'match_found',
  // Adicionados para o log de atividades do admin
  ITEM_CREATED = 'item_created',
  ITEM_UPDATED = 'item_updated',
  USER_REGISTERED = 'user_registered',
  ITEM_AVAILABLE = 'item_available' // 👈 ADICIONE ESTA LINHA
}

/**
 * Extensão do Request do Express para incluir dados do usuário autenticado
 */
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: UserRole;
  user?: {
    id: number;
    role: UserRole;
  };
}

/**
 * Payload do token JWT
 */
export interface JWTPayload {
  userId: number;
  role: UserRole;
}

/**
 * Resposta padrão de autenticação
 */
export interface AuthResponse {
  user: {
    id: number;
    nome: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

/**
 * Filtros para listagem de itens
 */
export interface LocationFilter {
  latitude: number;
  longitude: number;
  raio: number; // Raio em quilômetros (km)
}

/**
 * Filtros para listagem de itens
 */
export interface ItemFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: ItemStatus;
  ownerId?: number;
  location?: LocationFilter;
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Filtros para listagem de denúncias
 */
export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  type?: ReportType;
}