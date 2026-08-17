# SIA Lite

Sistema de pesquisa de satisfação multiempresa (SaaS), com painéis para administrador, gestores (parceiros) e empresas.

Stack: Vite + React + TypeScript + shadcn/ui + Tailwind CSS + Supabase (Postgres + Auth).

## Como rodar localmente

Pré-requisito: Node.js 18+ instalado ([nvm](https://github.com/nvm-sh/nvm#installing-and-updating) é uma boa forma de instalar).

```sh
# 1. Clone o repositório
git clone https://github.com/rafael-rsadigital/sialite.git
cd sialite

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com os dados do SEU projeto Supabase (veja SUPABASE_SETUP.md)

# 4. Rode o servidor de desenvolvimento
npm run dev
```

## Configurar o Supabase (obrigatório)

Este projeto depende de um banco Supabase próprio. Siga o passo a passo em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) para:

- criar seu projeto no Supabase,
- aplicar as migrations na ordem correta,
- criar o primeiro usuário administrador,
- configurar as variáveis de ambiente.

## Build para produção

```sh
npm run build
```

Os arquivos ficam em `dist/`. O `vercel.json` já está configurado para deploy na Vercel (rewrites de SPA), mas o build gerado é estático e pode ser hospedado em qualquer serviço (Netlify, Cloudflare Pages, servidor próprio, etc.).

## Testes

```sh
npm run test        # roda uma vez
npm run test:watch  # modo watch
```

## Estrutura

- `src/pages` — rotas da aplicação (Index, Avaliacao, Acesso, Dashboard, DashboardGestor, AdminRSA)
- `src/integrations/supabase` — cliente Supabase e tipos gerados do banco
- `supabase/migrations` — histórico de migrations SQL do banco (execute em ordem)
