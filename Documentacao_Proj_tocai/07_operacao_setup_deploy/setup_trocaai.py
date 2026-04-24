#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script Python para criar estrutura do projeto TrocaAi
Funciona em Windows, Linux e Mac
Execute: python setup_trocaai.py
"""

import os
import sys
from pathlib import Path

def criar_diretorio(caminho):
    """Cria um diretório se não existir"""
    Path(caminho).mkdir(parents=True, exist_ok=True)
    return caminho

def criar_arquivo(caminho):
    """Cria um arquivo vazio se não existir"""
    Path(caminho).touch(exist_ok=True)
    return caminho

def criar_estrutura():
    """Cria toda a estrutura do projeto"""
    
    print("🚀 Criando estrutura do projeto TrocaAi...")
    print()
    
    # Criar pasta raiz
    base_dir = "trocaai"
    criar_diretorio(base_dir)
    os.chdir(base_dir)
    
    # ====================================
    # BACKEND
    # ====================================
    print("📁 Criando estrutura do BACKEND...")
    
    backend_dirs = [
        "backend/src/config",
        "backend/src/entities",
        "backend/src/middlewares",
        "backend/src/routes",
        "backend/src/controllers",
        "backend/src/services",
        "backend/src/types"
    ]
    
    for dir_path in backend_dirs:
        criar_diretorio(dir_path)
    
    backend_files = [
        "backend/package.json",
        "backend/tsconfig.json",
        "backend/.env.example",
        "backend/.gitignore",
        "backend/src/config/database.ts",
        "backend/src/entities/User.ts",
        "backend/src/entities/Item.ts",
        "backend/src/entities/Proposal.ts",
        "backend/src/middlewares/auth.middleware.ts",
        "backend/src/routes/index.ts",
        "backend/src/controllers/user.controller.ts",
        "backend/src/controllers/item.controller.ts",
        "backend/src/controllers/proposal.controller.ts",
        "backend/src/services/user.service.ts",
        "backend/src/services/item.service.ts",
        "backend/src/services/proposal.service.ts",
        "backend/src/types/index.ts",
        "backend/src/server.ts"
    ]
    
    for file_path in backend_files:
        criar_arquivo(file_path)
    
    print(f"✅ Backend: {len(backend_files)} arquivos criados")
    print()
    
    # ====================================
    # FRONTEND
    # ====================================
    print("📁 Criando estrutura do FRONTEND...")
    
    frontend_dirs = [
        "frontend/src/assets",
        "frontend/src/components",
        "frontend/src/views",
        "frontend/src/stores",
        "frontend/src/router",
        "frontend/src/services",
        "frontend/src/types",
        "frontend/public"
    ]
    
    for dir_path in frontend_dirs:
        criar_diretorio(dir_path)
    
    frontend_files = [
        "frontend/package.json",
        "frontend/vite.config.ts",
        "frontend/tsconfig.json",
        "frontend/tsconfig.node.json",
        "frontend/tailwind.config.js",
        "frontend/postcss.config.js",
        "frontend/index.html",
        "frontend/.env.example",
        "frontend/.gitignore",
        "frontend/src/main.ts",
        "frontend/src/App.vue",
        "frontend/src/assets/main.css",
        "frontend/src/components/AppHeader.vue",
        "frontend/src/components/AppFooter.vue",
        "frontend/src/components/ItemCard.vue",
        "frontend/src/views/HomeView.vue",
        "frontend/src/views/LoginView.vue",
        "frontend/src/views/RegisterView.vue",
        "frontend/src/views/ItemDetailsView.vue",
        "frontend/src/views/MyItemsView.vue",
        "frontend/src/views/NewItemView.vue",
        "frontend/src/views/EditItemView.vue",
        "frontend/src/views/MyProposalsView.vue",
        "frontend/src/views/ReceivedProposalsView.vue",
        "frontend/src/views/ProfileView.vue",
        "frontend/src/views/AdminView.vue",
        "frontend/src/views/NotFoundView.vue",
        "frontend/src/stores/auth.ts",
        "frontend/src/stores/item.ts",
        "frontend/src/stores/proposal.ts",
        "frontend/src/router/index.ts",
        "frontend/src/services/api.ts",
        "frontend/src/types/index.ts"
    ]
    
    for file_path in frontend_files:
        criar_arquivo(file_path)
    
    print(f"✅ Frontend: {len(frontend_files)} arquivos criados")
    print()
    
    # ====================================
    # DOCUMENTAÇÃO
    # ====================================
    print("📁 Criando documentação...")
    
    doc_files = [
        "README.md",
        "DOCUMENTACAO.md",
        "INSTALACAO.md"
    ]
    
    for file_path in doc_files:
        criar_arquivo(file_path)
    
    print(f"✅ Documentação: {len(doc_files)} arquivos criados")
    print()
    
    # ====================================
    # CRIAR ARQUIVO DE MAPA
    # ====================================
    criar_mapa_arquivos(backend_files, frontend_files, doc_files)
    
    # ====================================
    # RESUMO
    # ====================================
    print()
    print("=" * 50)
    print("✅ ESTRUTURA CRIADA COM SUCESSO!")
    print("=" * 50)
    print()
    print("📂 Estrutura do projeto:")
    print(f"   trocaai/")
    print(f"   ├── backend/ ({len(backend_files)} arquivos)")
    print(f"   ├── frontend/ ({len(frontend_files)} arquivos)")
    print(f"   └── Documentação ({len(doc_files)} arquivos)")
    print()
    print("📋 Arquivos criados:")
    print(f"   • MAPA_ARQUIVOS.txt - Lista de todos os arquivos")
    print()
    print("📝 Próximos passos:")
    print("   1. Abra a pasta 'trocaai' no VSCode")
    print("   2. Consulte MAPA_ARQUIVOS.txt para saber qual conteúdo vai em cada arquivo")
    print("   3. Copie e cole o conteúdo correspondente em cada arquivo")
    print("   4. Siga o guia INSTALACAO.md")
    print()
    print("💡 Dica: Use Ctrl+K no VSCode para buscar arquivos rapidamente!")
    print()
    print(f"✨ Estrutura criada em: {os.getcwd()}")

def criar_mapa_arquivos(backend_files, frontend_files, doc_files):
    """Cria um arquivo com o mapa de todos os arquivos"""
    
    conteudo = """# 📋 MAPA DE ARQUIVOS - TrocaAi

