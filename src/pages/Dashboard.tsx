import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star, BarChart3, MessageSquare, TrendingUp, Lock, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackCard } from "@/components/FeedbackCard";
import { supabase } from "@/integrations/supabase/client";
import { obterPerfilAtual, type PapelSia } from "@/lib/auth";
import { toast } from "sonner";

interface Feedback {
  id: string;
  nota: number;
  comentario: string | null;
  tipo_envio: string;
  created_at: string;
  solicitou_retorno: boolean | null;
  solucionado: boolean | null;
  nome_cliente: string | null;
  telefone_cliente: string | null;
  email_cliente: string | null;
  produto_servico: string | null;
}
interface Empresa { id: string; nome_exibicao: string; }

export default function Dashboard() {
  const { hash } = useParams<{ hash?: string }>();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [papel, setPapel] = useState<PapelSia | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const perfil = await obterPerfilAtual();
      if (!perfil) {
        setError("Faça login para acessar este painel.");
        setLoading(false);
        return;
      }
      setPapel(perfil.papel);

      if (perfil.papel === "gestor" && !hash) {
        // Sem hash de uma empresa específica: manda para o painel de gestão.
        // Com hash, deixa seguir — o gestor pode abrir o dashboard de uma
        // empresa sob sua gestão (a RLS já garante que só vê as suas).
        navigate(`/dashboard-gestor/${perfil.gestor_id}`, { replace: true });
        return;
      }
      if (perfil.papel === "administrador" && !hash) {
        navigate("/admin-rsa", { replace: true });
        return;
      }

      let empresaQuery = supabase.from("empresas").select("id, nome_exibicao");
      if (hash) empresaQuery = empresaQuery.eq("hash_secreto", hash);
      else if (perfil.empresa_id) empresaQuery = empresaQuery.eq("id", perfil.empresa_id);
      else {
        setError("Sua conta não está vinculada a uma empresa.");
        setLoading(false);
        return;
      }

      const { data: empresaData, error: empresaError } = await empresaQuery.maybeSingle();
      if (empresaError || !empresaData) {
        setError("Você não tem permissão para abrir este painel.");
        setLoading(false);
        return;
      }

      setEmpresa(empresaData);
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select("id, nota, comentario, tipo_envio, created_at, solicitou_retorno, solucionado, nome_cliente, telefone_cliente, email_cliente, produto_servico")
        .eq("empresa_id", empresaData.id)
        .order("created_at", { ascending: false });

      if (feedbacksError) toast.error("Erro ao carregar avaliações");
      else setFeedbacks(feedbacksData || []);
      setLoading(false);
    }
    fetchData();
  }, [hash, navigate]);

  const excluirFeedback = async (feedback: Feedback) => {
    if (papel !== "administrador") return;
    const confirmacao = window.confirm("Excluir esta avaliação definitivamente? Esta ação é indicada apenas para limpar registros de teste.");
    if (!confirmacao) return;

    setDeletingId(feedback.id);
    const { error: deleteError } = await supabase.from("feedbacks").delete().eq("id", feedback.id);
    if (deleteError) toast.error("Não foi possível excluir a avaliação");
    else {
      setFeedbacks((atual) => atual.filter((item) => item.id !== feedback.id));
      toast.success("Avaliação excluída definitivamente");
    }
    setDeletingId(null);
  };

  const [updatingSolucaoId, setUpdatingSolucaoId] = useState<string | null>(null);

  const alternarSolucionado = async (feedback: Feedback, valor: boolean) => {
    setUpdatingSolucaoId(feedback.id);
    const { error } = await supabase.from("feedbacks").update({ solucionado: valor }).eq("id", feedback.id);
    if (error) {
      toast.error("Não foi possível atualizar o status");
    } else {
      setFeedbacks((atual) => atual.map((item) => item.id === feedback.id ? { ...item, solucionado: valor } : item));
      toast.success(valor ? "Marcado como solucionado" : "Marcado como pendente");
    }
    setUpdatingSolucaoId(null);
  };

  const mediaNotas = feedbacks.length > 0 ? (feedbacks.reduce((acc, f) => acc + f.nota, 0) / feedbacks.length).toFixed(1) : "0.0";
  const totalAvaliacoes = feedbacks.length;
  const avaliacoesPositivas = feedbacks.filter((f) => f.nota >= 4).length;
  const percentualPositivo = totalAvaliacoes > 0 ? Math.round((avaliacoesPositivas / totalAvaliacoes) * 100) : 0;

  if (loading) return <div className="ink-shell flex items-center justify-center"><div className="h-8 w-8 animate-spin border-2 border-[#687887] border-t-[#d6a66a]" /></div>;

  if (error || !empresa) return (
    <div className="ink-shell flex items-center justify-center p-5">
      <Card className="portal-panel w-full max-w-sm"><CardContent className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#647384] bg-white/5 text-[#d6a66a]"><Lock className="h-5 w-5" /></div>
        <h1 className="mt-5 text-lg font-semibold text-[#f5f0e5]">Acesso protegido</h1>
        <p className="mt-2 text-sm leading-6 text-[#b7c0c5]">{error || "O painel solicitado não está disponível para sua conta."}</p>
        <Button asChild className="legacy-button mt-6"><Link to="/acesso">Ir para o acesso</Link></Button>
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
      <header className="border-b border-[#526170] bg-[#101d2d]/90"><div className="mx-auto flex max-w-5xl items-center justify-between gap-5 px-5 py-4 lg:px-8"><div className="flex items-center gap-3">{papel === "gestor" && hash ? <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-[#aeb8c0] hover:bg-white/10 hover:text-white">← Voltar</Button> : null}<div className="brand-mark"><BarChart3 className="h-4 w-4" /></div><div><p className="text-sm font-semibold tracking-tight text-[#f5f0e5]">SIA</p><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#aeb8c0]">Painel protegido</p></div></div><div className="hidden border-l border-[#526170] pl-4 text-right sm:block"><p className="text-sm font-semibold text-[#f5f0e5]">{empresa.nome_exibicao}</p><p className="mt-0.5 text-xs text-[#aeb8c0]">Visão geral das avaliações</p></div></div></header>
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-5 border-b border-[#526170] pb-7"><div><p className="eyebrow text-[#d6a66a]">Relatório de reputação</p><h1 className="display-title mt-3 text-3xl text-[#f5f0e5] sm:text-4xl">Suas avaliações</h1><p className="mt-3 text-sm text-[#b7c0c5]">Acompanhe o que seus clientes estão dizendo.</p></div><span className="hidden text-xs font-bold tracking-[.12em] text-[#aeb8c0] sm:block">ACESSO AUTENTICADO</span></div>
        <div className="mt-7 grid overflow-hidden border border-[#526170] bg-[#526170] sm:grid-cols-3">{metrics.map((metric) => <section key={metric.label} className="legacy-card-dark p-5 shadow-none"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#aeb8c0]">{metric.label}</span><metric.icon className={`h-4 w-4 ${metric.iconClass}`} /></div><div className="mt-5 flex items-baseline gap-2"><span className="text-3xl font-semibold tracking-tight text-[#f5f0e5]">{metric.value}</span><span className="text-xs text-[#aeb8c0]">{metric.suffix}</span></div></section>)}</div>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between border-b border-[#526170] pb-4">
            <div>
              <p className="eyebrow text-[#d6a66a]">Registros recentes</p>
              <h2 className="mt-2 text-xl font-bold text-[#f5f0e5]">Últimas avaliações</h2>
              <p className="mt-1 text-xs text-[#aeb8c0]">Mais recentes primeiro</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-[#d6a66a]" />
          </div>
          {feedbacks.length === 0 ? (
            <Card className="portal-panel shadow-none">
              <CardContent className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#526170] bg-white/5 text-[#d6a66a]"><MessageSquare className="h-5 w-5" /></div>
                <p className="mt-4 text-sm text-[#d4dadd]">Nenhuma avaliação recebida ainda.</p>
                <p className="mt-1 text-xs text-[#aeb8c0]">Quando houver uma nova avaliação, ela aparecerá aqui.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  nota={feedback.nota}
                  comentario={feedback.comentario}
                  tipo_envio={feedback.tipo_envio}
                  created_at={feedback.created_at}
                  nomeCliente={feedback.nome_cliente}
                  produtoServico={feedback.produto_servico}
                  telefoneCliente={feedback.telefone_cliente}
                  emailCliente={feedback.email_cliente}
                  solicitouRetorno={feedback.solicitou_retorno}
                  solucionado={feedback.solucionado}
                  onToggleSolucionado={(valor) => alternarSolucionado(feedback, valor)}
                  atualizandoSolucao={updatingSolucaoId === feedback.id}
                  onExcluir={papel === "administrador" ? () => excluirFeedback(feedback) : undefined}
                  excluindo={deletingId === feedback.id}
                />
              ))}
            </div>
          )}
        </section>
        <footer className="mt-12 border-t border-[#526170] pt-6 text-center text-xs text-[#aeb8c0]">SIA — Sistema Inteligente de Avaliações</footer>
      </div>
    </main>
  );
}
