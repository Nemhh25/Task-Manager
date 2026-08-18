# Task Manager — Full Stack com Autenticação

Aplicação full stack de gerenciamento de tarefas: cada usuário cria conta, autentica-se e gerencia suas próprias tarefas, sem acesso às tarefas de outros usuários. Quarto projeto de uma trilha de portfólio — o primeiro controlando back-end, banco de dados e autenticação, não apenas consumindo uma API de terceiros.

**🔗 Front-end:** https://task-manager-blush-gamma-9ghqy1drbg.vercel.app/
**🔗 API:** https://task-manager-mtlz.onrender.com

> A API roda em plano gratuito da Render, que hiberna após inatividade — a primeira requisição depois de um tempo parado pode levar cerca de 1 minuto para responder.

## Sobre o projeto

O objetivo central deste projeto foi construir, do zero, o ciclo completo de uma aplicação real: modelagem de banco relacional, API REST protegida, autenticação segura com hash de senha e JWT, e autorização por dono do recurso — a peça mais frequentemente esquecida por quem está aprendendo back-end.

## Funcionalidades

- Cadastro e login com senha protegida por hash (bcrypt)
- Sessão via JWT em cookie `httpOnly` (não em `localStorage`, para mitigar roubo de token via XSS)
- CRUD completo de tarefas: criar, listar, editar, marcar como concluída, excluir
- Autorização por dono do recurso — cada usuário só acessa suas próprias tarefas, mesmo tentando forçar o ID de outra tarefa na URL
- Rotas protegidas no front-end, com redirecionamento automático para login
- Validação de entrada nas rotas da API, com respostas de erro específicas (400, 401, 404, 409) em vez de erros genéricos

## Tecnologias utilizadas

**Back-end**
- Node.js + Express + TypeScript
- PostgreSQL (hospedado na Neon)
- Prisma ORM
- bcryptjs (hash de senha) e jsonwebtoken (JWT)
- `tsx` como runtime em desenvolvimento e produção

**Front-end**
- React + TypeScript (Vite)
- React Router
- CSS3 puro, reaproveitando a paleta e os design tokens dos projetos anteriores

## Arquitetura

Monorepo com dois deploys independentes a partir do mesmo repositório:

```
task-manager/
├── server/            # API REST — deploy na Render
│   ├── prisma/          # Schema e migrations
│   └── src/
│       ├── routes/        # auth.ts, tasks.ts
│       ├── middleware/     # authMiddleware (validação de JWT)
│       └── lib/            # Instância única do Prisma Client
└── client/            # Interface — deploy na Vercel
    └── src/
        ├── pages/          # Login, Register, Tasks
        ├── components/     # ProtectedRoute
        └── lib/            # Helper de URL da API
```

## Modelagem do banco

Duas tabelas com relação um-para-muitos: um usuário tem várias tarefas, cada tarefa pertence a exatamente um usuário.

```prisma
model User {
  id             Int      @id @default(autoincrement())
  email          String   @unique
  hashedPassword String
  createdAt      DateTime @default(now())
  tasks          Task[]
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
}
```

## Decisões de segurança

- **Senha nunca armazenada em texto puro** — hash via bcrypt (custo 10), campo nomeado `hashedPassword` (não `password`) para deixar explícito que não é a senha crua.
- **JWT em cookie `httpOnly`, `secure` e `sameSite` condicionais ao ambiente** — em produção, `secure: true` e `sameSite: "none"` (necessário para cookies entre domínios diferentes: front-end na Vercel, API na Render); em desenvolvimento, `secure: false` e `sameSite: "strict"`, já que `localhost` não usa HTTPS.
- **Autorização por dono do recurso em toda rota de tarefa** — o `userId` de uma tarefa nova vem do token validado (`req.userId`), nunca do corpo da requisição, o que impediria um usuário autenticado de criar ou acessar tarefas em nome de outro.
- **404 em vez de 403 para tarefas de outro usuário** — evita confirmar a um possível atacante que um recurso existe, mitigando ataques de IDOR (Insecure Direct Object Reference).
- **CORS restrito a uma origem configurável por ambiente**, não aberto (`*`).
- **Mensagens de erro de login genéricas** ("Credenciais inválidas") tanto para email inexistente quanto para senha incorreta, evitando enumeração de usuários cadastrados.
- **Nenhuma stack trace ou caminho de arquivo exposto em resposta de erro** — erros são logados no servidor (`console.error`) e retornados ao cliente apenas como mensagem genérica.

## Desafios encontrados e soluções

| Desafio | Solução |
|---|---|
| PowerShell bloqueando execução do `npm` (política de segurança padrão do Windows) | Ajuste de `ExecutionPolicy` para `RemoteSigned` no escopo do usuário |
| Erro de módulo CommonJS vs. ES Modules ao iniciar o Express | Adição de `"type": "module"` no `package.json` do servidor |
| Timeout de advisory lock do Prisma ao migrar contra a Neon | Identificado como cold start do compute serverless da Neon; resolvido reconectando com a connection string direta (não pooled) |
| Credencial de banco de dados exposta acidentalmente durante o desenvolvimento | Senha rotacionada imediatamente na Neon — tratada como comprometida assim que exposta, independentemente do contexto |
| Incompatibilidade entre o gerador `prisma-client` (extensões `.ts` necessárias para `tsx`) e um pipeline de build com `tsc` para produção | Unificado o ambiente de execução: `tsx` também em produção, eliminando a etapa de compilação e a divergência entre dev e prod |
| Cookies de sessão não persistindo entre domínios diferentes em produção (front-end e API em domínios distintos) | `sameSite: "none"` combinado com `secure: true`, condicionado ao ambiente via `NODE_ENV` |
| 404 ao acessar rotas do front-end diretamente pela URL (ex.: `/register`) ou ao atualizar a página | Adição de `vercel.json` com rewrite de todas as rotas para `index.html`, delegando o roteamento ao React Router no cliente |

## Testes realizados

- Fluxo completo manual: cadastro, login, criação/edição/exclusão de tarefas, logout
- Tentativa de acesso a rotas protegidas sem autenticação (401 confirmado)
- Tentativa de acesso a tarefa de outro usuário via ID direto (404 confirmado, não 403)
- Teste de responsividade em 375px, 768px e desktop
- Verificação de todos os fluxos em produção, incluindo atualização de página em rotas internas

## Como rodar localmente

Requer duas instâncias rodando em paralelo.

**Back-end:**
```bash
cd server
npm install
npx prisma generate
npm run dev
```

**Front-end** (em outro terminal):
```bash
cd client
npm install
npm run dev
```

### Variáveis de ambiente necessárias

**`server/.env`:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`
**`client/.env`:** `VITE_API_URL`

Nenhum valor real é incluído neste repositório — cada um deve ser gerado/obtido individualmente (banco próprio na Neon, chave JWT própria).

## Próximos passos

- Testes automatizados de API (Vitest + Supertest)
- Paginação de tarefas
- Projeto 5 da trilha: aplicação diferenciada, com foco em segurança da informação

## Autor

**Nelson Lisboa**

- GitHub: [@Nemhh25](https://github.com/Nemhh25)
- LinkedIn: [Nelson Lisboa](https://www.linkedin.com/in/nelsonlisboa/)
- Email: nelsondossantos739@gmail.com
