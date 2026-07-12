import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../config/jwt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

interface AuthSocket extends Socket {
  userId?: number;
  userRole?: string;
}


// Classe Singleton para gerenciar o WebSocket
export class ChatSocketHandler {
  private static instance: ChatSocketHandler;
  private io: Server;
  private chatService: ChatService;
  private userSockets: Map<number, Set<string>> = new Map();

  private constructor(io: Server) {
    this.io = io;
    this.chatService = new ChatService();
    this.setupHandlers();
  }

  public static getInstance(io?: Server): ChatSocketHandler {
    if (!ChatSocketHandler.instance && io) {
      ChatSocketHandler.instance = new ChatSocketHandler(io);
    }
    return ChatSocketHandler.instance;
  }

  public sendNotification(userId: number, event: string, data: any) {
    console.log(`📤 Enviando notificação para user ${userId}:`, event);
    this.io.to(`user:${userId}`).emit(event, data);
  }

  private setupHandlers() {
    // Middleware de autenticação
    this.io.use(async (socket: AuthSocket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log('❌ Conexão rejeitada: Token não fornecido');
        return next(new Error('Authentication error: Token not provided'));
      }
      try {
        const userRepository = AppDataSource.getRepository(User);
        const jwtSecret = getJWTSecret();
        const decoded = jwt.verify(token, jwtSecret) as any;

        const user = await userRepository.findOne({ where: { id: decoded.userId } });
        if (!user) {
          console.log(`❌ Conexão rejeitada: Usuário do token (ID: ${decoded.userId}) não encontrado.`);
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        console.log(`✅ Token validado para userId: ${user.id} (Role: ${user.role})`);
        next();
      } catch (err) {
        console.log('❌ Conexão rejeitada: Token inválido');
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Helper para obter um nome de sala consistente para uma conversa
    const getConversationRoomName = (user1Id: number, user2Id: number): string => {
      // Garante um nome de sala consistente, independentemente da ordem do remetente/destinatário
      const participants = [user1Id, user2Id].sort((a, b) => a - b);
      return `conversation:${participants[0]}-${participants[1]}`;
    };

    // Listener para entrar em uma sala de conversa
    const joinConversationHandler = (socket: AuthSocket, data: { otherUserId: number }) => {
      if (!socket.userId) return;
      const roomName = getConversationRoomName(socket.userId, data.otherUserId);
      socket.join(roomName);
      console.log(`[Socket] Usuário ${socket.userId} entrou na sala: ${roomName}`);
    };

    const connectionHandler = (socket: AuthSocket) => {
      const userId = socket.userId!;
      // Registra o socket do usuário
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(socket.id);

      // Entra na room do usuário
      socket.join(`user:${userId}`);
      
      // Notifica outros usuários que este está online
      socket.broadcast.emit('user:online', userId);
      console.log(`👤 Broadcast: user ${userId} está online`);

      // 🆕 NOVO: Listener para solicitar lista de usuários online
      socket.on('user:request_online_list', () => {
        const onlineUserIds = Array.from(this.userSockets.keys());
        socket.emit('user:online_list', onlineUserIds);
        console.log(`📋 Enviando lista de ${onlineUserIds.length} usuários online para user ${userId}`);
      });

      // Listener para entrar em uma sala de conversa
      socket.on('chat:join', (data) => joinConversationHandler(socket, data));

      // --- EVENTO: ENVIAR MENSAGEM ---
      socket.on('message:send', async (data) => {
        try {
          console.log(`📨 Recebido message:send de user ${userId}:`, data);
          
          // Aceita tanto 'content' quanto 'conteudo'
          const { receiverId, itemId, content, conteudo } = data;
          const messageContent = content || conteudo;
          
          if (!socket.userId || !messageContent) {
            console.log('❌ Dados inválidos para envio de mensagem');
            socket.emit('message:error', { error: 'Invalid message data' });
            return;
          }

          // Cria a mensagem no banco de dados
          const message = await this.chatService.createMessage(
            socket.userId,
            receiverId,
            itemId,
            messageContent
          );
          
          console.log(`💾 Mensagem salva no banco:`, message);

          // Garante que o campo 'content' existe na resposta
          const messageResponse = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            itemId: message.itemId,
            read: message.read,
            createdAt: message.createdAt
          };

          // Envia a mensagem para a sala da conversa correta
          const roomName = getConversationRoomName(socket.userId, receiverId);
          this.io.to(roomName).emit('message:received', messageResponse);

        } catch (err) {
          console.error('❌ Erro ao enviar mensagem:', err);
        }
      });

      // --- EVENTO: DESCONEXÃO ---
      socket.on('disconnect', () => {
        console.log(`🔌 Usuário ${userId} desconectado (socket: ${socket.id})`);
        
        const userSocketIds = this.userSockets.get(userId);
        if (userSocketIds) {
          userSocketIds.delete(socket.id);
          
          // Se não há mais sockets deste usuário, marca como offline
          if (userSocketIds.size === 0) {
            this.userSockets.delete(userId);
            socket.broadcast.emit('user:offline', userId);
            console.log(`👤 Broadcast: user ${userId} está offline`);
          }
        }
      });
    };

    this.io.on('connection', (socket: AuthSocket) => {
      if (!socket.userId) {
        console.log('❌ Conexão sem userId, desconectando.');
        socket.disconnect();
        return;
      }
      connectionHandler(socket);
    });
  }
}