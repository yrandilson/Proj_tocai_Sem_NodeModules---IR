import { format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibir apenas a hora e os minutos.
 * Exemplo: 14:30
 * @param date A data a ser formatada (string, número ou objeto Date)
 * @returns A hora formatada
 */
export function formatTime(date: string | number | Date): string {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
}

/**
 * Formata uma data para exibir o tempo relativo ao momento atual.
 * Exemplo: "há 5 min", "há 2 dias"
 * @param date A data a ser formatada (string, número ou objeto Date)
 * @returns O tempo relativo formatado
 */
export function formatRelativeTime(date: string | number | Date): string {
  if (!date) return '';
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}