Este arquivo lista todos os arquivos criados e qual conteúdo deve ser colado em cada um.
Use este guia para copiar o conteúdo correto em cada arquivo.

## 📦 BACKEND

"""
    
    for i, arquivo in enumerate(backend_files, 1):
        nome_arquivo = os.path.basename(arquivo)
        conteudo += f"{i}. `{arquivo}`\n"
        conteudo += f"   → Copie o conteúdo de: **Backend - {nome_arquivo}**\n\n"
    
    conteudo += "\n## 🎨 FRONTEND\n\n"
    
    for i, arquivo in enumerate(frontend_files, 1):
        nome_arquivo = os.path.basename(arquivo)
        conteudo += f"{i}. `{arquivo}`\n"
        conteudo += f"   → Copie o conteúdo de: **Frontend - {nome_arquivo}**\n\n"
    
    conteudo += "\n## 📚 DOCUMENTAÇÃO\n\n"
    
    mapa_docs = {
        "README.md": "README.md - Projeto TrocaAi",
        "DOCUMENTACAO.md": "TrocaAi - Documentação Completa",
        "INSTALACAO.md": "Guia de Instalação e Execução"
    }
    
    for i, arquivo in enumerate(doc_files, 1):
        conteudo += f"{i}. `{arquivo}`\n"
        conteudo += f"   → Copie o conteúdo de: **{mapa_docs[arquivo]}**\n\n"
    
    conteudo += """
## 🚀 ORDEM RECOMENDADA PARA PREENCHER

### 1️⃣ Primeiro - Configuração
- backend/package.json
- backend/tsconfig.json
- backend/.env.example
- frontend/package.json
- frontend/vite.config.ts
- frontend/tsconfig.json
- frontend/tailwind.config.js

### 2️⃣ Segundo - Backend (nesta ordem)
1. src/types/index.ts
2. src/entities/*.ts
3. src/config/database.ts
4. src/middlewares/auth.middleware.ts
5. src/services/*.service.ts
6. src/controllers/*.controller.ts
7. src/routes/index.ts
8. src/server.ts

### 3️⃣ Terceiro - Frontend (nesta ordem)
1. src/types/index.ts
2. src/services/api.ts
3. src/stores/*.ts
4. src/router/index.ts
5. src/main.ts
6. src/App.vue
7. src/assets/main.css
8. src/components/*.vue
9. src/views/*.vue

### 4️⃣ Quarto - Documentação
- README.md
- DOCUMENTACAO.md
- INSTALACAO.md

## 💡 DICAS

- Use o VS Code para facilitar (Ctrl+P para buscar arquivos)
- Copie e cole um arquivo por vez
- Teste o backend antes de preencher o frontend
- Salve todos os arquivos antes de executar

## ✅ CHECKLIST

Marque conforme for preenchendo:

### Backend
- [ ] Todos os arquivos de configuração
- [ ] Entities (User, Item, Proposal)
- [ ] Middlewares
- [ ] Services
- [ ] Controllers
- [ ] Routes
- [ ] Server

### Frontend
- [ ] Arquivos de configuração
- [ ] Types e Services
- [ ] Stores (auth, item, proposal)
- [ ] Router
- [ ] Componentes base
- [ ] Views principais
- [ ] CSS

### Documentação
- [ ] README.md
- [ ] DOCUMENTACAO.md
- [ ] INSTALACAO.md

## 🎯 PRÓXIMO PASSO

Após preencher todos os arquivos, execute:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

Boa sorte! 🚀
"""
    
    with open("MAPA_ARQUIVOS.txt", "w", encoding="utf-8") as f:
        f.write(conteudo)
    
    print("📝 Arquivo MAPA_ARQUIVOS.txt criado com sucesso!")

if __name__ == "__main__":
    try:
        criar_estrutura()
    except Exception as e:
        print(f"❌ Erro: {e}", file=sys.stderr)
        sys.exit(1)