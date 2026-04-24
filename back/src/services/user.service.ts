import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AuthRequest, UserRole } from '../types';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/http-errors';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'nome', 'email', 'telefone', 'role', 'createdAt'], // Não expor a senha
    });
  }

  async findById(id: number, checkBlocked = true): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (checkBlocked && user.isBlocked) {
      throw new ForbiddenError('Esta conta de usuário está bloqueada.');
    }

    return user;
  }

  async update(id: number, updateData: Partial<User>, requestingUserId: number, requestingUserRole: UserRole): Promise<User> {
    if (id !== requestingUserId && requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Você não tem permissão para atualizar este usuário.');
    }

    const user = await this.findById(id);
    // Impede que a senha seja atualizada por este método
    delete updateData.senha;
    
    this.userRepository.merge(user, updateData);
    return this.userRepository.save(user);
  }

  async delete(id: number, req: AuthRequest): Promise<void> {
    const { userId: requestingUserId, userRole: requestingUserRole } = req;

    // Regra 1: Ninguém pode deletar a si mesmo por esta rota
    if (id === requestingUserId) {
      throw new BadRequestError('Você não pode deletar sua própria conta através desta rota.');
    }

    // Regra 2: Apenas admins podem deletar outros usuários
    if (requestingUserRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Acesso negado. Apenas administradores podem deletar usuários.');
    }

    const userToDelete = await this.findById(id);
    if (!userToDelete) {
      throw new NotFoundError('Usuário não encontrado para deletar');
    }
    await this.userRepository.softRemove(userToDelete);
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.findById(id);
    user.role = role;
    return this.userRepository.save(user);
  }

  /**
   * Bloqueia ou desbloqueia um usuário (apenas admin)
   */
  async blockUser(id: number, isBlocked: boolean): Promise<User> {
    const user = await this.findById(id, false); // Não checa se está bloqueado, pois o objetivo é mudar o status
    user.isBlocked = isBlocked;
    return this.userRepository.save(user);
  }
}