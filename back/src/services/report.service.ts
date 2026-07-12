import { AppDataSource } from '../config/database';
import { Report } from '../entities/Report';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { BadRequestError, NotFoundError } from '../errors/http-errors';
import { ReportStatus } from '../types';
import { ReportHistory } from '../entities/ReportHistory';
import logger from '../config/logger';

export class ReportService {
  private reportRepository = AppDataSource.getRepository(Report);
  private userRepository = AppDataSource.getRepository(User);
  private itemRepository = AppDataSource.getRepository(Item);
  private reportHistoryRepository = AppDataSource.getRepository(ReportHistory);

  async createReport(
    reporterId: number,
    reportedUserId: number | undefined, 
    reason: string,
    description: string | undefined,
    reportedItemId?: number
  ): Promise<Report> {
    try {
      const reporter = await this.userRepository.findOneBy({ id: reporterId });
      if (!reporter) {
        throw new NotFoundError('Usuário denunciante não encontrado.');
      }

      // Validação: Pelo menos um alvo (usuário ou item) deve ser fornecido
      if (!reportedUserId && !reportedItemId) {
         throw new BadRequestError('É necessário informar o usuário ou o item denunciado.');
      }
      if (!reason || reason.trim().length < 5) {
         throw new BadRequestError('O motivo da denúncia deve ter pelo menos 5 caracteres.');
      }

      // Log para debug da validação de report existente
      console.log('[DEBUG createReport] Checking for existing:', { reporterId, reportedUserId, reportedItemId });

      // Constrói a query para verificar denúncia existente PENDENTE
      const whereConditions = [];
      if (reportedUserId) {
          whereConditions.push({ reporterId, reportedUserId, status: ReportStatus.PENDENTE });
      }
      if (reportedItemId) {
          whereConditions.push({ reporterId, reportedItemId, status: ReportStatus.PENDENTE });
      }

      // Só executa a query se houver condições
      if (whereConditions.length > 0) {
        const existingReport = await this.reportRepository.findOne({ where: whereConditions });
        if (existingReport) {
          console.log('[DEBUG createReport] Found existing report:', existingReport); // Log se encontrar
          throw new BadRequestError('Já existe uma denúncia pendente sua para este alvo.');
        }
      } else {
        // Isso não deveria acontecer devido à validação anterior, mas é um fallback
        throw new BadRequestError('Alvo da denúncia (usuário ou item) não especificado.');
      }


      // Constrói o objeto de dados para a nova denúncia
      const reportData: Partial<Report> = {
        reporterId: reporter.id,
        reason,
        description,
        status: ReportStatus.PENDENTE, // Garante que começa como pendente
      };

      // Adiciona o usuário denunciado, se houver
      if (reportedUserId) {
        const reportedUser = await this.userRepository.findOneBy({ id: reportedUserId });
        if (!reportedUser) {
          throw new NotFoundError('Usuário denunciado não encontrado.');
        }
        reportData.reportedUserId = reportedUser.id;
      }

      // Adiciona o item denunciado, se houver
      if (reportedItemId) {
        const item = await this.itemRepository.findOneBy({ id: reportedItemId });
        if (!item) {
          throw new NotFoundError('Item denunciado não encontrado.');
        }
        // Validação extra: O item deve pertencer ao usuário denunciado (se houver)
        if (reportedUserId && item.ownerId !== reportedUserId) {
            throw new BadRequestError('O item denunciado não pertence ao usuário denunciado.');
        }
        reportData.reportedItemId = item.id;
      }

      const report = this.reportRepository.create(reportData);
      return this.reportRepository.save(report);
    } catch (error) {
      logger.error(`Erro ao criar denúncia pelo usuário ${reporterId}:`, { error });
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new Error('Falha ao registrar a denúncia no banco de dados.');
    }
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['reporter', 'reportedUser', 'reportedItem', 'history'], // Adicionado history
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(reportId: number): Promise<Report> {
    console.log(`[SERVICE DEBUG] findById - Buscando report com ID: ${reportId}`); 
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      // Garante que todas as relações necessárias, incluindo history, são carregadas
      relations: ['reporter', 'reportedUser', 'reportedItem', 'history'],
    });

    console.log(`[SERVICE DEBUG] findById - Resultado da busca no DB:`, report ? `Encontrado ID ${report.id}` : 'NÃO ENCONTRADO NO DB'); 

    if (!report) {
      throw new NotFoundError('Denúncia não encontrada.');
    }

    return report;
  }

  // ========================================================================
  // INÍCIO DA CORREÇÃO APLICADA
  // ========================================================================
  async updateStatus(reportId: number, status: ReportStatus, actionTaken: string | undefined, changedByUserId: number): Promise<Report> {
    // 1. Busca o report
    const report = await this.reportRepository.findOne({
        where: { id: reportId },
        relations: ['history']
    });

    if (!report) {
      throw new NotFoundError('Denúncia não encontrada.');
    }

    const oldStatus = report.status;

    // 2. Validações
    if (!Object.values(ReportStatus).includes(status)) {
      throw new BadRequestError(`Status inválido: ${status}`);
    }
    if (oldStatus === status) {
        console.warn(`[SERVICE WARN] Tentativa de atualizar report ${reportId} para o mesmo status (${status}). Nenhuma ação realizada.`);
        return report;
    }

    // 3. Atualiza o status do report principal E SALVA
    report.status = status;
    await this.reportRepository.save(report);

    // 4. Registra no histórico (APÓS salvar o report)
    const historyEntry = this.reportHistoryRepository.create({
      reportId: report.id, // ✅ CORREÇÃO CRÍTICA (do erro NOT NULL)
      changedByUserId,
      oldStatus: oldStatus,
      newStatus: status,
      actionTaken,
    });
    await this.reportHistoryRepository.save(historyEntry);

    // 5. Recarrega o report completo para retornar (garante que o histórico está incluído)
    const updatedReport = await this.findById(reportId);
    return updatedReport;
  }
  // ========================================================================
  // FIM DA CORREÇÃO APLICADA
  // ========================================================================
}