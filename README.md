# ToDoList — Projeto Web (Backend + Frontend)

Sistema de lista de tarefas com API REST (Fastify + MySQL) e interface React + Vite.

## Requisitos

- Node.js 18+
- MySQL (XAMPP, WAMP ou standalone)

## Como rodar

### 1. Backend

Crie o banco de dados (com o MySQL ativo):

```bash
cd backend
mysql -u root -p < schema.sql
```

Instale as dependências e inicie:

```bash
npm install
npm run dev
```

A API sobe em `http://localhost:3333`.
Mais detalhes em [`backend/README.md`](backend/README.md).

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

> O frontend consome a API em `http://localhost:3333`, então o backend precisa estar rodando.

## Funcionalidades do frontend

- Listagem de tarefas com contadores de total e concluídas
- Criação de tarefas pelo botão **+** flutuante (modal "Create Task", com data limite opcional)
- Edição de tarefas pelo botão de lápis (modal "Edit Task")
- Exclusão de tarefas
- Marcar/desmarcar como concluída (checkbox com gradiente)
- Busca em tempo real com debounce
- Ordenação automática: tarefas com data mais próxima primeiro
- Tarefas em atraso: título em vermelho com selo "Em atraso"
- Botões de editar e excluir aparecem ao passar o mouse
- Estado vazio: "You have no pending tasks."

## Testes

```bash
cd frontend
npm test
```

Roda os testes de funcionalidade com Vitest + React Testing Library (10 testes cobrindo CRUD, contadores, atraso, busca e estado vazio).

## Estrutura

```
backend/
├── schema.sql           # Criação do banco e da tabela tasks
└── src/
    ├── server.js        # Inicialização do Fastify + CORS
    ├── db.js            # Pool de conexões com o MySQL
    └── routes/tasks.js  # Rotas CRUD de tarefas

frontend/
└── src/
    ├── App.jsx          # Tela principal (lista, contadores, busca, modais)
    ├── api.js           # Chamadas HTTP para o backend
    ├── components/      # TaskItem e TaskModal
    ├── utils/date.js    # Datas, atraso e ordenação
    └── App.test.jsx     # Testes de funcionalidade
```
