-- Script de inicialização do banco de dados Central Empresa
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar schema para auditoria (opcional)
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabela de exemplo: Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de exemplo: Empresas
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Inserir dados de exemplo
INSERT INTO companies (name, cnpj, email, phone, address) VALUES
    ('Central Empresa LTDA', '12345678000100', 'contato@centralempresa.com', '11999999999', 'São Paulo, SP')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO users (email, name, password_hash) VALUES
    ('admin@centralempresa.com', 'Administrador', '$2b$10$example.hash.here')
ON CONFLICT (email) DO NOTHING;

-- Comentários sobre as tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE companies IS 'Tabela de empresas cadastradas';

-- TODO: Adicionar mais tabelas conforme necessário:
-- - departments (departamentos)
-- - roles (funções/permissões)  
-- - user_roles (relacionamento usuário-função)
-- - chat_rooms (salas de chat)
-- - chat_messages (mensagens do chat)
-- - system_routes (rotas do sistema)
-- - audit_logs (logs de auditoria)
