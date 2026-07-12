# Guia de Deploy — TrocaAi

Passo a passo para subir o projeto no servidor usando Docker Compose.
Testado em Ubuntu 22.04 com Docker 26+ e Docker Compose v2.

---

## Pré-requisitos no servidor

```bash
# Instalar Docker (se ainda não tiver)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verificar versões
docker --version          # Docker 24+
docker compose version    # v2.x
```

---

## 1. Clonar o repositório

```bash
# Cria a pasta projetos no home (se não existir)
mkdir -p ~/projetos

git clone <URL_DO_SEU_REPO> ~/projetos/trocaai
cd ~/projetos/trocaai
```

---

## 2. Configurar variáveis de ambiente

```bash
cp back/.env.example back/.env
nano back/.env
```

Preencha **todos** os campos marcados com `COLOQUE_AQUI_...`:

### Gerar JWT_SECRET e REFRESH_TOKEN_SECRET

```bash
# Gera dois secrets seguros (64 bytes cada)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Rode duas vezes — um para JWT_SECRET, outro para REFRESH_TOKEN_SECRET
```

### Gerar chaves VAPID (push notifications)

```bash
npx web-push generate-vapid-keys
```

Cole `Public Key` em `VAPID_PUBLIC_KEY` e `Private Key` em `VAPID_PRIVATE_KEY`.

### Configurar banco de dados

Para **MySQL** (recomendado em produção):

```dotenv
DB_TYPE=mysql
DB_HOST=db              # nome do serviço no docker-compose
DB_PORT=3306
DB_USER=trocaai
DB_PASS=senha_segura_aqui
DB_NAME=trocaai_prod
DB_ROOT_PASS=senha_root_aqui
```

Para **SQLite** (mais simples, suficiente para uso leve):

```dotenv
DB_TYPE=sqlite
DB_DATABASE=/app/uploads/database.sqlite   # dentro do volume persistido
```

Se usar SQLite, comente o bloco `db:` no `docker-compose.yml` e remova o `depends_on: db` do serviço `backend`.

### Configurar URL do frontend

```dotenv
FRONTEND_URL=https://seudominio.com.br
NODE_ENV=production
```

---

## 3. Build e subida dos containers

```bash
cd ~/projetos/trocaai

# Build das imagens (primeira vez ou após mudanças no código)
docker compose build --no-cache

# Sobe todos os serviços em background
docker compose up -d

# Acompanha os logs em tempo real
docker compose logs -f
```

---

## 4. Verificar que está funcionando

```bash
# Status dos containers
docker compose ps

# Testar API
curl http://localhost/api/auth/me
# Esperado: 401 Unauthorized (correto — não está autenticado)

# Ver logs de um serviço específico
docker compose logs backend --tail=50
docker compose logs frontend --tail=20
```

---

## 5. Configurar HTTPS com Nginx Proxy (recomendado)

Se você já usa **Nginx Proxy Manager** ou **Traefik** no servidor (como no seu setup com Gitea/Outline):

### Com Nginx Proxy Manager

1. Acesse o painel do NPM
2. Crie um novo **Proxy Host**:
   - Domain: `seudominio.com.br`
   - Scheme: `http`
   - Forward Hostname/IP: `localhost`
   - Forward Port: `80`
3. Ative **SSL** com Let's Encrypt

### Ajuste de CORS após ativar HTTPS

Atualize `back/.env`:
```dotenv
FRONTEND_URL=https://seudominio.com.br
```

Reinicie o backend:
```bash
docker compose restart backend
```

---

## 6. Atualizar o projeto (deploy de nova versão)

```bash
cd ~/projetos/trocaai

# Puxa o código novo
git pull

# Rebuilda apenas os serviços alterados
docker compose build

# Reinicia com zero downtime (substitui container um a um)
docker compose up -d --no-deps backend
docker compose up -d --no-deps frontend

# As migrations rodam automaticamente no start do backend (ver Dockerfile CMD)
```

---

## 7. Backup do banco de dados

### MySQL

```bash
# Backup
docker compose exec db mysqldump -u trocaai -p trocaai_prod > backup_$(date +%Y%m%d).sql

# Restaurar
docker compose exec -T db mysql -u trocaai -p trocaai_prod < backup_20240101.sql
```

### SQLite

```bash
# O arquivo fica no volume — copie direto
docker run --rm -v trocaai_uploads_data:/data alpine \
  cp /data/database.sqlite /backup/database_$(date +%Y%m%d).sqlite
```

---

## 8. Comandos úteis de manutenção

```bash
# Parar tudo
docker compose down

# Parar e apagar volumes (CUIDADO: apaga o banco e uploads)
docker compose down -v

# Entrar no container do backend
docker compose exec backend sh

# Rodar migrations manualmente
docker compose exec backend node -e "
  require('./dist/config/database').AppDataSource
    .initialize()
    .then(ds => ds.runMigrations())
    .then(() => { console.log('OK'); process.exit(0); })
"

# Ver uso de disco dos volumes
docker system df -v

# Limpar imagens antigas
docker image prune -f
```

---

## 9. Variáveis obrigatórias — checklist

| Variável | Obrigatória | Valor de exemplo |
|---|---|---|
| `JWT_SECRET` | Sim | string aleatória 64 chars |
| `REFRESH_TOKEN_SECRET` | Sim | string aleatória 64 chars (diferente do JWT) |
| `NODE_ENV` | Sim | `production` |
| `FRONTEND_URL` | Sim | `https://seudominio.com.br` |
| `DB_TYPE` | Sim | `mysql` ou `sqlite` |
| `DB_HOST` | Só MySQL | `db` |
| `DB_USER` | Só MySQL | `trocaai` |
| `DB_PASS` | Só MySQL | senha segura |
| `DB_NAME` | Só MySQL | `trocaai_prod` |
| `VAPID_PUBLIC_KEY` | Para push | gerado com `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Para push | gerado junto com a pública |
| `VAPID_SUBJECT` | Para push | `mailto:admin@seudominio.com.br` |

---

## 10. Estrutura de arquivos gerados

```
~/projetos/trocaai/
├── back/
│   ├── .env              ← criado por você (não vai pro git)
│   ├── .env.example      ← template com instruções
│   └── Dockerfile
├── front/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── DEPLOY.md             ← este arquivo
```

Volumes Docker (persistidos entre restarts):
- `trocaai_db_data` — dados do MySQL
- `trocaai_uploads_data` — imagens enviadas pelos usuários
