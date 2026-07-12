import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { getJWTSecret } from '../config/jwt';
import { User } from '../entities/User';
import { ChatService } from '../services/chat.service'; // Assumindo que ChatService existe
import { AuthRequest } from '../types'; // Assumindo o tipo AuthRequest para userId

interface SocketAuth {
  token?: string;
  userId?: number;
}

interface ChatMessagePayload {
  receiverId: number;
  itemId: number;
  content: string;
}

interface TypingStatusPayload {
  receiverId: number;
  itemId: number;
  isTyping: boolean;
}

export class ChatSocketHandler {
  private io: Server;
  private static instance: ChatSocketHandler;
  private connectedUsers = new Map<number, string[]>(); // Mapeia userId para array de socket.ids
  private chatService: ChatService;
  private userRepository = AppDataSource.getRepository(User);

  private constructor(io: Server) {
    this.io = io;
    this.chatService = new ChatService();
    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  public static getInstance(io?: Server): ChatSocketHandler {
    if (!ChatSocketHandler.instance) {
      if (!io) {
        throw new Error("A instância do servidor Socket.IO deve ser fornecida na primeira chamada a getInstance.");
      }
      ChatSocketHandler.instance = new ChatSocketHandler(io);
    }
    return ChatSocketHandler.instance;
  }

  private setupMiddleware() {
    this.io.use(async (socket: Socket, next) => {
      const token = (socket.handshake.auth as SocketAuth).token || (socket.handshake.query as SocketAuth).token;
      if (!token) {
        return next(new Error('Erro de autenticação: Token não fornecido.'));
      }

      try {
        const decoded = jwt.verify(token as string, getJWTSecret()) as { userId: number; role: string };
        (socket as any).userId = decoded.userId; // Anexa userId ao socket
        next();
      } catch (error) {
        return next(new Error('Erro de autenticação: Token inválido.'));
      }
    });
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      console.log(`Usuário ${userId} conectado com ID do socket: ${socket.id}`);

      // Armazena o ID do socket do usuário conectado
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId)?.push(socket.id);

      // Entra em uma sala pessoal para notificações gerais
      socket.join(`user:${userId}`);

      // Notifica outros usuários que este usuário ficou online
      socket.broadcast.emit('user:online', userId);

      // Listener para entrar em uma sala de chat específica
      socket.on('chat:join', (data: { otherUserId: number }) => {
        const conversationRoom = this.getConversationRoomName(userId, data.otherUserId);
        socket.join(conversationRoom);
        console.log(`[Socket] Usuário ${userId} entrou na sala de conversa com ${data.otherUserId}: ${conversationRoom}`);
      });

      // Listener para quando uma mensagem é enviada pelo cliente
      socket.on('message:send', async (payload: ChatMessagePayload) => {
        try {
          const senderId = (socket as any).userId;

          const message = await this.chatService.createMessage(
            senderId,
            payload.receiverId,
            payload.itemId,
            payload.content
          );

          if (message) {
            // Otimização: Emite a mensagem para a sala da conversa.
            // Todos os participantes (remetente e destinatário) que entraram na sala receberão.
            const conversationRoom = this.getConversationRoomName(senderId, payload.receiverId);
            this.io.to(conversationRoom).emit('message:received', message);

            // Emite a mensagem de volta para o remetente (para confirmação e atualização da UI)
            // A linha acima (io.to(conversationRoom)) já envia para o remetente também,
            // então a linha abaixo pode ser removida para evitar duplicatas.
            // socket.emit('message:received', message);
          }
        } catch (error) {
          console.error('[Socket] Erro ao lidar com message:send:', error);
          socket.emit('error', { message: 'Falha ao enviar mensagem.' });
        }
      });

      // Listener para quando o usuário está digitando
      socket.on('user:typing', (payload: TypingStatusPayload) => {
        const senderId = (socket as any).userId;
        const receiverSockets = this.connectedUsers.get(payload.receiverId);
        if (receiverSockets) {
          receiverSockets.forEach(socketId => {
            this.io.to(socketId).emit('user:typing', { senderId, isTyping: payload.isTyping });
          });
        }
      });

      // Listener para quando o cliente solicita a lista de usuários online
      socket.on('user:request_online_list', () => {
        socket.emit('user:online_list', Array.from(this.connectedUsers.keys()));
      });

      // Listener para marcar mensagens como lidas
      socket.on('message:read', async (data: { otherUserId: number }) => {
        await this.chatService.markAsRead(userId, data.otherUserId);
        // Notifica o outro usuário que as mensagens foram lidas (útil para o "visto por último")
        const otherUserSockets = this.connectedUsers.get(data.otherUserId);
        if (otherUserSockets) {
          otherUserSockets.forEach(socketId => {
            this.io.to(socketId).emit('message:was_read', { readerId: userId });
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Usuário ${userId} desconectado com ID do socket: ${socket.id}`);
        // Remove o ID do socket dos usuários conectados
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          const index = userSockets.indexOf(socket.id);
          if (index > -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            this.connectedUsers.delete(userId);
          }
        }
        // Notifica outros usuários que este usuário ficou offline
        this.io.emit('user:offline', userId);
      });
    });
  }

  // Helper para obter um nome de sala consistente para uma conversa
  private getConversationRoomName(user1Id: number, user2Id: number): string {
    // Garante um nome de sala consistente, independentemente da ordem do remetente/destinatário
    const participants = [user1Id, user2Id].sort((a, b) => a - b);
    return `conversation:${participants[0]}-${participants[1]}`;
  }

  // Método para enviar notificações a um usuário específico (usado por serviços)
  public sendNotification(userId: number, event: string, data: any) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.length > 0) {
      // Emite para a sala pessoal do usuário
      this.io.to(`user:${userId}`).emit(event, data);
      console.log(`Notificação '${event}' enviada para o usuário ${userId}`);
    } else {
      console.log(`Usuário ${userId} não está online para receber a notificação em tempo real '${event}'.`);
    }
  }
}