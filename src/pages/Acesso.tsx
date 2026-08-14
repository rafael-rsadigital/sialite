import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import siaLogo from "@/assets/sia-lite-logo.png";

export default function Acesso() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleAcessar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro("Informe seu e-mail e sua senha");
      return;
    }

    setLoading(true);
    setErro("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (authError || !authData.user) {
      setErro("E-mail ou senha inválidos");
      setLoading(false);
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("perfis")
      .select("papel, gestor_id, empresa_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (perfilError || !perfil) {
      await supabase.auth.signOut();
      setErro("Seu usuário ainda não possui um perfil de acesso. Fale com o administrador.");
      setLoading(false);
      return;
    }

    if (perfil.papel === "administrador") {
      navigate("/admin-rsa", { replace: true });
    } else if (perfil.papel === "gestor" && perfil.gestor_id) {
      navigate(`/dashboard-gestor/${perfil.gestor_id}`, { replace: true });
    } else if (perfil.papel === "empresa" && perfil.empresa_id) {
      navigate("/dashboard", { replace: true });
    } else {
      await supabase.auth.signOut();
      setErro("O perfil de acesso está incompleto. Fale com o administrador.");
      setLoading(false);
    }
  };

  return (
    <main className="ink-shell flex items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-5xl border border-[#607080] bg-[#101d2d] p-1 shadow-[6px_6px_0_rgba(0,0,0,.22)]">
        <div className="grid border border-[#5a6877] md:grid-cols-[.9fr_1.1fr]">
          <section className="border-b border-[#5a6877] bg-[#142840] p-7 text-[#f5f0e5] md:border-b-0 md:border-r sm:p-10">
            <div className="flex items-center gap-3"><div className="brand-mark overflow-hidden"><img src={siaLogo} alt="SIA Lite" className="sia-logo-mark" /></div><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#65d7eb]">Área reservada</p><p className="mt-1 text-sm font-semibold">SIA / Acesso seguro</p></div></div>
            <div className="mt-16 max-w-sm"><p className="eyebrow text-[#d6a66a]">Painel de acompanhamento</p><h1 className="display-title mt-4 text-3xl leading-tight text-[#f5f0e5] sm:text-4xl">Informações organizadas. Acesso seguro.</h1><p className="mt-5 text-sm leading-6 text-[#c1c9cf]">Entre com seu e-mail e senha para acessar apenas as empresas e avaliações vinculadas à sua conta.</p></div>
            <div className="mt-12 border-t border-[#5a6877] pt-5 text-xs leading-5 text-[#aeb8c0]"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center border border-[#6c7b89] text-[#d6a66a]"><LockKeyhole className="h-3 w-3" /></span>Seu acesso é protegido por uma conta individual e permissões do sistema.</div>
          </section>

          <section className="bg-[#f8f5ed] p-7 text-[#122235] sm:p-10">
            <div className="flex items-center justify-between border-b border-[#d6cebf] pb-5"><div><p className="eyebrow">Identificação</p><h2 className="mt-2 text-xl font-bold">Acesse seu painel</h2></div><div className="flex h-10 w-10 items-center justify-center border border-[#bdb3a0] bg-[#e7e1d5] text-[#214d76]"><KeyRound className="h-5 w-5" /></div></div>
            <p className="mt-6 text-sm leading-6 text-[#5d6872]">Use as credenciais fornecidas pelo administrador responsável pela sua conta SIA.</p>
            <form onSubmit={handleAcessar} className="mt-8 space-y-5">
              <div><label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.1em] text-[#31495f]">E-mail</label><div className="relative mt-2"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7885]" /><Input id="email" type="email" autoComplete="email" placeholder="voce@empresa.com" value={email} onChange={(e) => { setEmail(e.target.value); setErro(""); }} className="legacy-field pl-10 text-sm" /></div></div>
              <div><label htmlFor="senha" className="text-xs font-bold uppercase tracking-[0.1em] text-[#31495f]">Senha</label><Input id="senha" type="password" autoComplete="current-password" placeholder="Sua senha" value={senha} onChange={(e) => { setSenha(e.target.value); setErro(""); }} className="legacy-field mt-2 px-3 text-sm" /></div>
              {erro && <div className="flex items-center gap-2 border-l-2 border-[#a83232] bg-[#f0dfdc] px-3 py-2 text-sm text-[#8c2929]"><AlertCircle className="h-4 w-4 shrink-0" />{erro}</div>}
              <Button type="submit" disabled={loading} className="legacy-button h-12 w-full font-bold">{loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin border-2 border-[#f5f0e5]/40 border-t-[#f5f0e5]" />Verificando acesso</span> : <>Acessar painel <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </form>
            <p className="mt-8 border-t border-[#d6cebf] pt-5 text-xs leading-5 text-[#697481]">Ainda não recebeu suas credenciais? Entre em contato com o responsável pela sua conta SIA.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
