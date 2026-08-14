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

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" /></div>;

  if (error || !empresa) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <Card className="w-full max-w-sm border-white/10 bg-white/[0.04] shadow-2xl"><CardContent className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400"><Lock className="h-5 w-5" /></div>
        <h1 className="mt-5 text-lg font-semibold text-white">Acesso indisponível</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">O link deste dashboard é inválido ou não está mais disponível.</p>
      </CardContent></Card>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/[0.07] bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950"><BarChart3 className="h-4 w-4" /></div>
            <div><p className="text-sm font-semibold tracking-tight">SIA</p><p className="text-[11px] text-slate-600">Dashboard privado</p></div>
          </div>
          <div className="hidden text-right sm:block"><p className="text-sm font-medium text-slate-300">{empresa.nome_exibicao}</p><p className="text-xs text-slate-600">Visão geral das avaliações</p></div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="mb-9"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Visão geral</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Suas avaliações</h1><p className="mt-2 text-sm text-slate-500">Acompanhe o que seus clientes estão dizendo.</p></div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.035] shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-slate-500">Nota média</span><Star className="h-4 w-4 fill-amber-400 text-amber-400" /></div><div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-white">{mediaNotas}</span><span className="text-sm text-slate-600">/ 5</span></div></CardContent></Card>
          <Card className="border-white/10 bg-white/[0.035] shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-slate-500">Avaliações</span><MessageSquare className="h-4 w-4 text-slate-500" /></div><div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-white">{totalAvaliacoes}</span><span className="text-sm text-slate-600">recebidas</span></div></CardContent></Card>
          <Card className="border-white/10 bg-white/[0.035] shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wider text-slate-500">Positivas</span><TrendingUp className="h-4 w-4 text-emerald-400" /></div><div className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-white">{percentualPositivo}%</span><span className="text-sm text-slate-600">do total</span></div></CardContent></Card>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold text-white">Últimas avaliações</h2><p className="mt-1 text-xs text-slate-600">Mais recentes primeiro</p></div><ArrowUpRight className="h-4 w-4 text-slate-700" /></div>
          {feedbacks.length === 0 ? (
            <Card className="border-white/10 bg-white/[0.025] shadow-none"><CardContent className="p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-slate-600"><MessageSquare className="h-5 w-5" /></div><p className="mt-4 text-sm text-slate-500">Nenhuma avaliação recebida ainda.</p><p className="mt-1 text-xs text-slate-700">Quando houver uma nova avaliação, ela aparecerá aqui.</p></CardContent></Card>
          ) : <div className="space-y-3">{feedbacks.map((feedback) => <FeedbackCard key={feedback.id} nota={feedback.nota} comentario={feedback.comentario} tipo_envio={feedback.tipo_envio} created_at={feedback.created_at} />)}</div>}
        </section>

        <footer className="mt-12 border-t border-white/[0.07] pt-6 text-center text-xs text-slate-700">SIA — Sistema Inteligente de Avaliações</footer>
      </div>
    </main>
  );
}
