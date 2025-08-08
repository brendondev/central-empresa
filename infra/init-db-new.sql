-- Criação do banco de dados central_empresa
-- Este script é executado automaticamente quando o container PostgreSQL é iniciado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de roles (cargos)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    level INTEGER NOT NULL DEFAULT 1,
    permissions JSON,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    "fullName" VARCHAR(100),
    "isActive" BOOLEAN DEFAULT true,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP,
    FOREIGN KEY ("roleId") REFERENCES roles(id)
);

-- Inserir cargos padrão
INSERT INTO roles (id, name, description, level, permissions) VALUES 
(0, 'Master Admin', 'Administrador master do sistema', 0, '["all"]'),
(1, 'Admin', 'Administrador do sistema', 1, '["users", "roles", "read", "write", "delete"]'),
(2, 'Manager', 'Gerente', 2, '["read", "write", "users_read"]'),
(3, 'Seller', 'Vendedor', 3, '["read", "write"]'),
(4, 'Rota', 'Responsável por rotas', 4, '["read", "routes"]'),
(5, 'Viewer', 'Visualizador', 5, '["read"]')
ON CONFLICT (id) DO NOTHING;

-- Inserir usuário master admin
-- Senha: 123 (hash bcrypt)
INSERT INTO users (username, password, email, "fullName", "isActive", "roleId") VALUES 
('blima', '$2b$10$8S2QgKoRIIgCqr1J8NzQw.ZgJJZQ3SZoGMHWgLYvQxhKZE/UXP2Aa', 'blima@central-empresa.com', 'Bruno Lima - Master Admin', true, 0)
ON CONFLICT (username) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users("roleId");
CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");

-- Função para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updatedAt
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
