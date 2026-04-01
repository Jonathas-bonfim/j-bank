# J Bank — Desafio Front-End Onda Finance

Aplicação web que simula um app bancário simples, com paleta alinhada à identidade visual da [Onda Finance](https://ondafinance.com/pt-br/): branco `#fff`, verde `#24e478` e preto `#000`.

## Link para acessar (deploy)

**URL:** [https://jbank.jonathasbonfim.dev/](https://jbank.jonathasbonfim.dev/)

## Como rodar o projeto

Requisitos: Node.js 20+ (recomendado LTS).

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

Outros comandos:

| Comando        | Descrição                          |
| -------------- | ---------------------------------- |
| `npm run build`   | Build de produção (`dist/`)        |
| `npm run preview` | Servir o build localmente          |
| `npm run test`    | Vitest em modo watch               |
| `npm run test:run`| Vitest uma execução (CI)           |
| `npm run lint`    | ESLint                             |

### Deploy (SPA)

O app usa `BrowserRouter`. Em hospedagens estáticas, configure fallback para `index.html` em todas as rotas (ex.: `vercel.json` incluído neste repositório).

## Stack (conforme desafio)
- **React + TypeScript** com **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`) + **CVA** nos componentes de UI
- **Radix UI** (`@radix-ui/react-slot`, `@radix-ui/react-label`) no estilo **shadcn/ui**
- **React Router** — rotas em `src/routes/app-routes.tsx` e constantes em `src/routes/paths.ts`: público `/login`, área logada `/dashboard` (e `/transfer`), com `/` redirecionando para o painel
- **TanStack React Query** — conta e extrato (mock via Axios)
- **Zustand** + **persist** — sessão mock (token/usuário no `localStorage`)
- **React Hook Form** + **Zod** — validação dos formulários
- **Axios** — cliente HTTP com **adapter customizado** simulando API em memória
- **Vitest** + Testing Library — testes colocados junto de cada feature: `pages/login/login-page.test.tsx` e `pages/transfer/transfer-page.test.tsx`

## Decisões técnicas adotadas

1. **Mock via adapter Axios** — Mantém o uso real de `axios` (interceptors, tipagem, `async/await`) e centraliza rotas fictícias (`auth/login`, `account`, `transfers`) em um único módulo, facilitando trocar por API real depois.
2. **Sessão no cliente** — O “token” é persistido com Zustand `persist`; a UI trata hidratação antes de redirecionar, evitando flash incorreto entre login e painel.
3. **React Query como fonte da conta** — Saldo e transações vêm da mesma “API”; após transferência, o cache é atualizado com a resposta do POST, mantendo saldo e lista coerentes sem estado duplicado.
4. **Componentes UI com CVA** — Variantes de botão e estilos compartilhados seguem o padrão shadcn (composição + Radix Slot onde faz sentido).
5. **Tailwind v4 com `@theme`** — Tokens de cor e raio no CSS, alinhados à paleta do desafio, sem arquivo `tailwind.config` separado.
6. **Páginas por feature** — Em `src/pages/`, cada rota principal tem sua pasta (`login/`, `dashboard/`, `transfer/`) com `index.tsx` como entrada da tela; testes Vitest ficam ao lado (`*-page.test.tsx`), facilitando evoluir cada fluxo com hooks ou subcomponentes locais depois.

## Melhorias futuras

- Integração com API real (OAuth2 / OpenID, refresh token, tratamento de 401 centralizado).
- Testes e2e (Playwright) cobrindo transferência e navegação protegida.
- Acessibilidade extra: anúncios de região ao vivo para atualizações de saldo, temas e contraste validados.
- Internacionalização (i18n) se o produto for multilíngue.
- Observabilidade (Sentry, métricas Web Vitals) em produção.

## Segurança (conceitual — não implementado neste demo)

### Proteção contra engenharia reversa

- **Build de produção**: minificação e tree-shaking reduzem legibilidade; ofuscação adicional tem retorno limitado e não substitui segurança no servidor.
- **Sem segredos no front**: chaves de API, regras de negócio sensíveis e validação definitiva devem ficar no backend; o cliente só orquestra UX.
- **Integridade**: distribuição via HTTPS, **Subresource Integrity** para CDNs quando aplicável, e políticas como **CSP** para reduzir injeção de scripts.
- **Atualizações**: dependências auditadas (`npm audit`) e pipeline de CI com testes e análise estática.

### Proteção contra vazamento de dados

- **Transporte**: TLS obrigatório; **HSTS** no domínio.
- **Armazenamento local**: evitar persistir PII ou tokens de longa duração sem criptografia adequada; preferir cookies **httpOnly** / **Secure** geridos pelo servidor quando possível.
- **Dados em memória**: limpar estado sensível no logout; não logar tokens ou payloads completos em ferramentas de analytics.
- **Conformidade**: minimização de dados, políticas de retenção, criptografia em repouso no backend e controles de acesso (RBAC, MFA para operações críticas).

---

Projeto criado para o desafio técnico da Onda Finance.
