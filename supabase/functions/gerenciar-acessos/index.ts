import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const clienteUsuario = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await clienteUsuario.auth.getUser();
    if (userError || !user) return json({ error: "Não autenticado" }, 401);

    const { data: ehAdmin } = await clienteUsuario.rpc("eh_administrador");
    if (!ehAdmin) return json({ error: "Apenas administradores podem gerenciar acessos" }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const acao = body.acao as string;

    if (acao === "listar") {
      const { data: perfis, error } = await admin
        .from("perfis")
        .select("id, papel, empresa_id, gestor_id, nome_exibicao, created_at")
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 400);

      const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emails = new Map((lista?.users ?? []).map((u) => [u.id, u.email]));

      return json({
        acessos: (perfis ?? []).map((p) => ({ ...p, email: emails.get(p.id) ?? null })),
      });
    }

    if (acao === "criar") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const senha = String(body.senha ?? "");
      const papel = String(body.papel ?? "");
      const empresaId = body.empresa_id || null;
      const gestorId = body.gestor_id || null;
      const nome = body.nome_exibicao ? String(body.nome_exibicao).trim() : null;

      if (!email || !email.includes("@")) return json({ error: "Informe um e-mail válido" }, 400);
      if (!["administrador", "gestor", "empresa"].includes(papel)) return json({ error: "Papel inválido" }, 400);
      if (papel === "empresa" && !empresaId) return json({ error: "Selecione a empresa" }, 400);
      if (papel === "gestor" && !gestorId) return json({ error: "Selecione o gestor" }, 400);
      if (senha && senha.length < 8) return json({ error: "A senha deve ter ao menos 8 caracteres" }, 400);

      // Localiza usuário existente pelo e-mail
      const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      let usuario = (lista?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email) ?? null;
      let criado = false;

      if (!usuario) {
        if (!senha) return json({ error: "Informe uma senha para criar o novo acesso" }, 400);
        const { data: novo, error: erroCriar } = await admin.auth.admin.createUser({
          email,
          password: senha,
          email_confirm: true,
        });
        if (erroCriar || !novo.user) return json({ error: erroCriar?.message ?? "Erro ao criar usuário" }, 400);
        usuario = novo.user;
        criado = true;
      } else if (senha) {
        await admin.auth.admin.updateUserById(usuario.id, { password: senha });
      }

      const { error: erroPerfil } = await admin.from("perfis").upsert({
        id: usuario.id,
        papel,
        empresa_id: papel === "empresa" ? empresaId : null,
        gestor_id: papel === "gestor" ? gestorId : null,
        nome_exibicao: nome ?? email,
        updated_at: new Date().toISOString(),
      });
      if (erroPerfil) return json({ error: erroPerfil.message }, 400);

      return json({ ok: true, criado, user_id: usuario.id });
    }

    if (acao === "remover") {
      const perfilId = String(body.perfil_id ?? "");
      if (!perfilId) return json({ error: "Perfil não informado" }, 400);
      if (perfilId === user.id) return json({ error: "Você não pode remover o próprio acesso" }, 400);

      const { error } = await admin.from("perfis").delete().eq("id", perfilId);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado" }, 500);
  }
});
