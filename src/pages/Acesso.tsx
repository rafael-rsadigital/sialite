import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ArrowRight, AlertCircle, Landmark, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Acesso() {
  const [chave, setChave] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleAcessar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chave.trim()) {
      setErro("Digite sua chave de acesso");
      return;
    }

    setLoading(true);
    setErro("");

    const { data: gestorData } = await supabase
      .from("gestores")
      .select("id, hash_acesso")
      .eq("hash_acesso", chave.trim())
      .single();

    if (gestorData) {
      navigate(`/dashboard-gestor/${gestorData.id}`);
      return;
    }

    const { data: empresaData, error } = await supabase
      .from("empresas")
      .select("hash_secreto")
      .eq("hash_secreto", chave.trim())
      .single();

    if (error || !empresaData) {
      setErro("Chave inválida ou não encontrada");
      setLoading(false);
      return;
    }

    navigate(`/dashboard/${empresaData.hash_secreto}`);
  };

  return (
    <main className="ink-shell flex items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-5xl border border-[#607080] bg-[#101d2d]/80 p-1 shadow-[6px_6px_0_rgba(0,0,0,.22)]">
        <div className="grid border border-[#5a6877] md:grid-cols-[.9fr_1.1fr]">
          <section className="border-b border-[#5a6877] bg-[#142840] p-7 text-[#f5f0e5] md:border-b-0 md:border-r sm:p-10">
            <div className="flex items-center gap-3"><div className="brand-mark"><Landmark className="h-4 w-4" /></div><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d6a66a]">Área do cliente</p><p className="mt-1 text-sm font-semibold">SIA / Acesso reservado</p></div></div>
            <div className="mt-16 max-w-sm"><p className="eyebrow text-[#d6a66a]">Painel de acompanhamento</p><h1 className="display-title mt-4 text-3xl leading-tight text-[#f5f0e5] sm:text-4xl">Informações organizadas. Acesso seguro.</h1><p className="mt-5 text-sm leading-6 text-[#c1c9cf]">Consulte os retornos dos seus clientes ou gerencie empresas a partir de uma chave individual de acesso.</p></div>
            <div className="mt-12 border-t border-[#5a6877] pt-5 text-xs leading-5 text-[#aeb8c0]"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center border border-[#6c7b89] text-[#d6a66a]"><LockKeyhole className="h-3 w-3" /></span>As chaves são exclusivas e vinculadas ao seu painel.</div>
          </section>

          <section className="bg-[#f8f5ed] p-7 text-[#122235] sm:p-10">
            <div className="flex items-center justify-between border-b border-[#d6cebf] pb-5"><div><p className="eyebrow">Identificação</p><h2 className="mt-2 text-xl font-bold">Acesse seu painel</h2></div><div className="flex h-10 w-10 items-center justify-center border border-[#bdb3a0] bg-[#e7e1d5] text-[#214d76]"><KeyRound className="h-5 w-5" /></div></div>
            <p className="mt-6 text-sm leading-6 text-[#5d6872]">Informe sua chave de acesso para visualizar as avaliações e gerenciar suas empresas.</p>
            <form onSubmit={handleAcessar} className="mt-8 space-y-5">
              <div><label htmlFor="chave" className="text-xs font-bold uppercase tracking-[0.1em] text-[#31495f]">Chave de acesso</label><Input id="chave" type="text" placeholder="Digite sua chave de acesso" value={chave} onChange={(e) => { setChave(e.target.value); setErro(""); }} className="legacy-field mt-2 px-3 text-sm" /></div>
              {erro && <div className="flex items-center gap-2 border-l-2 border-[#a83232] bg-[#f0dfdc] px-3 py-2 text-sm text-[#8c2929]"><AlertCircle className="h-4 w-4 shrink-0" />{erro}</div>}
              <Button type="submit" disabled={loading} className="legacy-button h-12 w-full font-bold">{loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin border-2 border-[#f5f0e5]/40 border-t-[#f5f0e5]" />Verificando acesso</span> : <>Acessar painel <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </form>
            <p className="mt-8 border-t border-[#d6cebf] pt-5 text-xs leading-5 text-[#697481]">Caso não tenha uma chave, entre em contato com o responsável pelo seu atendimento SIA.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
