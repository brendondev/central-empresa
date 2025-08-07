# Central Empresa

Monorepo para aplicação empresarial com backend NestJS e frontend React.

## 🚀 Como executar

1. **Clone o repositório**
   ```bash
   git clone <repo-url>
   cd central-empresa
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   cd ..
   
   # Frontend
   cd frontend
   cp .env.example .env
   cd ..
   ```

3. **Execute com Docker**
   ```bash
   docker-compose up -d
   ```

4. **Acesse as aplicações**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Swagger Documentation: http://localhost:3000/api/docs

## 📁 Estrutura do Projeto

```
central-empresa/
├── backend/              # API NestJS + TypeScript + TypeORM
├── frontend/             # React + Vite + TypeScript
├── infra/               # Configurações de infraestrutura
├── .github/workflows/   # GitHub Actions CI/CD
└── docker-compose.yml   # Orquestração dos serviços
```

## 🛠️ Tecnologias

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger

### Frontend
- React
- Vite
- TypeScript
- React Router
- Axios

### DevOps
- Docker
- Docker Compose
- GitHub Actions

## 📚 Rotas Frontend

- `/` - Página inicial
- `/chat` - Interface de chat
- `/docs` - Documentação
- `/rotas` - Gerenciamento de rotas

## 🔧 Desenvolvimento

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```