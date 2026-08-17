# Configurar o SIA Lite no seu próprio Supabase

Este guia coloca o projeto rodando de forma 100% independente, com seu próprio banco Supabase — sem qualquer dependência do Lovable. Todo o controle fica no seu projeto Supabase e no seu repositório GitHub.

> **Ordem obrigatória:** aplique as migrations SQL na ordem abaixo antes de rodar o código. Pular etapas ou aplicar fora de ordem quebra as políticas de segurança (RLS) do banco.

## 0. Criar seu projeto Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) (se ainda não tiver).
2. Clique em **New Project**, escolha uma organização, dê um nome (ex: `sialite`), defina uma senha forte para o banco e escolha a região mais próxima dos seus usuários (ex: South America - São Paulo).
3. Aguarde a criação do projeto (leva 1-2 minutos).
4. Vá em **Project Settings > Data API** (ou **API** em versões mais antigas) e anote:
   - `Project URL` → vai virar `VITE_SUPABASE_URL`
   - `anon public` key → vai virar `VITE_SUPABASE_PUBLISHABLE_KEY`
   - o ID do projeto (parte antes de `.supabase.co` na URL) → vai virar `VITE_SUPABASE_PROJECT_ID`

## 1. Aplicar as migrations, em ordem

No painel do Supabase, abra **SQL Editor**. Execute o conteúdo de cada arquivo em `supabase/migrations/`, **um de cada vez, em ordem cronológica pelo nome do arquivo** (o timestamp no início do nome já garante a ordem certa):

```text
supabase/migrations/20260116025913_*.sql   (cria empresas e feedbacks)
supabase/migrations/20260120011023_*.sql
supabase/migrations/20260121165830_*.sql   (cria leads_teste)
supabase/migrations/20260128131512_*.sql
supabase/migrations/20260129234139_*.sql
supabase/migrations/20260130003553_*.sql   (colunas de assinatura)
supabase/migrations/20260130003811_*.sql
supabase/migrations/20260131014354_*.sql   (cria gestores)
supabase/migrations/20260814070000_saas_auth_rbac.sql  (autenticação e RLS definitivo)
```

A última migração (`saas_auth_rbac.sql`) substitui as políticas RLS abertas por regras baseadas em papel de usuário (administrador/gestor/empresa), cria a tabela `perfis` vinculada ao Supabase Auth, a visão pública mínima `empresas_publicas` e a função controlada `registrar_feedback_publico`.

**Alternativa via CLI (opcional):** se preferir, instale o [Supabase CLI](https://supabase.com/docs/guides/cli), rode `supabase link --project-ref SEU_PROJECT_ID` e depois `supabase db push` para aplicar todas as migrations de uma vez.

## 2. Configurar as variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os valores anotados no passo 0:

```sh
cp .env.example .env
```

```env
VITE_SUPABASE_PROJECT_ID="seu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-anon-public-key"
VITE_SUPABASE_URL="https://seu-project-id.supabase.co"
```

## 3. Criar o primeiro administrador

No painel do Supabase, abra **Authentication > Users > Add user**. Crie seu usuário com e-mail e senha e marque o e-mail como confirmado, se o painel oferecer essa opção.

Depois, volte ao **SQL Editor** e execute, substituindo pelo mesmo e-mail criado:

```sql
select public.designar_primeiro_administrador('seu-email@dominio.com');
```

Agora entre em `/acesso` com esse e-mail e senha. O painel administrativo só abre para perfis com o papel `administrador`.

## 4. Criar acessos para gestores e empresas

Primeiro, cadastre o gestor e as empresas no painel administrativo. Em seguida, crie a conta de cada pessoa em **Authentication > Users**. Copie o UUID do usuário criado e execute um dos comandos abaixo no SQL Editor, usando os IDs da empresa ou gestor cadastrados:

```sql
-- Acesso de um gestor à própria carteira
select public.atribuir_acesso(
  'UUID_DO_USUARIO',
  'gestor',
  null,
  'UUID_DO_GESTOR',
  'Nome do gestor'
);

-- Acesso da empresa ao próprio painel
select public.atribuir_acesso(
  'UUID_DO_USUARIO',
  'empresa',
  'UUID_DA_EMPRESA',
  null,
  'Nome do responsável'
);
```

Após entrar em `/acesso`, o gestor é levado somente à sua carteira e a empresa ao próprio dashboard. O painel de administrador permanece exclusivo da conta administrativa.

## 5. Operação diária

| Ação | Quem pode realizar |
|---|---|
| Criar e editar qualquer empresa | Administrador |
| Consultar todas as avaliações | Administrador |
| Excluir definitivamente avaliações de teste | Administrador, com confirmação |
| Gerir a própria carteira e assinatura dos clientes | Gestor |
| Consultar o painel da própria empresa | Empresa |
| Enviar avaliação pela página `/av/:slug` | Público |

Os antigos links com hash podem continuar existindo como atalhos, mas deixam de permitir leitura de dados sem uma sessão autenticada.

## 6. Estrutura preparada para assinatura futura

A tabela `empresas` passa a registrar os campos abaixo, sem criar cobrança automática:

| Campo | Uso |
|---|---|
| `plano_assinatura` | `essencial`, `profissional` ou `parceiro` |
| `ciclo_cobranca` | `mensal`, `trimestral` ou `anual` |
| `status_cobranca` | `teste`, `ativo`, `atrasado`, `cancelado` ou `isento` |
| `periodo_teste_ate` | Data final do teste, quando aplicável |
| `cancelado_em` | Registro de cancelamento |

Quando você decidir integrar um gateway de pagamento, ele poderá atualizar esses campos. A regra do produto já bloqueia a página pública de avaliações quando a empresa não estiver com o acesso ativo.

## 7. Segurança e independência

As políticas RLS substituem permissões abertas por validação de usuário, papel e vínculo com empresa ou gestor. A senha administrativa não fica mais no código do navegador. O SQL, o código e a configuração ficam inteiramente no seu repositório GitHub e no seu projeto Supabase — sem qualquer dependência do Lovable.

Para manter a operação segura, não compartilhe URLs antigas de dashboard como se fossem senhas, não distribua a chave `service_role` ao frontend e mantenha pelo menos uma conta administrativa ativa.
