#!/bin/bash

# Script para iniciar backend e frontend simultaneamente
echo "🚀 Iniciando TrocaAi..."

# Inicia o backend em background
cd backend && npm run dev &
BACKEND_PID=$!

# Inicia o frontend em background  
cd frontend && npm run dev &
FRONTEND_PID=$!

# Aguarda ambos os processos
wait $BACKEND_PID $FRONTEND_PID
