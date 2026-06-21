-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'USUARIO', -- 'ADMIN' ou 'USUARIO'
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    carga_horaria INTEGER NOT NULL,
    modalidade VARCHAR(50) NOT NULL, -- 'Presencial', 'EAD' ou 'Semipresencial'
    vagas INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo' -- 'Planejado', 'Ativo', 'Concluído', 'Cancelado'
);

-- Tabela de Participantes
CREATE TABLE IF NOT EXISTS participantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    escolaridade VARCHAR(100) NOT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
    id SERIAL PRIMARY KEY,
    participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Cancelado'
    CONSTRAINT unique_participante_curso UNIQUE (participante_id, curso_id)
);

-- Inserir usuário administrador inicial padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES ('Administrador Conecta', 'admin@conectafuturo.org', '$2a$10$XptG2kE7lI.yK50F.JbX.uWvT5v1M3c4L8rI6EwM9G.aL5Ew4qR/G', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
