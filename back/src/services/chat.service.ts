// backend/src/services/chat.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { ChatMessage } from '../entities/ChatMessage';
import { User } from '../entities/User';

export class ChatService {
  private messageRepository: Repository<ChatMessage>;
  private userRepository: Repository<User>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(ChatMessage);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Cria uma nova mensagem
   */
  async createMessage(
    senderId: number,
    receiverId: number,
    itemId: number,
    content: string
  ) {
    console.log('📝 [ChatService] Criando mensagem:', { senderId, receiverId, itemId, content });

    const message = this.messageRepository.create({
      senderId,
      receiverId,
      itemId,
      content: content,
      read: false,
    });

    const savedMessage = await this.messageRepository.save(message);
    console.log('💾 [ChatService] Mensagem salva com ID:', savedMessage.id);

    // Busca com relacionamentos
    const fullMessage = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'receiver', 'item']
    });

    if (!fullMessage) {
      throw new Error('Erro ao buscar mensagem salva');
    }

    // Retorna o objeto completo. O frontend deve se adaptar a este contrato.
    // A entidade pode usar @Exclude em campos sensíveis se necessário.
    console.log('✅ [ChatService] Mensagem criada:', { id: fullMessage.id, content: fullMessage.content });
    return fullMessage;
  }

  /**
   * Busca conversas do usuário
   */
  async getConversations(userId: number) {
    console.log('📋 [ChatService] Buscando conversas do usuário:', userId);

    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.item', 'item')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    console.log('📋 [ChatService] Mensagens encontradas:', messages.length);

    // Agrupa por conversa (outro usuário + item)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      // A chave da conversa agora é baseada apenas no ID do outro usuário,
      // unificando todas as conversas entre os mesmos dois usuários.
      const sortedIds = [userId, otherUserId].sort((a, b) => a - b);
      const key = `conv-${sortedIds[0]}-${sortedIds[1]}`;

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          otherUser: msg.senderId === userId ? msg.receiver : msg.sender,
          item: msg.item,
          lastMessage: {
            ...msg // Retorna a mensagem completa como a última mensagem
          },
          unreadCount: 0,
          messages: []
        });
      }

      const conversation = conversationsMap.get(key);
      conversation.messages.push(msg);
      
      if (!msg.read && msg.receiverId === userId) {
        conversation.unreadCount++;
      }
    });

    const result = Array.from(conversationsMap.values());
    console.log('✅ [ChatService] Conversas agrupadas:', result.length);
    return result;
  }

  /**
   * Busca mensagens entre dois usuários sobre um item
   */
  async getMessages(userId: number, otherUserId: number) {
    console.log('💬 [ChatService] Buscando mensagens:', { userId, otherUserId });

    const messages = await this.messageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ],
      relations: ['sender', 'receiver', 'item'],
      order: { createdAt: 'ASC' }
    });

    console.log('💬 [ChatService] Mensagens encontradas:', messages.length);

    return messages;
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(userId: number, otherUserId: number) {
    console.log('👁️ [ChatService] Marcando como lidas:', { userId, otherUserId });

    const result = await this.messageRepository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true })
      .where('receiverId = :userId', { userId })
      .andWhere('senderId = :otherUserId', { otherUserId })
      .andWhere('read = false')
      .execute();

    console.log('✅ [ChatService] Mensagens marcadas como lidas:', result.affected);
  }

  /**
   * Conta mensagens não lidas
   */
  async countUnread(userId: number): Promise<number> {
    const count = await this.messageRepository.count({
      where: { receiverId: userId, read: false }
    });
    
    console.log('🔢 [ChatService] Mensagens não lidas do usuário', userId, ':', count);
    return count;
  }

  /**
   * Arquiva mensagens de uma conversa (Soft Delete - P3)
   */
  async deleteConversation(userId: number, otherUserId: number, itemId: number) {
    console.log('🗑️ [ChatService] Arquivando conversa:', { userId, otherUserId, itemId });

    // 1. Encontra todas as mensagens da conversa
    const messages = await this.messageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId, itemId },
        { senderId: otherUserId, receiverId: userId, itemId }
      ],
      withDeleted: false, // Garante que só pegamos as não arquivadas
    });

    if (messages.length === 0) {
      console.log('⚠️ [ChatService] Nenhuma mensagem para arquivar');
      return;
    }

    // 2. Realiza o soft-delete (arquivamento)
    await this.messageRepository.softRemove(messages);

    console.log(`✅ [ChatService] ${messages.length} mensagens arquivadas (soft-deleted)`);
  }
}
