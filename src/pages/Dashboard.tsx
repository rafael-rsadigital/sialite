import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, BarChart3, MessageSquare, TrendingUp, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="shadow-card max-w-sm w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Acesso Negado</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Link de dashboard inválido ou expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Mural de Avaliações
              </h1>
              <p className="text-sm text-muted-foreground">
                {empresa.nome_exibicao}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 fill-star-filled text-star-filled" />
                <span className="text-2xl font-bold text-foreground">{mediaNotas}</span>
              </div>
              <p className="text-xs text-muted-foreground">Média</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{totalAvaliacoes}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-5 h-5 text-success" />
                <span className="text-2xl font-bold text-foreground">{percentualPositivo}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Positivas</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedbacks List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Últimas Avaliações
          </h2>

          {feedbacks.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma avaliação recebida ainda.
                </p>
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
