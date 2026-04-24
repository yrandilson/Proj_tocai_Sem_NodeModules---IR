<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? GUIA COMPLETO: Criar TrocaAi do Zero

## �ndice
1. [Setup Inicial](#1-setup-inicial)
2. [Backend - Estrutura Base](#2-backend---estrutura-base)
3. [Backend - Banco de Dados](#3-backend---banco-de-dados)
4. [Backend - Autentica��o](#4-backend---autentica��o)
5. [Backend - Features Principais](#5-backend---features-principais)
6. [Backend - WebSocket](#6-backend---websocket)
7. [Frontend - Setup](#7-frontend---setup)
8. [Frontend - Estrutura Base](#8-frontend---estrutura-base)
9. [Frontend - Features](#9-frontend---features)
10. [Integra��o e Testes](#10-integra��o-e-testes)

---

## 1. Setup Inicial

### Passo 1.1: Criar estrutura de pastas raiz

```bash
mkdir trocaai
cd trocaai

# Criar pastas principais
mkdir backend
mkdir frontend
```

### Passo 1.2: Inicializar Git

```bash
git init
```

### Passo 1.3: Criar `.gitignore` (RAIZ)

```gitignore
# Node
node_modules/
npm-debug.log
yarn-error.log

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.sqlite
*.db

# Uploads
backend/uploads/
!backend/uploads/.gitkeep

# Logs
*.log
logs/
```

### Passo 1.4: Criar `package.json` raiz

```bash
npm init -y
```

Editar `package.json`:

```json
{
  "name": "trocaai",
  "version": "1.0.0",
  "description": "Plataforma de trocas e doa��es",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm --prefix backend run dev\" \"npm --prefix frontend run dev\"",
    "build": "npm --prefix backend run build && npm --prefix frontend run build",
    "start": "npm --prefix backend start"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Instalar:

```bash
npm install
```

---

## 2. Backend - Estrutura Base

### Passo 2.1: Inicializar Backend

```bash
cd backend
npm init -y
```

### Passo 2.2: Instalar depend�ncias

```bash
# Produ��o
npm install express cors dotenv bcryptjs jsonwebtoken multer reflect-metadata socket.io sqlite3 typeorm class-transformer class-validator

# Desenvolvimento
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer ts-node-dev
```

### Passo 2.3: Criar `tsconfig.json` (backend/)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Passo 2.4: Atualizar `package.json` (backend/)

```json
{
  "name": "trocaai-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Passo 2.5: Criar estrutura de pastas (backend/src/)

```bash
cd src
mkdir config controllers dtos entities middlewares routes services websocket
```

---

## 3. Backend - Banco de Dados

### Passo 3.1: Criar `backend/src/types/index.ts`

```typescript
// Enums
export enum UserRole {
  ADMIN = 'admin',
  VERIFIED = 'verified',
  COMMON = 'common'
}

export enum ItemStatus {
  DISPONIVEL = 'disponivel',
  EM_NEGOCIACAO = 'em_negociacao',
  TROCADO = 'trocado'
}

export enum ProposalStatus {
  PENDENTE = 'pendente',
  ACEITA = 'aceita',
  RECUSADA = 'recusada'
}

export enum NotificationType {
  NEW_PROPOSAL = 'new_proposal',
  PROPOSAL_ACCEPTED = 'proposal_accepted',
  PROPOSAL_REJECTED = 'proposal_rejected',
  NEW_MESSAGE = 'new_message',
  NEW_RATING = 'new_rating'
}

export enum ReportType {
  USER = 'user',
  ITEM = 'item'
}

export enum ReportStatus {
  PENDENTE = 'pendente',
  EM_ANALISE = 'em_analise',
  RESOLVIDA = 'resolvida'
}

// Interfaces
export interface AuthRequest extends Request {
  userId?: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface ItemFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: ItemStatus;
  ownerId?: number;
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

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: ReportStatus;
  type?: ReportType;
}
```

### Passo 3.2: Criar `backend/src/config/database.ts`

```typescript
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Proposal } from '../entities/Proposal';
import { ChatMessage } from '../entities/ChatMessage';
import { Notification } from '../entities/Notification';
import { Rating } from '../entities/Rating';
import { Report } from '../entities/Report';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_DATABASE || 'database.sqlite',
  entities: [User, Item, Proposal, ChatMessage, Notification, Rating, Report],
  synchronize: true, // Em produ��o, usar migrations
  logging: false
});

export const initializeDatabase = async () => {
  try {
    console.log('?? Inicializando conex�o com o banco de dados...');
    await AppDataSource.initialize();
    console.log('? Conex�o estabelecida com sucesso!');
    
    // Habilitar foreign keys no SQLite
    await AppDataSource.query('PRAGMA foreign_keys = ON');
    console.log('?? Habilitando FOREIGN KEYS no SQLite...');
    console.log('? Foreign keys: HABILITADAS');
    console.log('?? Banco de dados pronto para uso!\n');
  } catch (error) {
    console.error('? Erro ao conectar ao banco de dados:', error);
    throw error;
  }
};
```

### Passo 3.3: Criar `backend/src/config/jwt.ts`

```typescript
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET n�o est� definido no .env');
  }
  
  return secret;
};

export const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || '7d';
};
```

### Passo 3.4: Criar `backend/src/config/upload.ts`

```typescript
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configura��o de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de arquivos (apenas imagens)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens s�o permitidas (jpeg, jpg, png, gif, webp)'));
  }
};

// Configura��o do Multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware para tratamento de erros de upload
export const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. M�ximo 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
```

### Passo 3.5: Criar pasta `backend/uploads/` e arquivo `.gitkeep`

```bash
cd .. # voltar para backend/
mkdir uploads
touch uploads/.gitkeep
```

### Passo 3.6: Criar entidade `backend/src/entities/User.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { UserRole } from '../types';
import { Item } from './Item';
import { Proposal } from './Proposal';
import { Notification } from './Notification';
import { Rating } from './Rating';
import { ChatMessage } from './ChatMessage';
import { Report } from './Report';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  senha: string;

  @Column({ type: 'varchar', length: 20, default: UserRole.COMMON })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Relacionamentos
  @OneToMany(() => Item, (item) => item.owner, { cascade: true })
  items: Item[];

  @OneToMany(() => Proposal, (proposal) => proposal.proposer, { cascade: true })
  proposals: Proposal[];

  @OneToMany(() => Notification, (notification) => notification.user, { cascade: true })
  notifications: Notification[];

  @OneToMany(() => Rating, (rating) => rating.ratedUser, { cascade: true })
  receivedRatings: Rating[];

  @OneToMany(() => Rating, (rating) => rating.raterUser, { cascade: true })
  givenRatings: Rating[];

  @OneToMany(() => ChatMessage, (message) => message.sender, { cascade: true })
  sentMessages: ChatMessage[];

  @OneToMany(() => ChatMessage, (message) => message.receiver, { cascade: true })
  receivedMessages: ChatMessage[];

  @OneToMany(() => Report, (report) => report.reporter)
  madeReports: Report[];

  @OneToMany(() => Report, (report) => report.reportedUser)
  receivedReports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Remove senha ao serializar JSON
  toJSON() {
    const { senha, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
```

### Passo 3.7: Criar entidade `backend/src/entities/Item.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { ItemStatus } from '../types';
import { Proposal } from './Proposal';
import { ChatMessage } from './ChatMessage';
import { Rating } from './Rating';
import { Report } from './Report';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  categoria?: string;

  @Column({ type: 'varchar', length: 20, default: ItemStatus.DISPONIVEL })
  status: ItemStatus;

  @Column({ type: 'simple-json', nullable: true })
  imagens?: string[];

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bairro?: string;

  @OneToMany(() => Proposal, (proposal) => proposal.item, { cascade: true })
  proposals: Proposal[];

  @OneToMany(() => ChatMessage, (message) => message.item, { cascade: true })
  chatMessages: ChatMessage[];

  @OneToMany(() => Rating, (rating) => rating.item)
  ratings: Rating[];

  @OneToMany(() => Report, (report) => report.reportedItem, { cascade: true })
  reports: Report[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
```

### Passo 3.8: Criar demais entidades

**`backend/src/entities/Proposal.ts`:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Item } from './Item';
import { User } from './User';
import { ProposalStatus } from '../types';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, (item) => item.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  proposerId: number;

  @ManyToOne(() => User, (user) => user.proposals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposerId' })
  proposer: User;

  @Column('text')
  mensagem: string;

  @Column({ type: 'varchar', length: 20, default: ProposalStatus.PENDENTE })
  status: ProposalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**`backend/src/entities/ChatMessage.ts`:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Item } from './Item';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  conteudo: string;

  @Column()
  senderId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  receiverId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  itemId: number;

  @ManyToOne(() => Item, { eager: false })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**`backend/src/entities/Notification.ts`:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { NotificationType } from '../types';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column('text')
  message: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: any;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

**`backend/src/entities/Rating.ts`:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Item } from './Item';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raterId: number;

  @ManyToOne(() => User, (user) => user.givenRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raterId' })
  raterUser: User;

  @Column()
  ratedId: number;

  @ManyToOne(() => User, (user) => user.receivedRatings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ratedId' })
  ratedUser: User;

  @Column({ nullable: true })
  itemId?: number;

  @ManyToOne(() => Item, (item) => item.ratings, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'itemId' })
  item?: Item;

  @Column('int')
  stars: number;

  @Column('text', { nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

**`backend/src/entities/Report.ts`:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Item } from './Item';
import { ReportType, ReportStatus } from '../types';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @ManyToOne(() => User, (user) => user.madeReports, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column({ type: 'varchar', length: 20 })
  type: ReportType;

  @Column({ nullable: true })
  reportedUserId?: number;

  @ManyToOne(() => User, (user) => user.receivedReports, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: User;

  @Column({ nullable: true })
  reportedItemId?: number;

  @ManyToOne(() => Item, (item) => item.reports, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportedItemId' })
  reportedItem?: Item;

  @Column({ type: 'varchar', length: 200 })
  reason: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: ReportStatus.PENDENTE })
  status: ReportStatus;

  @Column('text', { nullable: true })
  actionTaken?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Passo 3.9: Criar arquivo `.env` (backend/)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# JWT
JWT_SECRET=trocaai_super_secret_key_2025_change_in_production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5000

# Google Maps (Opcional)
GOOGLE_MAPS_API_KEY=
```

---

## 4. Backend - Autentica��o

### Passo 4.1: Criar DTOs `backend/src/dtos/index.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString, Length, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserRole, ItemStatus, ProposalStatus, ReportType, ReportStatus } from '../types';

// ========== USER DTOs ==========
export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  senha: string;
}

export class LoginUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  @Length(3, 100)
  nome?: string;

  @IsString()
  @IsOptional()
  @Length(6, 100)
  senha?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}

export class UpdateUserRoleDTO {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

// ========== ITEM DTOs ==========
export class CreateItemDTO {
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 2000)
  descricao: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class UpdateItemDTO {
  @IsString()
  @IsOptional()
  @Length(3, 200)
  titulo?: string;

  @IsString()
  @IsOptional()
  @Length(10, 2000)
  descricao?: string;

  @IsString()
  @IsOptional()
  categoria?: string;
}

export class UpdateItemStatusDTO {
  @IsEnum(ItemStatus)
  @IsNotEmpty()
  status: ItemStatus;
}

// ========== PROPOSAL DTOs ==========
export class CreateProposalDTO {
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @IsString()
  @IsNotEmpty()
  @Length(10, 1000)
  mensagem: string;
}

export class UpdateProposalStatusDTO {
  @IsEnum(ProposalStatus)
  @IsNotEmpty()
  status: ProposalStatus;
}

// ========== RATING DTOs ==========
export class CreateRatingDTO {
  @IsNumber()
  @IsNotEmpty()
  toUserId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  stars: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsOptional()
  itemId?: number;
}

// ========== REPORT DTOs ==========
export class CreateReportDTO {
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsNumber()
  @IsNotEmpty()
  reportedId: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateReportStatusDTO {
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @IsString()
  @IsOptional()
  actionTaken?: string;
}
```

### Passo 4.2: Criar middlewares

**`backend/src/middlewares/auth.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/jwt';
import { AuthRequest, JwtPayload } from '../types';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Token n�o fornecido' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    (req as AuthRequest).userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inv�lido ou expirado' });
    return;
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ error: 'Token n�o fornecido' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inv�lido' });
      return;
    }
  };
};
```

**`backend/src/middlewares/validation.middleware.ts`:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validateDTO = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);

    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const formattedErrors = errors.map(error => ({
        field: error.property,
        constraints: error.constraints
      }));

      res.status(400).json({
        error: 'Valida��o falhou',
        details: formattedErrors
      });
      return;
    }

    next();
  };
};
```

### Passo 4.3: Criar `UserService` (`backend/src/services/user.service.ts`)

```typescript
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJwtSecret, getJwtExpiresIn } from '../config/jwt';
import { UserRole } from '../types';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async register(nome: string, email: string, senha: string) {
    // Verifica se email j� existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email j� cadastrado');
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Cria usu�rio
    const user = this.userRepository.create({
      nome,
      email,
      senha: hashedPassword,
      role: UserRole.COMMON
    });

    await this.userRepository.save(user);

    // Gera token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    return { user: user.toJSON(), token };
  }

  async login(email: string, senha: string) {
    // Busca usu�rio
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Credenciais inv�lidas');
    }

    // Verifica senha
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new Error('Credenciais inv�lidas');
    }

    // Gera token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() }
    );

    return { user: user.toJSON(), token };
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usu�rio n�o encontrado');
    }
    return user.toJSON();
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users.map(u => u.toJSON());
  }

  async update(id: number, dados: Partial<User>, userId: number) {
    if (id !== userId) {
      throw new Error('Voc� n�o tem permiss�o para editar este usu�rio');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usu�rio n�o encontrado');
    }

    // Se mudou senha, criptografa
    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, 10);
    }

    await this.userRepository.update(id, dados);

    return this.findById(id);
  }

  async delete(id: number) {
    // Prote��o: n�o permite deletar admin padr�o
    if (id === 1) {
      throw new Error('N�o � poss�vel deletar o usu�rio administrador padr�o');
    }

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Usu�rio n�o encontrado');
    }
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usu�rio n�o encontrado');
    }

    user.role = role;
    await this.userRepository.save(user);

    return user.toJSON();
  }
}
```

### Passo 4.4: Criar `UserController` (`backend/src/controllers/user.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../types';

export class UserController {
  private userService = new UserService();

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        res.status(400).json({ error: 'Nome, email e senha s�o obrigat�rios' });
        return;
      }

      const result = await this.userService.register(nome, email, senha);
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao registrar usu�rio:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao registrar usu�rio'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ error: 'Email e senha s�o obrigat�rios' });
        return;
      }

      const result = await this.userService.login(email, senha);
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(401).json({
        error: error instanceof Error ? error.message : 'Erro ao fazer login'
      });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const user = await this.userService.findById(userId);
      res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar usu�rio:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar usu�rio'
      });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error('Erro ao listar usu�rios:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Erro ao listar usu�rios'
      });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(Number(id));
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Usu�rio n�o encontrado'
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const user = await this.userService.update(Number(id), req.body, userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar usu�rio'
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.userService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao deletar usu�rio'
      });
    }
  };

  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await this.userService.updateRole(Number(id), role);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar role'
      });
    }
  };
}
```

---

**Continua na parte 2...**

(Por quest�o de limite de tamanho, vou dividir em m�ltiplos arquivos. Este � apenas o in�cio mostrando a sequ�ncia EXATA de cria��o. Quer que eu continue com as pr�ximas partes?)

---

**Status atual:** 
- ? Setup inicial completo
- ? Backend estrutura base criada
- ? Banco de dados configurado
- ? Todas as entidades criadas
- ? Autentica��o implementada
- ? Pr�ximo: Features principais (Items, Proposals, Chat, etc.)




