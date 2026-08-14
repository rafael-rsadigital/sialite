# Ativação segura do SIA Lite no Supabase/Lovable

Este guia ativa a autenticação, as permissões por perfil e a base multiempresa do SIA Lite. Todo o controle permanece no **Supabase conectado ao Lovable** e no repositório GitHub do projeto; não há dependência operacional de qualquer serviço adicional.

> **Ordem obrigatória:** execute primeiro a migração SQL no banco e só depois publique o código que depende dela. A publicação antecipada interrompe as consultas públicas de avaliação, pois elas passarão a usar a visão e a função seguras criadas pela migração.

## 1. Aplicar a migração versionada

No projeto Lovable/Supabase, abra **Database > SQL Editor**. Cole e execute o conteúdo do arquivo:

```text
supabase/migrations/20260814070000_saas_auth_rbac.sql
```

A migração preserva empresas, gestores e feedbacks. Ela cria perfis vinculados ao Supabase Auth, políticas RLS, a visão pública mínima `empresas_publicas` e a função controlada `registrar_feedback_publico`.

## 2. Criar o primeiro administrador

No painel do Supabase, abra **Authentication > Users > Add user**. Crie seu usuário com e-mail e senha e marque o e-mail como confirmado, se o painel oferecer essa opção.

Depois, volte ao **SQL Editor** e execute, substituindo pelo mesmo e-mail criado:

```sql
select public.designar_primeiro_administrador('seu-email@dominio.com');
```

Agora entre em `/acesso` com esse e-mail e senha. O painel administrativo só abre para perfis com o papel `administrador`.

## 3. Criar acessos para gestores e empresas

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

## 4. Operação diária

| Ação | Quem pode realizar |
|---|---|
| Criar e editar qualquer empresa | Administrador |
| Consultar todas as avaliações | Administrador |
| Excluir definitivamente avaliações de teste | Administrador, com confirmação |
| Gerir a própria carteira e assinatura dos clientes | Gestor |
| Consultar o painel da própria empresa | Empresa |
| Enviar avaliação pela página `/av/:slug` | Público |

Os antigos links com hash podem continuar existindo como atalhos, mas deixam de permitir leitura de dados sem uma sessão autenticada.

## 5. Estrutura preparada para assinatura futura

A tabela `empresas` passa a registrar os campos abaixo, sem criar cobrança automática:

| Campo | Uso |
|---|---|
| `plano_assinatura` | `essencial`, `profissional` ou `parceiro` |
| `ciclo_cobranca` | `mensal`, `trimestral` ou `anual` |
| `status_cobranca` | `teste`, `ativo`, `atrasado`, `cancelado` ou `isento` |
| `periodo_teste_ate` | Data final do teste, quando aplicável |
| `cancelado_em` | Registro de cancelamento |

Quando você decidir integrar um gateway de pagamento, ele poderá atualizar esses campos. A regra do produto já bloqueia a página pública de avaliações quando a empresa não estiver com o acesso ativo.

## 6. Segurança e independência

As políticas RLS substituem permissões abertas por validação de usuário, papel e vínculo com empresa ou gestor. A senha administrativa não fica mais no código do navegador. O SQL, o código e a configuração ficam no seu repositório e no seu projeto Supabase/Lovable.

Para manter a operação segura, não compartilhe URLs antigas de dashboard como se fossem senhas, não distribua a chave `service_role` ao frontend e mantenha pelo menos uma conta administrativa ativa.
