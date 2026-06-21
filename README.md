# Conecta Futuro - Sistema de Gestão de Cursos, Inscrições e Participantes

O **Conecta Futuro** é uma plataforma web completa desenvolvida para gerenciar cursos, inscrições e participantes do programa social homônimo. O projeto foi projetado utilizando o padrão **MVC (Model-View-Controller)** no Back-end com Node.js, Express e PostgreSQL, integrado a um Front-end moderno, responsivo e construído com tecnologias web puras (HTML5, CSS3 e JavaScript puro).

---

## 🚀 Sumário
1. [Arquitetura do Projeto](#-arquitetura-do-projeto)
2. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
3. [Instalação e Execução Local](#-instalação-e-execução-local)
4. [Mapeamento da API REST](#-mapeamento-da-api-rest)
5. [Protótipo Interativo Offline (Demo)](#-protótipo-interativo-offline-demo)
6. [Guia de Deploy em Produção (AWS EC2 + PM2 + Nginx)](#-guia-de-deploy-em-produção-aws-ec2--pm2--nginx)

---

## 📂 Arquitetura do Projeto

A organização de diretórios e arquivos segue a separação de responsabilidades (MVC) de forma limpa e padronizada:

```
InstitutoConecta/
├── db/
│   └── schema.sql            # Script SQL DDL de criação do banco e sementes
├── public/                   # Arquivos estáticos do Front-end (página de admin/API)
│   ├── css/
│   │   └── style.css         # Estilização completa do painel admin e home
│   ├── js/
│   │   ├── api.js            # Wrapper centralizador de chamadas HTTP (Fetch API)
│   │   ├── home.js           # Exibição de cursos abertos ao público
│   │   ├── login.js          # Submissão de login e guarda do token
│   │   └── admin.js          # Controle da interface SPA e operações de CRUD
│   ├── admin.html            # Painel administrativo (SPA com abas)
│   ├── plataforma.html       # Plataforma offline com banco fictício em localStorage
│   ├── index.html            # Landing page da área logada da API
│   └── login.html            # Tela de Login do painel
├── src/                      # Código-fonte do Back-end
│   ├── config/
│   │   └── db.js             # Pool de conexão com o PostgreSQL
│   ├── controllers/          # Controladores das rotas HTTP
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courseController.js
│   │   ├── participantController.js
│   │   ├── enrollmentController.js
│   │   └── dashboardController.js
│   ├── middleware/           # Middlewares (Autenticação JWT e Perfis)
│   │   └── authMiddleware.js
│   ├── routes/               # Definição e agrupamento de rotas
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── participantRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── index.js
│   ├── services/             # Regras de negócio e comandos SQL
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── courseService.js
│   │   ├── participantService.js
│   │   └── enrollmentService.js
│   └── app.js                # Inicialização e configuração do servidor Express
├── css/                      # CSS da Landing Page Institucional Geral
│   └── style.css
├── js/                       # JS da Landing Page Institucional Geral
│   └── script.js
├── index.html                # Landing Page Institucional da ONG (redireciona para login/plataforma)
├── plataforma.html           # Cópia raiz da plataforma offline interativa
├── .env                      # Variáveis de ambiente locais (sensíveis, não commitado)
├── .env.example              # Modelo padrão de configuração do ambiente
└── package.json              # Manifesto do projeto Node.js
```

---

## 🗄️ Configuração do Banco de Dados

O banco de dados recomendado é o **PostgreSQL** (versão 14 ou superior).

1. Conecte-se ao seu console PostgreSQL.
2. Crie a base de dados do projeto:
   ```sql
   CREATE DATABASE conectafuturo;
   ```
3. Execute o script contido em [db/schema.sql](file:///c:/Users/micha/OneDrive/Área de Trabalho/InstitutoConecta/db/schema.sql) para gerar a estrutura de tabelas. Esse script também insere um administrador padrão:
   ```bash
   psql -U seu_usuario -d conectafuturo -f db/schema.sql
   ```

### Usuário Administrador Semente:
- **E-mail**: `admin@conectafuturo.org`
- **Senha**: `admin123`

---

## ⚙️ Instalação e Execução Local

### 1. Clonar e Instalar Dependências
Navegue até a pasta raiz do projeto e instale as dependências:
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e preencha as credenciais correspondentes do seu PostgreSQL:
```bash
cp .env.example .env
```
Edite as variáveis no arquivo `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=conectafuturo
JWT_SECRET=sua_chave_secreta_jwt_super_segura
JWT_EXPIRES_IN=24h
```

### 3. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor será iniciado na porta especificada (padrão: `3000`). Acesse `http://localhost:3000` no seu navegador.

---

## 📡 Mapeamento da API REST

Todas as requisições que modificam ou consultam dados protegidos exigem o cabeçalho HTTP:
`Authorization: Bearer <token_jwt>`

### 🔑 1. Autenticação
* **POST `/api/auth/login`**
  - **Payload**: `{ "email": "admin@conectafuturo.org", "senha": "admin123" }`
  - **Resposta (200 OK)**: `{ "token": "...", "usuario": { "id": 1, "nome": "Admin", "email": "...", "perfil": "ADMIN" } }`

---

### 📊 2. Dashboard
* **GET `/api/dashboard/metrics`** *(Requer Token: ADMIN ou USUARIO)*
  - **Resposta (200 OK)**:
    ```json
    {
      "participantesCount": 120,
      "cursosCount": 8,
      "inscricoesCount": 95,
      "cursosPopulares": [
        { "titulo": "Desenvolvimento Web", "inscritos_count": "45" },
        { "titulo": "Introdução a Redes", "inscritos_count": "30" }
      ]
    }
    ```

---

### 👥 3. CRUD Usuários *(Requer Token: ADMIN)*
* **GET `/api/users`** -> Lista todos os administradores/gestores.
* **POST `/api/users`** -> Cria um novo usuário.
  - **Payload**: `{ "nome": "Carlos", "email": "carlos@conectafuturo.org", "senha": "123", "perfil": "USUARIO" }`
* **PUT `/api/users/:id`** -> Atualiza nome, e-mail, senha e perfil do usuário.
* **DELETE `/api/users/:id`** -> Exclui o usuário.

---

### 📚 4. CRUD Cursos *(Consultas públicas, Alterações requerem ADMIN ou USUARIO)*
* **GET `/api/courses`** -> Lista cursos ativos.
* **GET `/api/courses/:id`** -> Retorna detalhes de um curso específico.
* **POST `/api/courses`** -> Cria um curso.
  - **Payload**: `{ "titulo": "Cybersecurity", "descricao": "Fundamentos", "carga_horaria": 40, "modalidade": "EAD", "vagas": 30, "data_inicio": "2026-07-01", "data_fim": "2026-07-15", "status": "Ativo" }`
* **PUT `/api/courses/:id`** -> Atualiza os dados do curso.
* **DELETE `/api/courses/:id`** -> Remove o curso.

---

### 🧑‍🎓 5. CRUD Participantes *(Requer Token: ADMIN ou USUARIO)*
* **GET `/api/participants`** -> Lista participantes com busca textual.
* **POST `/api/participants`** -> Cadastra participante.
  - **Payload**: `{ "nome": "Maria Silva", "cpf": "123.456.789-00", "email": "maria@gmail.com", "telefone": "(11) 99999-9999", "municipio": "São Paulo", "escolaridade": "Ensino Médio Completo" }`
* **PUT `/api/participants/:id`** -> Atualiza o cadastro do participante.
* **DELETE `/api/participants/:id`** -> Remove o participante (exclui inscrições em cascata).

---

### 📝 6. CRUD Inscrições *(Requer Token: ADMIN ou USUARIO)*
* **GET `/api/enrollments`** -> Lista todas as inscrições.
* **POST `/api/enrollments`** -> Efetua inscrição de um participante em um curso.
  - **Payload**: `{ "participante_id": 1, "curso_id": 2 }`
* **PUT `/api/enrollments/:id/cancelar`** -> Cancela a inscrição (atualiza status e libera vaga).
* **GET `/api/enrollments/curso/:cursoId`** -> Retorna a lista de alunos matriculados em um curso.
* **GET `/api/enrollments/participante/:participanteId`** -> Retorna as inscrições de um participante.

---

## 🎨 Plataforma Interativa Offline

Para permitir testes imediatos do front-end sem depender da instalação do Node.js ou configuração do PostgreSQL, o projeto inclui o arquivo **[plataforma.html](file:///c:/Users/micha/OneDrive/Área de Trabalho/InstitutoConecta/plataforma.html)**.

- **Como funciona**: Ele intercepta toda a lógica do front-end e utiliza o `localStorage` do navegador como base de dados fictícia.
- **Como utilizar**: Basta dar um duplo clique no arquivo `plataforma.html` no seu navegador. Você poderá cadastrar cursos, registrar participantes, efetuar inscrições, visualizar o dashboard em tempo real e simular as telas de Login e Administração.
- **Redirecionamento**: A Landing Page institucional (`index.html`) já vem configurada para abrir o painel digital diretamente no fluxo de login ao clicar no botão "Acessar Minha Conta".

---

## ☁️ Guia de Deploy em Produção (AWS EC2 + PM2 + Nginx)

Instruções para implantar a aplicação de forma profissional em uma instância Linux (Ubuntu Server) na nuvem da AWS.

### 📦 1. Configurando a Instância AWS EC2
1. No console AWS, inicie uma instância EC2 (Ubuntu 22.04 LTS).
2. Configure o **Security Group** permitindo entrada nas portas:
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)

---

### 🛠️ 2. Atualização e Instalação do Node.js e PostgreSQL
Conecte-se à sua instância via SSH e instale as ferramentas necessárias:
```bash
sudo apt update && sudo apt upgrade -y

# Instalar Node.js LTS (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

Configure o PostgreSQL e restaure o banco utilizando o script DDL `db/schema.sql` conforme as instruções da seção de Banco de Dados.

---

### ⚙️ 3. Configurando a Aplicação e Variáveis de Ambiente
Clone o seu repositório na máquina EC2:
```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/InstitutoConecta.git conecta-futuro
cd conecta-futuro

# Instalar dependências de produção
sudo npm install --omit=dev
```
Crie e edite o arquivo `.env` de produção:
```bash
sudo cp .env.example .env
sudo nano .env
```
*Configure o `NODE_ENV=production` e preencha as senhas seguras.*

---

### 🔄 4. Configurando o Process Manager (PM2)
O PM2 gerencia o processo do Node.js para mantê-lo rodando em segundo plano e reiniciá-lo caso ocorra alguma falha crítica ou reinicialização do sistema.

```bash
# Instalar o PM2 globalmente
sudo npm install -g pm2

# Iniciar a aplicação sob supervisão do PM2
pm2 start src/app.js --name "conecta-futuro"

# Configurar reinicialização automática do PM2 com o boot do sistema
pm2 startup systemd
```
*Copie e execute o comando retornado no terminal pelo comando acima para habilitar o serviço systemd.*

Em seguida, salve o estado atual dos processos:
```bash
pm2 save
```

---

### 🌐 5. Configuração do Proxy Reverso Nginx
O Nginx receberá as conexões públicas na porta `80` (HTTP) e as redirecionará internamente para o servidor Express rodando na porta `3000`.

```bash
# Instalar o Nginx
sudo apt install nginx -y

# Criar arquivo de configuração virtual para o projeto
sudo nano /etc/nginx/sites-available/conecta-futuro
```

Cole a seguinte configuração no editor:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com; # Ou IP público da AWS

    # Servir arquivos estáticos diretamente (Melhor performance)
    location / {
        root /var/www/conecta-futuro/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Redirecionar endpoints de API para o serviço Express no PM2
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
# Criar link simbólico para ativação
sudo ln -s /etc/nginx/sites-available/conecta-futuro /etc/nginx/sites-enabled/

# Desativar a configuração padrão padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl restart nginx
```

---

### 🔒 6. Configuração de HTTPS com Let's Encrypt (Certbot)
Para proteger as credenciais e dados dos alunos com criptografia SSL/TLS:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```
*Siga as instruções na tela e escolha a opção de redirecionar automaticamente todo o tráfego HTTP para HTTPS.*
