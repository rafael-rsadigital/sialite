import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Star, Copy, ExternalLink, MessageCircle, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Etapa = "coleta" | "desfecho";

// Dados fictícios para modo demo
const DEMO_DATA = {
  id: "demo",
  nome_exibicao: "Sua Empresa",
  link_google: "https://www.google.com/maps",
  whatsapp_empresa: "5511999999999",
  email_empresa: "contato@suaempresa.com",
  modelo_sugestao: "Adorei o atendimento! A equipe foi muito atenciosa e o serviço superou minhas expectativas. Recomendo a todos!",
};

export default function Avaliacao() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isDemo = slug === "demo";
  const nomeFromQuery = searchParams.get("nome");

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
      // Modo Demo
      if (isDemo) {
        setEmpresa({
          ...DEMO_DATA,
          nome_exibicao: nomeFromQuery || DEMO_DATA.nome_exibicao,
        });
        setLoading(false);
        return;
      }

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
  }, [slug, isDemo, nomeFromQuery]);

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
      
      // Não salvar feedback no modo demo
      if (!isDemo && empresa?.id) {
        await supabase.from("feedbacks").insert({
          empresa_id: empresa.id,
          nota,
          comentario: textToCopy,
          tipo_envio: "google",
        });
      }

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
    
    // Não salvar feedback no modo demo
    if (!isDemo && empresa.id) {
      await supabase.from("feedbacks").insert({
        empresa_id: empresa.id,
        nota,
        comentario,
        tipo_envio: "whatsapp",
      });
    }

    const message = encodeURIComponent(comentario || "Feedback");
    const phone = empresa.whatsapp_empresa.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = async () => {
    if (!empresa?.email_empresa) return;
    
    // Não salvar feedback no modo demo
    if (!isDemo && empresa.id) {
      await supabase.from("feedbacks").insert({
        empresa_id: empresa.id,
        nota,
        comentario,
        tipo_envio: "email",
      });
    }

    const subject = encodeURIComponent("Feedback Crítico");
    const body = encodeURIComponent(comentario || "Feedback");
    window.open(`mailto:${empresa.email_empresa}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleFinalizar = async () => {
    // Não salvar feedback no modo demo
    if (!isDemo && empresa?.id) {
      await supabase.from("feedbacks").insert({
        empresa_id: empresa.id,
        nota,
        comentario: comentario || "Anônimo",
        tipo_envio: "anonimo",
      });
    }
    setSubmitted(true);
  };

  const isPositive = nota >= 4;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 opacity-50" />
          <div className="h-4 w-32 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 max-w-sm w-full text-center border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-200">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Empresa não encontrada</h1>
          <p className="mt-3 text-slate-500 text-sm">
            Verifique se o link está correto e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 max-w-sm w-full text-center border border-slate-100 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Muito obrigado!</h1>
          <p className="mt-3 text-slate-500">
            Sua avaliação foi registrada com sucesso.
          </p>
          {isDemo && (
            <p className="mt-4 text-xs text-blue-500 bg-blue-50 rounded-xl px-4 py-2">
              🎭 Modo demonstração - nenhum dado foi salvo
            </p>
          )}
        </div>
      </div>
    );
  }

  // Etapa 1: Coleta Neutra
  if (etapa === "coleta") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
        <div className="max-w-md mx-auto">
          {/* Demo badge */}
          {isDemo && (
            <div className="text-center mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-200">
                🎭 Modo Demonstração
              </span>
            </div>
          )}

          {/* Header Dinâmico e Personalizado */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 leading-tight">
              Obrigado por escolher a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {empresa.nome_exibicao}
              </span>
              !
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
              Sua confiança em nosso trabalho é o que nos move. Conte-nos como foi sua experiência para continuarmos evoluindo.
            </p>
          </div>

          {/* Card principal Premium */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100 animate-fade-in">
            {/* Estrelas */}
            <div className="flex justify-center mb-10">
              <StarRating value={nota} onChange={setNota} />
            </div>

            {/* Textarea com sugestão estratégica */}
            <div className="mb-8">
              <Textarea
                placeholder="Dica: Cite o nome do produto ou serviço realizado e comente como foi sua experiência!"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-[130px] resize-none rounded-2xl border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-300 focus:ring-blue-100 transition-all duration-300 placeholder:text-slate-400 text-slate-700"
              />
            </div>

            {/* Botão Premium */}
            <Button
              onClick={handleRegistrar}
              className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5"
              size="lg"
            >
              Registrar Avaliação
            </Button>
          </div>

          {/* Footer discreto */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Powered by SIA
          </p>
        </div>
      </div>
    );
  }

  // Etapa 2: Desfecho Condicional
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        {/* Demo badge */}
        {isDemo && (
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-blue-200">
              🎭 Modo Demonstração
            </span>
          </div>
        )}

        {isPositive ? (
          // Cenário A: Nota 4 ou 5 - Sucesso
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                UAU! Ficamos muito felizes!
              </h1>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Seu comentário</p>
                <p className="text-slate-700">{comentario}</p>
              </div>
            )}

            {/* Instruções */}
            <p className="text-sm text-slate-500 text-center mb-5 leading-relaxed">
              Dica: Cite o serviço e, se puder, tire uma foto! Ao clicar abaixo, seu texto será copiado. Basta colar e publicar no Google.
            </p>

            {/* Box de Inspiração */}
            {empresa.modelo_sugestao && (
              <div className="border-2 border-dashed border-blue-200 rounded-2xl p-5 mb-6 bg-blue-50/50">
                <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">💡 Inspiração</p>
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "{empresa.modelo_sugestao}"
                </p>
              </div>
            )}

            {/* Botão principal */}
            <Button
              onClick={handleCopyAndRedirect}
              className="w-full h-14 text-sm font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:-translate-y-0.5 gap-2"
              size="lg"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Copiado! Abrindo...</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 flex-shrink-0" />
                  <span>Copiar e Avaliar no Google</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </>
              )}
            </Button>
          </div>
        ) : (
          // Cenário B: Nota 1, 2 ou 3 - Retenção
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-200">
                <span className="text-4xl">😔</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Poxa, sentimos muito...
              </h1>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wide">Seu comentário</p>
                <p className="text-slate-700">{comentario}</p>
              </div>
            )}

            {/* Pergunta */}
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Gostaria de encaminhar sua avaliação diretamente à gerência para uma solução?
            </p>

            {/* Botões de ação */}
            <div className="space-y-3">
              {empresa.whatsapp_empresa && (
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full h-14 text-base gap-3 rounded-2xl border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
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
                  className="w-full h-14 text-base gap-3 rounded-2xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                  size="lg"
                >
                  <Mail className="w-5 h-5" />
                  Enviar por E-mail
                </Button>
              )}

              <Button
                onClick={handleFinalizar}
                className="w-full h-14 text-base gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all duration-300 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:-translate-y-0.5"
                size="lg"
              >
                Finalizar
              </Button>
            </div>
          </div>
        )}

        {/* Footer discreto */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by SIA
        </p>
      </div>
    </div>
  );
}
