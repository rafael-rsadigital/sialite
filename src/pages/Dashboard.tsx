import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, BarChart3, MessageSquare, TrendingUp, Lock, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackCard } from "@/components/FeedbackCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Feedback { id: string; nota: number; comentario: string | null; tipo_envio: string; created_at: string; }
interface Empresa { id: string; nome_exibicao: string; }

export default function Dashboard() {
  const { hash } = useParams<{ hash: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!hash) { setError(true); setLoading(false); return; }
      const { data: empresaData, error: empresaError } = await supabase.from("empresas").select("id, nome_exibicao").eq("hash_secreto", hash).single();
      if (empresaError || !empresaData) { setError(true); setLoading(false); return; }
      setEmpresa(empresaData);
      const { data: feedbacksData, error: feedbacksError } = await supabase.from("feedbacks").select("*").eq("empresa_id", empresaData.id).order("created_at", { ascending: false });
      if (feedbacksError) toast.error("Erro ao carregar feedbacks"); else setFeedbacks(feedbacksData || []);
      setLoading(false);
    }
    fetchData();
  }, [hash]);

  const mediaNotas = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.nota, 0) / feedbacks.length).toFixed(1) : "0.0";
  const totalAvaliacoes = feedbacks.length;
  const avaliacoesPositivas = feedbacks.filter((f) => f.nota >= 4).length;
  const percentualPositivo = totalAvaliacoes > 0 ? Math.round((avaliacoesPositivas / totalAvaliacoes) * 100) : 0;

  if (loading) return <div className="ink-shell flex items-center justify-center"><div className="h-8 w-8 animate-spin border-2 border-[#687887] border-t-[#d6a66a]" /></div>;

  if (error || !empresa) return (
    <div className="ink-shell flex items-center justify-center p-5">
      <Card className="portal-panel w-full max-w-sm"><CardContent className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#647384] bg-white/5 text-[#d6a66a]"><Lock className="h-5 w-5" /></div>
        <h1 className="mt-5 text-lg font-semibold text-[#f5f0e5]">Acesso indisponível</h1>
        <p className="mt-2 text-sm leading-6 text-[#b7c0c5]">O link deste dashboard é inválido ou não está mais disponível.</p>
      </CardContent></Card>
    </div>
  );

  const metrics = [
    { label: "Nota média", value: mediaNotas, suffix: "/ 5", icon: Star, iconClass: "fill-[#d6a66a] text-[#d6a66a]" },
    { label: "Avaliações", value: totalAvaliacoes, suffix: "recebidas", icon: MessageSquare, iconClass: "text-[#aeb8c0]" },
    { label: "Positivas", value: `${percentualPositivo}%`, suffix: "do total", icon: TrendingUp, iconClass: "text-[#83b197]" },
  ];

  return (
    <main className="ink-shell">
      <header className="border-b border-[#526170] bg-[#101d2d]/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3"><div className="brand-mark"><BarChart3 className="h-4 w-4" /></div><div><p className="text-sm font-semibold tracking-tight text-[#f5f0e5]">SIA</p><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#aeb8c0]">Dashboard privado</p></div></div>
          <div className="hidden border-l border-[#526170] pl-4 text-right sm:block"><p className="text-sm font-semibold text-[#f5f0e5]">{empresa.nome_exibicao}</p><p className="mt-0.5 text-xs text-[#aeb8c0]">Visão geral das avaliações</p></div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-5 border-b border-[#526170] pb-7"><div><p className="eyebrow text-[#d6a66a]">Relatório de reputação</p><h1 className="display-title mt-3 text-3xl text-[#f5f0e5] sm:text-4xl">Suas avaliações</h1><p className="mt-3 text-sm text-[#b7c0c5]">Acompanhe o que seus clientes estão dizendo.</p></div><span className="hidden text-xs font-bold tracking-[.12em] text-[#aeb8c0] sm:block">ATUALIZAÇÃO EM TEMPO REAL</span></div>

        <div className="mt-7 grid overflow-hidden border border-[#526170] bg-[#526170] sm:grid-cols-3">
          {metrics.map((metric) => <section key={metric.label} className="legacy-card-dark p-5 shadow-none"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#aeb8c0]">{metric.label}</span><metric.icon className={`h-4 w-4 ${metric.iconClass}`} /></div><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-[#f5f0e5]">{metric.value}</span><span className="text-xs text-[#aeb8c0]">{metric.suffix}</span></div></section>)}
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between border-b border-[#526170] pb-4"><div><p className="eyebrow text-[#d6a66a]">Registros recentes</p><h2 className="mt-2 text-xl font-bold text-[#f5f0e5]">Últimas avaliações</h2><p className="mt-1 text-xs text-[#aeb8c0]">Mais recentes primeiro</p></div><ArrowUpRight className="h-5 w-5 text-[#d6a66a]" /></div>
          {feedbacks.length === 0 ? (
            <Card className="portal-panel shadow-none"><CardContent className="p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#526170] bg-white/5 text-[#d6a66a]"><MessageSquare className="h-5 w-5" /></div><p className="mt-4 text-sm text-[#d4dadd]">Nenhuma avaliação recebida ainda.</p><p className="mt-1 text-xs text-[#aeb8c0]">Quando houver uma nova avaliação, ela aparecerá aqui.</p></CardContent></Card>
          ) : <div className="space-y-3">{feedbacks.map((feedback) => <FeedbackCard key={feedback.id} nota={feedback.nota} comentario={feedback.comentario} tipo_envio={feedback.tipo_envio} created_at={feedback.created_at} />)}</div>}
        </section>

        <footer className="mt-12 border-t border-[#526170] pt-6 text-center text-xs text-[#aeb8c0]">SIA — Sistema Inteligente de Avaliações</footer>
      </div>
    </main>
  );
}
