import api from './api';
import type { UserEvaluation } from '@/types';

/**
 * Fetches all user evaluations from the API.
 * @returns A promise that resolves to an array of UserEvaluation.
 * @throws An error if the API request fails, which will be handled by the axios interceptor.
 */
export async function fetchEvaluations(): Promise<UserEvaluation[]> {
  try {
    // Using the configured axios instance to make the request.
    // The endpoint is updated to match the one from the server logs.
    const response = await api.get<UserEvaluation[]>('/ratings/all');
    return response.data;
  } catch (error) {
    // The axios interceptor in `api.ts` will show a toast message.
    // We log the error here for debugging and re-throw it for the component to handle UI state (e.g., loading).
    console.error('Erro ao buscar avaliações no serviço:', error);
    throw error;
  }
}