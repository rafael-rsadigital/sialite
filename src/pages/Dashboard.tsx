import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, BarChart3, MessageSquare, TrendingUp, Lock, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackCard } from "@/components/FeedbackCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Feedback {
  id: string;
  nota: number;
  comentario: string | null;
  tipo_envio: string;
  created_at: string;
}

interface Empresa {
  id: string;
  nome_exibicao: string;
}

export default function Dashboard() {
  const { hash } = useParams<{ hash: string }>();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!hash) {
        setError(true);
        setLoading(false);
        return;
      }

      // Buscar empresa pelo hash secreto
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("id, nome_exibicao")
        .eq("hash_secreto", hash)
        .single();

      if (empresaError || !empresaData) {
        setError(true);
        setLoading(false);
        return;
      }

      setEmpresa(empresaData);

      // Buscar feedbacks da empresa
      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("empresa_id", empresaData.id)
        .order("created_at", { ascending: false });

      if (feedbacksError) {
        toast.error("Erro ao carregar feedbacks");
      } else {
        setFeedbacks(feedbacksData || []);
      }

      setLoading(false);
    }

    fetchData();
  }, [hash]);

  const mediaNotas = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.nota, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const totalAvaliacoes = feedbacks.length;
  const avaliacoesPositivas = feedbacks.filter(f => f.nota >= 4).length;
  const percentualPositivo = totalAvaliacoes > 0
    ? Math.round((avaliacoesPositivas / totalAvaliacoes) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 opacity-50 shadow-lg shadow-cyan-500/25" />
          <div className="h-4 w-32 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 max-w-sm w-full animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Acesso Negado</h1>
            <p className="text-slate-400">
              Link de dashboard inválido ou expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Dashboard Privado
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Mural de Avaliações
                </h1>
                <p className="text-slate-400">
                  {empresa.nome_exibicao}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-in">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-amber-500/5 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="text-3xl font-bold text-white">{mediaNotas}</span>
                </div>
                <p className="text-sm text-slate-400">Média</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-cyan-500/5 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                  <span className="text-3xl font-bold text-white">{totalAvaliacoes}</span>
                </div>
                <p className="text-sm text-slate-400">Total</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl shadow-emerald-500/5 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="text-3xl font-bold text-white">{percentualPositivo}%</span>
                </div>
                <p className="text-sm text-slate-400">Positivas</p>
              </CardContent>
            </Card>
          </div>

          {/* Feedbacks List */}
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Últimas Avaliações
            </h2>

            {feedbacks.length === 0 ? (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">
                    Nenhuma avaliação recebida ainda.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <FeedbackCard
                    key={feedback.id}
                    nota={feedback.nota}
                    comentario={feedback.comentario}
                    tipo_envio={feedback.tipo_envio}
                    created_at={feedback.created_at}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">SIA - Sistema Inteligente de Avaliações</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
