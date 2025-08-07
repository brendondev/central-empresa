#!/bin/bash

# Script de setup inicial do projeto Central Empresa
# Este script configura o ambiente de desenvolvimento

set -e

echo "🚀 Configurando Central Empresa..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Edite conforme necessário."
else
    echo "ℹ️  Arquivo .env já existe."
fi

# Criar arquivos .env para backend e frontend
if [ ! -f backend/.env ]; then
    echo "📝 Criando arquivo .env do backend..."
    cp backend/.env.example backend/.env
    echo "✅ Arquivo backend/.env criado."
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Criando arquivo .env do frontend..."
    cp frontend/.env.example frontend/.env
    echo "✅ Arquivo frontend/.env criado."
fi

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down || true

# Fazer build e subir os containers
echo "🐳 Fazendo build e subindo containers..."
docker-compose up -d --build

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar se os serviços estão rodando
echo "🔍 Verificando status dos serviços..."
docker-compose ps

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend API: http://localhost:3000/api"
echo "   • Swagger Docs: http://localhost:3000/api/docs"
echo "   • Banco de dados: localhost:5432"
echo ""
echo "🛠️  Comandos úteis:"
echo "   • docker-compose logs -f          # Ver logs"
echo "   • docker-compose restart          # Reiniciar serviços"
echo "   • docker-compose down             # Parar tudo"
echo "   • npm run dev (em backend/)       # Desenvolvimento backend"
echo "   • npm run dev (em frontend/)      # Desenvolvimento frontend"
