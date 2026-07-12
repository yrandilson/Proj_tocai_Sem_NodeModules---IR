// Define and export the ProposalStatus enum
export enum ProposalStatus {
  PENDENTE = 'PENDENTE',
  ACEITA = 'ACEITA',
  RECUSADA = 'RECUSADA',
  // Add any other relevant statuses for a proposal
}

// You can add other shared types, interfaces, or enums here.

/**
 * Represents a user's evaluation of another user for a completed service/proposal.
 */
export interface UserEvaluation {
  id: number;
  rating: number; // e.g., a score from 1 to 5
  comment: string;
  evaluatorId: number; // ID of the user giving the evaluation
  evaluatedId: number; // ID of the user being evaluated
  createdAt: string; // ISO date string format
}