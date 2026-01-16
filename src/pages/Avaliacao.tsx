import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Copy, ExternalLink, MessageCircle, Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Avaliacao() {
  const { slug } = useParams<{ slug: string }>();
  const [empresa, setEmpresa] = useState<{
    id: string;
    nome_exibicao: string;
    link_google: string | null;
    whatsapp_empresa: string | null;
    email_empresa: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchEmpresa() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome_exibicao, link_google, whatsapp_empresa, email_empresa")
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

  const handleCopyAndRedirect = async () => {
    if (comentario.trim()) {
      try {
        await navigator.clipboard.writeText(comentario);
        setCopied(true);
        toast.success("Comentário copiado!");
        
        // Salvar feedback
        await supabase.from("feedbacks").insert({
          empresa_id: empresa?.id,
          nota,
          comentario,
          tipo_envio: "direto",
        });

        setTimeout(() => {
          if (empresa?.link_google) {
            window.open(empresa.link_google, "_blank");
          }
        }, 500);
      } catch {
        // Fallback para mobile
        const textArea = document.createElement("textarea");
        textArea.value = comentario;
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
    } else if (empresa?.link_google) {
      window.open(empresa.link_google, "_blank");
    }
  };

  const handleWhatsApp = async () => {
    if (!empresa?.whatsapp_empresa) return;
    
    await supabase.from("feedbacks").insert({
      empresa_id: empresa.id,
      nota,
      comentario,
      tipo_envio: "direto",
    });

    const message = encodeURIComponent(comentario);
    const phone = empresa.whatsapp_empresa.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = async () => {
    if (!empresa?.email_empresa) return;
    
    await supabase.from("feedbacks").insert({
      empresa_id: empresa.id,
      nota,
      comentario,
      tipo_envio: "direto",
    });

    const subject = encodeURIComponent("Crítica/Sugestão");
    const body = encodeURIComponent(comentario);
    window.open(`mailto:${empresa.email_empresa}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleAnonimo = async () => {
    await supabase.from("feedbacks").insert({
      empresa_id: empresa?.id,
      nota,
      comentario,
      tipo_envio: "anonimo",
    });
    setSubmitted(true);
  };

  const isPositive = nota >= 4;
  const isNegative = nota >= 1 && nota <= 3;

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
        <Card className="shadow-card max-w-sm w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Star className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Empresa não encontrada</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Verifique se o link está correto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="shadow-card max-w-sm w-full animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Obrigado!</h1>
            <p className="mt-2 text-muted-foreground">
              Seu feedback foi registrado com sucesso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {empresa.nome_exibicao}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Como foi sua experiência?
          </p>
        </div>

        {/* Rating Card */}
        <Card className="shadow-card mb-6 animate-fade-up">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <StarRating value={nota} onChange={setNota} />
            </div>

            {nota > 0 && (
              <div className="animate-fade-up">
                <Textarea
                  placeholder={isPositive 
                    ? "Conte-nos o que mais gostou..." 
                    : "Como podemos melhorar?"
                  }
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Positive Flow (4-5 stars) */}
        {isPositive && (
          <div className="space-y-3 animate-fade-up">
            <Button
              onClick={handleCopyAndRedirect}
              className="w-full h-14 text-base gap-3"
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
                  Copiar Elogio e Avaliar no Google
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Seu comentário será copiado automaticamente
            </p>
          </div>
        )}

        {/* Negative Flow (1-3 stars) */}
        {isNegative && comentario.trim() && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Como deseja enviar sua avaliação?
            </p>
            
            {empresa.whatsapp_empresa && (
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="w-full h-14 text-base gap-3 border-2 hover:bg-success/5 hover:border-success hover:text-success"
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
                className="w-full h-14 text-base gap-3 border-2 hover:bg-primary/5 hover:border-primary hover:text-primary"
                size="lg"
              >
                <Mail className="w-5 h-5" />
                Enviar por E-mail
              </Button>
            )}

            <Button
              onClick={handleAnonimo}
              variant="secondary"
              className="w-full h-14 text-base gap-3"
              size="lg"
            >
              <Send className="w-5 h-5" />
              Registrar Anonimamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
