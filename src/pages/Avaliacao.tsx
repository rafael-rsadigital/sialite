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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-10 max-w-sm w-full text-center border border-slate-100/80">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-slate-100 flex items-center justify-center">
            <Star className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Empresa não encontrada</h1>
          <p className="mt-3 text-slate-500 text-sm">
            Verifique se o link está correto.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-10 max-w-sm w-full text-center border border-slate-100/80 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-slate-900 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Obrigado pelo seu feedback</h1>
          <p className="mt-3 text-slate-500 text-sm">
            Sua avaliação foi registrada com sucesso.
          </p>
          {isDemo && (
            <p className="mt-6 text-xs text-slate-500 bg-slate-100 rounded-lg px-4 py-2">
              Modo demonstração — nenhum dado foi salvo
            </p>
          )}
        </div>
      </div>
    );
  }

  // Etapa 1: Coleta Neutra e Elegante
  if (etapa === "coleta") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Demo badge - Discreto */}
          {isDemo && (
            <div className="text-center mb-8 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium">
                Demonstração
              </span>
            </div>
          )}

          {/* Header - Limpo e Profissional */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-3 leading-tight tracking-tight">
              Obrigado por escolher a{" "}
              <span className="text-slate-900 font-bold">
                {empresa.nome_exibicao}
              </span>
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              Sua opinião nos ajuda a melhorar continuamente.
            </p>
          </div>

          {/* Card principal - Executivo */}
          <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-8 sm:p-10 border border-slate-100/80 animate-fade-in">
            {/* Estrelas com mais respiro */}
            <div className="flex justify-center mb-12">
              <StarRating value={nota} onChange={setNota} />
            </div>

            {/* Textarea - Discreto */}
            <div className="mb-10">
              <Textarea
                placeholder="Conte-nos sobre sua experiência (opcional)"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-[120px] resize-none rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-300 focus:ring-slate-100 transition-all duration-200 placeholder:text-slate-400 text-slate-700 text-sm"
              />
            </div>

            {/* Botão - Sóbrio e Executivo */}
            <Button
              onClick={handleRegistrar}
              className="w-full h-12 text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              size="lg"
            >
              Enviar Avaliação
            </Button>
          </div>

          {/* Footer discreto */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Powered by SIA
          </p>
        </div>
      </div>
    );
  }

  // Etapa 2: Desfecho Condicional - Elegante
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        {/* Demo badge - Discreto */}
        {isDemo && (
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium">
              Demonstração
            </span>
          </div>
        )}

        {isPositive ? (
          // Cenário A: Nota 4 ou 5 - Sucesso Elegante
          <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-8 sm:p-12 border border-slate-100/80">
            {/* Ícone elegante com animação de check */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                Agradecemos o seu reconhecimento
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Sua opinião é muito importante para nós.
              </p>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 mb-8">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Seu comentário</p>
                <p className="text-slate-700 leading-relaxed">{comentario}</p>
              </div>
            )}

            {/* Instruções discretas */}
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed max-w-sm mx-auto">
              Ao clicar no botão, seu texto será copiado automaticamente. Basta colar na avaliação do Google.
            </p>

            {/* Box de Inspiração - Discreto */}
            {empresa.modelo_sugestao && (
              <div className="border border-slate-200 rounded-lg p-5 mb-8 bg-slate-50/50">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Sugestão de texto</p>
                <p className="text-sm text-slate-600 italic leading-relaxed">
                  "{empresa.modelo_sugestao}"
                </p>
              </div>
            )}

            {/* Botão principal - Executivo */}
            <Button
              onClick={handleCopyAndRedirect}
              className="w-full h-12 text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 shadow-md hover:shadow-lg gap-2"
              size="lg"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Copiado — Abrindo Google</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 flex-shrink-0" />
                  <span>Copiar e Avaliar no Google</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                </>
              )}
            </Button>
          </div>
        ) : (
          // Cenário B: Nota 1, 2 ou 3 - Acolhimento Elegante
          <div className="bg-white rounded-xl shadow-xl shadow-slate-200/40 p-8 sm:p-12 border border-slate-100/80">
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-slate-100 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-slate-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                Lamentamos que sua experiência não tenha sido ideal
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                Gostaríamos de entender melhor o que aconteceu.
              </p>
            </div>

            {/* Comentário do cliente */}
            {comentario.trim() && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 mb-8">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Seu comentário</p>
                <p className="text-slate-700 leading-relaxed">{comentario}</p>
              </div>
            )}

            {/* Pergunta */}
            <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
              Deseja encaminhar seu feedback diretamente à nossa equipe?
            </p>

            {/* Botões de ação - Outline elegante */}
            <div className="space-y-3">
              {empresa.whatsapp_empresa && (
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full h-12 text-sm gap-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  Enviar via WhatsApp
                </Button>
              )}

              {empresa.email_empresa && (
                <Button
                  onClick={handleEmail}
                  variant="outline"
                  className="w-full h-12 text-sm gap-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  size="lg"
                >
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  Enviar via E-mail
                </Button>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleFinalizar}
                  className="w-full h-12 text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  size="lg"
                >
                  Finalizar avaliação
                </Button>
              </div>
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
