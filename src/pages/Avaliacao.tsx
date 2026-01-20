import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Copy, ExternalLink, MessageCircle, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Etapa = "coleta" | "desfecho";

export default function Avaliacao() {
  const { slug } = useParams<{ slug: string }>();
  const [empresa, setEmpresa] = useState<{
    id: string;
    nome_exibicao: string;
    link_google: string | null;
    whatsapp_empresa: string | null;
    email_empresa: string | null;
    modelo_sugestao: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("coleta");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchEmpresa() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome_exibicao, link_google, whatsapp_empresa, email_empresa, modelo_sugestao")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        toast.error("Empresa não encontrada");
        setLoading(false);
        return;
      }

      setEmpresa(data);
      setLoading(false);
    }

    fetchEmpresa();
  }, [slug]);

  const handleRegistrar = () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota");
      return;
    }
    setEtapa("desfecho");
  };

  const handleCopyAndRedirect = async () => {
    const textToCopy = comentario.trim() || "";
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Comentário copiado!");
      
      // Salvar feedback
      await supabase.from("feedbacks").insert({
        empresa_id: empresa?.id,
        nota,
        comentario: textToCopy,
        tipo_envio: "google",
      });

      setTimeout(() => {
        if (empresa?.link_google) {
          window.open(empresa.link_google, "_blank");
        }
      }, 500);
    } catch {
      // Fallback para mobile
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success("Comentário copiado!");
      } catch {
        toast.error("Não foi possível copiar");
      }
      document.body.removeChild(textArea);
      
      if (empresa?.link_google) {
        window.open(empresa.link_google, "_blank");
      }
    }
  };

  const handleWhatsApp = async () => {
    if (!empresa?.whatsapp_empresa) return;
    
    await supabase.from("feedbacks").insert({
      empresa_id: empresa.id,
      nota,
      comentario,
      tipo_envio: "whatsapp",
    });

    const message = encodeURIComponent(comentario || "Feedback");
    const phone = empresa.whatsapp_empresa.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = async () => {
    if (!empresa?.email_empresa) return;
    
    await supabase.from("feedbacks").insert({
      empresa_id: empresa.id,
      nota,
      comentario,
      tipo_envio: "email",
    });

    const subject = encodeURIComponent("Feedback Crítico");
    const body = encodeURIComponent(comentario || "Feedback");
    window.open(`mailto:${empresa.email_empresa}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleFinalizar = async () => {
    await supabase.from("feedbacks").insert({
      empresa_id: empresa?.id,
      nota,
      comentario: comentario || "Anônimo",
      tipo_envio: "anonimo",
    });
    setSubmitted(true);
  };

  const isPositive = nota >= 4;

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

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-3xl shadow-card p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Star className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Empresa não encontrada</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Verifique se o link está correto.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-3xl shadow-card p-8 max-w-sm w-full text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Muito obrigado!</h1>
          <p className="mt-2 text-muted-foreground">
            Sua avaliação foi registrada com sucesso.
          </p>
        </div>
      </div>
    );
  }

  // Etapa 1: Coleta Neutra
  if (etapa === "coleta") {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header Dinâmico e Personalizado */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Obrigado por escolher a {empresa.nome_exibicao}!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sua confiança em nosso trabalho é o que nos move. Conte-nos como foi sua experiência para continuarmos evoluindo.
            </p>
          </div>

          {/* Card principal com Glassmorphism */}
          <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8 border border-white/50">
            {/* Estrelas */}
            <div className="flex justify-center mb-8">
              <StarRating value={nota} onChange={setNota} />
            </div>

            {/* Textarea com sugestão estratégica */}
            <div className="mb-6">
              <Textarea
                placeholder="Dica: Cite o nome do produto ou serviço realizado e comente como foi sua experiência!"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-[120px] resize-none rounded-xl border-slate-200 bg-slate-50/80 focus:bg-white transition-colors duration-300 placeholder:text-slate-400"
              />
            </div>

            {/* Botão com gradiente azul moderno */}
            <Button
              onClick={handleRegistrar}
              className="w-full h-14 text-base font-bold rounded-2xl btn-gradient-primary transition-all duration-300 shadow-md hover:shadow-lg"
              size="lg"
            >
              Registrar Avaliação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 2: Desfecho Condicional
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        {isPositive ? (
          // Cenário A: Nota 4 ou 5 - Sucesso
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-card p-8 border border-border/50">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-foreground">
                UAU! Ficamos muito felizes!
              </h1>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-success/5 border border-success/20 rounded-2xl p-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Seu comentário:</p>
                <p className="text-foreground">{comentario}</p>
              </div>
            )}

            {/* Instruções */}
            <p className="text-sm text-muted-foreground text-center mb-4">
              Dica: Cite o serviço e, se puder, tire uma foto! Ao clicar abaixo, seu texto será copiado. Basta colar e publicar no Google.
            </p>

            {/* Box de Inspiração */}
            {empresa.modelo_sugestao && (
              <div className="border-2 border-dashed border-primary/30 rounded-2xl p-4 mb-6 bg-primary/5">
                <p className="text-xs font-medium text-primary mb-2">💡 Inspiração:</p>
                <p className="text-sm text-muted-foreground italic">
                  "{empresa.modelo_sugestao}"
                </p>
              </div>
            )}

            {/* Botão principal */}
            <Button
              onClick={handleCopyAndRedirect}
              className="w-full h-14 text-base font-semibold rounded-2xl btn-gradient-primary transition-all duration-300 shadow-lg hover:shadow-xl gap-3"
              size="lg"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Copiado! Abrindo Google...
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Comentário e Avaliar no Google
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </>
              )}
            </Button>
          </div>
        ) : (
          // Cenário B: Nota 1, 2 ou 3 - Retenção
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-card p-8 border border-border/50">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">😔</div>
              <h1 className="text-2xl font-bold text-foreground">
                Poxa, sentimos muito...
              </h1>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-warning/5 border border-warning/20 rounded-2xl p-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Seu comentário:</p>
                <p className="text-foreground">{comentario}</p>
              </div>
            )}

            {/* Pergunta */}
            <p className="text-sm text-muted-foreground text-center mb-6">
              Gostaria de encaminhar sua avaliação diretamente à gerência para uma solução?
            </p>

            {/* Botões de ação */}
            <div className="space-y-3">
              {empresa.whatsapp_empresa && (
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full h-14 text-base gap-3 rounded-2xl border-2 hover:bg-success/5 hover:border-success hover:text-success transition-all duration-300"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar por WhatsApp
                </Button>
              )}

              {empresa.email_empresa && (
                <Button
                  onClick={handleEmail}
                  variant="outline"
                  className="w-full h-14 text-base gap-3 rounded-2xl border-2 hover:bg-primary/5 hover:border-primary hover:text-primary transition-all duration-300"
                  size="lg"
                >
                  <Mail className="w-5 h-5" />
                  Enviar por E-mail
                </Button>
              )}

              <Button
                onClick={handleFinalizar}
                variant="secondary"
                className="w-full h-14 text-base gap-3 rounded-2xl transition-all duration-300"
                size="lg"
              >
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
