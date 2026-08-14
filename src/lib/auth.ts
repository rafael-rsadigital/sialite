import { supabase } from "@/integrations/supabase/client";

export type PapelSia = "administrador" | "gestor" | "empresa";

export interface PerfilAtual {
  id: string;
  papel: PapelSia;
  empresa_id: string | null;
  gestor_id: string | null;
  nome_exibicao: string | null;
}

export async function obterPerfilAtual(): Promise<PerfilAtual | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("perfis")
    .select("id, papel, empresa_id, gestor_id, nome_exibicao")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as PerfilAtual;
}

export async function encerrarSessao() {
  await supabase.auth.signOut();
}
