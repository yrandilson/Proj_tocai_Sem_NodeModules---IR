export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'verified' | 'common'; // Adicionado tipo literal
  isBlocked: boolean; // Adicionado para Bloqueio de Usuário (P2)
  createdAt?: string;
  updatedAt?: string;
}

export interface Image {
  id: number;
  url: string;
  itemId: number;
}

export interface TradePreference {
  id: number;
  titulo: string;
  itemId: number;
}

export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  TROCADO = 'trocado',
  RESERVADO = 'reservado'
}

export interface Item {
  id: number;
  titulo: string;
  descricao: string;
  categoria?: string;
  status: ItemStatus;
  ownerId: number;
  owner?: User;
  latitude?: number;
  longitude?: number;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  imagens: Image[];
  tradePreferences: TradePreference[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Rating {
  id: number;
  value: number;
  comment?: string;
  // Campos de Feedback Detalhado (P1)
  itemConformeDescricao: boolean;
  comunicacaoClara: boolean;
  prazoCumprido: boolean;
  recomendariaUsuario: boolean;
  // Relações
  fromUser: User;
  toUser: User;
  createdAt: string;
}

export enum ProposalStatus {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada'
}

export interface Proposal {
  id: number;
  item: Item;
  proposer: User;
  offeredItems: Item[];
  status: ProposalStatus;
  mensagem: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  itemId: number;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  otherUser: User;
  item: Item;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface AuthResponse {
  user: {
    id: number;
    nome: string;
    email: string;
    role: 'admin' | 'verified' | 'common';
  };
  token: string;
}

// Interface para os parâmetros de busca de itens (P1 e P3)
export interface ItemSearchParams {
  search?: string;
  category?: string;
  status?: 'disponivel' | 'em_negociacao' | 'trocado';
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  raio?: number; // Raio em km
}


export enum ReportStatus {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  RESOLVIDA = 'resolvida',
  REJEITADA = 'rejeitada'
}

export interface Report {
  id: number;
  reason: string;
  description: string;
  status: ReportStatus;
  reporter: User;
  reportedUser?: User;
  reportedItem?: Item;
  createdAt: string;
}

