import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, ExternalLink, Loader2, Mail, MessageCircle, Pencil, Star, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { ServicoSuspenso } from "@/components/ServicoSuspenso";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import siaLogo from "@/assets/sia-lite-logo.png";

// Fluxo em 3 telas + desfecho, desenhado para não fazer "review gating":
// a decisão de publicar no Google ou falar direto com a empresa é sempre
// do cliente, nunca uma consequência automática da nota que ele deu.
// Ver conversa/decisão de produto sobre conformidade com as diretrizes do
// Google Business Profile.
type Etapa = "coleta" | "comentario" | "escolha" | "empresa_retorno" | "retorno";
type Caminho = "google" | "empresa" | null;

const DEMO_DATA = {
  nome_exibicao: "Sua Empresa",
  link_google: "https://www.google.com/maps",
  whatsapp_empresa: "5511999999999",
  email_empresa: "contato@suaempresa.com",
  modelo_sugestao: "Adorei o atendimento! A equipe foi muito atenciosa e o serviço superou minhas expectativas. Recomendo a todos!",
  status_assinatura: true,
};

export default function Avaliacao() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isDemo = slug === "demo";
  const nomeFromQuery = searchParams.get("nome");
  const [empresa, setEmpresa] = useState<{
    nome_exibicao: string;
    link_google: string | null;
    whatsapp_empresa: string | null;
    email_empresa: string | null;
    modelo_sugestao: string | null;
    status_assinatura: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [produtoServico, setProdutoServico] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("coleta");
  const [submitted, setSubmitted] = useState(false);
  const [caminho, setCaminho] = useState<Caminho>(null);
  const [blocosVisiveis, setBlocosVisiveis] = useState(0);
  const [progressoIniciado, setProgressoIniciado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nomeRetorno, setNomeRetorno] = useState("");
  const [telefoneRetorno, setTelefoneRetorno] = useState("");
  const [emailRetorno, setEmailRetorno] = useState("");

  useEffect(() => {
    async function fetchEmpresa() {
      if (isDemo) {
        setEmpresa({ ...DEMO_DATA, nome_exibicao: nomeFromQuery || DEMO_DATA.nome_exibicao });
        setLoading(false);
        return;
      }

      if (!slug) return;
      const { data, error } = await supabase
        .from("empresas_publicas")
        .select("nome_exibicao, link_google, whatsapp_empresa, email_empresa, modelo_sugestao, status_assinatura")
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

  const salvarFeedback = async (tipoEnvio: string, texto: string, dadosRetorno?: { nomeCliente?: string; telefoneCliente?: string; emailCliente?: string }) => {
    if (isDemo || !slug) return true;
    const { error } = await supabase.rpc("registrar_feedback_publico", {
      p_slug: slug,
      p_nota: nota,
      p_comentario: texto,
      p_tipo_envio: tipoEnvio,
      p_solicitou_retorno: Boolean(dadosRetorno),
      p_nome_cliente: dadosRetorno?.nomeCliente || nomeCliente.trim() || null,
      p_telefone_cliente: dadosRetorno?.telefoneCliente || null,
      p_email_cliente: dadosRetorno?.emailCliente || null,
      p_produto_servico: produtoServico.trim() || null,
    } as never);
    if (error) {
      toast.error("Não foi possível registrar sua avaliação. Tente novamente.");
      return false;
    }
    return true;
  };

  // Texto padrão só usado quando a pessoa opta por falar com a empresa e
  // não escreveu nada — nunca é usado no caminho do Google (lá o comentário
  // vai literal, vazio inclusive, sem texto de preenchimento).
  const montarFeedbackEmpresa = () => comentario.trim() || "Sem comentário adicional";

  const validarDadosRetorno = () => {
    if (!nomeRetorno.trim() && !nomeCliente.trim()) {
      toast.error("Informe seu nome para solicitar um retorno.");
      return false;
    }
    if (!telefoneRetorno.trim() && !emailRetorno.trim()) {
      toast.error("Informe pelo menos um contato: celular ou e-mail.");
      return false;
    }
    return true;
  };

  const obterDadosRetorno = () => ({
    nomeCliente: nomeRetorno.trim() || nomeCliente.trim(),
    telefoneCliente: telefoneRetorno.trim() || undefined,
    emailCliente: emailRetorno.trim() || undefined,
  });

  const handleAvancarColeta = () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota");
      return;
    }
    setEtapa("comentario");
  };

  const handleAvancarComentario = () => {
    setEtapa("escolha");
  };

  // A pessoa escolhe para onde a própria avaliação vai — essa decisão nunca
  // depende da nota selecionada. As duas opções na tela de escolha têm o
  // mesmo peso visual.
  const handleEscolherGoogle = async () => {
    if (enviando) return;
    setEnviando(true);
    try {
      const texto = comentario.trim();
      let copiado = false;

      // O Google não tem um jeito confiável de pré-preencher o campo de
      // comentário via link — por isso copiamos pra área de transferência
      // pra pessoa só colar (Ctrl+V) na hora de escrever lá. Só faz sentido
      // se ela realmente escreveu algo.
      if (texto) {
        try {
          await navigator.clipboard.writeText(texto);
          copiado = true;
        } catch (erroClipboardApi) {
          try {
            const textArea = document.createElement("textarea");
            textArea.value = texto;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            copiado = document.execCommand("copy");
            document.body.removeChild(textArea);
          } catch (erroFallback) {
            console.error("Falha ao copiar comentário (clipboard API e fallback):", erroClipboardApi, erroFallback);
          }
        }
        if (copiado) {
          toast.success("Comentário copiado! Cole no campo de avaliação do Google.");
        } else {
          toast.error("Não foi possível copiar automaticamente. Copie seu comentário manualmente antes de continuar.");
        }
      }

      // Texto transportado literalmente, sem reescrever/resumir/melhorar.
      const salvo = await salvarFeedback("google", texto);
      if (!salvo) return;
      setCaminho("google");
      setSubmitted(true);
    } finally {
      setEnviando(false);
    }
  };

  const handleEscolherEmpresa = () => {
    if (!nomeRetorno.trim()) setNomeRetorno(nomeCliente.trim());
    setEtapa("empresa_retorno");
  };

  const handleWhatsApp = async () => {
    if (!empresa?.whatsapp_empresa || enviando) return;
    setEnviando(true);
    try {
      if (!validarDadosRetorno()) return;
      const texto = montarFeedbackEmpresa();
      const salvo = await salvarFeedback("whatsapp", texto, obterDadosRetorno());
      if (!salvo) return;
      const phone = empresa.whatsapp_empresa.replace(/\D/g, "");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(texto)}`, "_blank");
      setCaminho("empresa");
      setSubmitted(true);
    } finally {
      setEnviando(false);
    }
  };

  const handleEmail = async () => {
    if (!empresa?.email_empresa || enviando) return;
    setEnviando(true);
    try {
      if (!validarDadosRetorno()) return;
      const texto = montarFeedbackEmpresa();
      const salvo = await salvarFeedback("email", texto, obterDadosRetorno());
      if (!salvo) return;
      const subject = encodeURIComponent("Solicitação de retorno — avaliação");
      window.open(`mailto:${empresa.email_empresa}?subject=${subject}&body=${encodeURIComponent(texto)}`, "_blank");
      setCaminho("empresa");
      setSubmitted(true);
    } finally {
      setEnviando(false);
    }
  };

  const handleFinalizarEmpresa = async () => {
    if (enviando) return;
    const solicitouRetorno = etapa === "retorno";
    if (solicitouRetorno && !validarDadosRetorno()) return;
    setEnviando(true);
    try {
      const salvo = await salvarFeedback(solicitouRetorno ? "direto" : "anonimo", montarFeedbackEmpresa(), solicitouRetorno ? obterDadosRetorno() : undefined);
      if (salvo) {
        setCaminho("empresa");
        setSubmitted(true);
      }
    } finally {
      setEnviando(false);
    }
  };

  const blocosGoogle = (() => {
    const nomeEmpresa = empresa?.nome_exibicao ?? "nossa empresa";
    const blocos = ["estamos abrindo nossa página no Google para você publicar sua avaliação."];
    if (comentario.trim()) {
      blocos.push("Seu comentário foi copiado automaticamente, basta colar e publicar.");
    }
    blocos.push(`Sua contribuição ajudará outras pessoas a conhecerem a ${nomeEmpresa}. Obrigado 🙂`);
    return blocos;
  })();

  useEffect(() => {
    if (!submitted || caminho !== "google") return;
    setBlocosVisiveis(0);

    const atrasoInicial = 1300; // "Aguarde..." sozinho, com os 3 pontinhos
    const janela = 8200; // tempo restante até pouco antes do redirecionamento, dividido entre os blocos
    const intervalo = janela / Math.max(blocosGoogle.length, 1);
    const timers: number[] = [];

    for (let i = 1; i <= blocosGoogle.length; i++) {
      timers.push(window.setTimeout(() => setBlocosVisiveis(i), atrasoInicial + (i - 1) * intervalo));
    }

    timers.push(window.setTimeout(() => {
      if (empresa?.link_google) window.location.href = empresa.link_google;
    }, 11000));

    const raf = requestAnimationFrame(() => setProgressoIniciado(true));
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, caminho]);

  if (loading) {
    return <div className="min-h-screen paper-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin border-2 border-[#687887] border-t-[#d6a66a]" /></div>;
  }

  if (!empresa) {
    return (
      <div className="min-h-screen paper-screen flex items-center justify-center p-4">
        <div className="review-card max-w-sm border border-slate-100/80 p-10 text-center"><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-slate-100"><Star className="h-7 w-7 text-slate-400" strokeWidth={1.5} /></div><h1 className="text-lg font-semibold text-slate-800">Empresa não encontrada</h1><p className="mt-3 text-sm text-slate-500">Verifique se o link está correto.</p></div>
      </div>
    );
  }

  if (!empresa.status_assinatura && !isDemo) return <ServicoSuspenso />;

  if (submitted) {
    return (
      <main className="ink-shell flex items-center justify-center p-5">
        <section className="portal-panel w-full max-w-xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#d6a66a] bg-[#d6a66a]/10 text-[#d6a66a]"><CheckCircle2 className="h-7 w-7" /></div>
          {caminho === "google" ? (
            <>
              <div className="mx-auto mt-7 max-w-md text-left">
                <p className="flex items-center gap-1 text-[1.35rem] font-bold leading-tight text-[#f5f0e5] sm:text-[1.69rem]">
                  Aguarde
                  <span className="inline-flex gap-0.5" aria-hidden="true">
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                    <span className="loading-dot">.</span>
                  </span>
                </p>
                <div className="mt-4 min-h-[6.5rem] space-y-3 text-sm leading-6 text-[#c1c9cf]">
                  {blocosGoogle.slice(0, blocosVisiveis).map((bloco, indice) => (
                    <p key={indice} className="animate-fade-in">{bloco}</p>
                  ))}
                </div>
              </div>
              <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden bg-white/10">
                <div className="h-full bg-[#d6a66a]" style={{ width: progressoIniciado ? "100%" : "0%", transition: "width 11s linear" }} />
              </div>
              {empresa.link_google && <a href={empresa.link_google} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d6a66a] underline underline-offset-4">Abrir agora <ExternalLink className="h-3.5 w-3.5" /></a>}
            </>
          ) : (
            <>
              <p className="eyebrow mt-7 text-[#d6a66a]">Avaliação enviada</p>
              <h1 className="display-title mt-3 text-3xl text-[#f5f0e5]">Obrigado por compartilhar sua experiência com a gente.</h1>
              <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#c1c9cf]">Sua avaliação foi registrada e nossa equipe vai analisar o que você compartilhou.</p>
            </>
          )}
          {isDemo && <p className="mt-7 border border-[#526170] bg-white/5 px-4 py-3 text-xs text-[#aeb8c0]">Modo demonstração — nenhum dado foi salvo.</p>}
        </section>
      </main>
    );
  }

  if (etapa === "coleta") {
    return (
      <main className="min-h-screen paper-screen px-4 py-12">
        <div className="mx-auto max-w-md">
          {isDemo && <div className="mb-8 text-center"><span className="inline-flex bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">Demonstração</span></div>}
          <header className="mb-12 text-center"><img src={siaLogo} alt="SIA Lite" className="sia-logo-lockup mx-auto mb-4" /><p className="eyebrow">Sua avaliação</p><h1 className="display-title mt-3 text-3xl text-slate-800">Obrigado por escolher a <span className="font-bold">{empresa.nome_exibicao}</span></h1><p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">Sua opinião nos ajuda a melhorar continuamente.</p></header>
          <section className="review-card border border-slate-100/80 p-8 sm:p-10"><div className="mb-10 flex justify-center"><StarRating value={nota} onChange={setNota} /></div><div className="mb-8 space-y-5"><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="nome-cliente">Como podemos te chamar</label><Input id="nome-cliente" maxLength={120} value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Seu nome" className="legacy-field mt-2 px-3 text-sm" /></div><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="produto-servico">Qual o nome do produto adquirido ou do serviço realizado</label><Input id="produto-servico" maxLength={200} value={produtoServico} onChange={(e) => setProdutoServico(e.target.value)} placeholder="Ex.: corte de cabelo, troca de óleo..." className="legacy-field mt-2 px-3 text-sm" /></div></div><Button onClick={handleAvancarColeta} disabled={enviando} className="legacy-button h-12 w-full text-sm font-bold" size="lg">Avançar</Button></section>
          <p className="mt-8 text-center text-xs text-slate-400">Powered by SIA</p>
        </div>
      </main>
    );
  }

  if (etapa === "comentario") {
    return (
      <main className="min-h-screen paper-screen px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-md animate-fade-in">
          {isDemo && <div className="mb-6 text-center"><span className="inline-flex bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">Demonstração</span></div>}
          <section className="review-card border border-slate-100/80 p-8 sm:p-10">
            <header className="text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#b9c1c9] bg-[#ece9df] text-[#214d76]"><MessageCircle className="h-6 w-6" strokeWidth={1.5} /></div><p className="eyebrow">Sua opinião importa</p><h1 className="display-title mt-3 text-3xl text-slate-800">Conte um pouco mais sobre sua experiência</h1><p className="mt-3 text-sm leading-6 text-slate-500">Seu comentário é opcional.</p></header>
            <div className="mt-8"><Textarea id="comentario-geral" maxLength={2000} placeholder="Escreva aqui, se quiser (opcional)..." value={comentario} onChange={(e) => setComentario(e.target.value)} className="min-h-[110px] resize-none rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-slate-100" /></div>
            <div className="mt-7"><Button onClick={handleAvancarComentario} className="legacy-button h-12 w-full text-sm font-bold" size="lg">Avançar</Button></div>
            <button onClick={() => setEtapa("coleta")} className="mt-5 flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Alterar nota</button>
          </section>
        </div>
      </main>
    );
  }

  if (etapa === "escolha") {
    return (
      <main className="min-h-screen paper-screen px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-md animate-fade-in">
          {isDemo && <div className="mb-6 text-center"><span className="inline-flex bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">Demonstração</span></div>}
          <section className="review-card border border-slate-100/80 p-8 sm:p-10">
            <header className="text-center"><p className="eyebrow">Última etapa</p><h1 className="display-title mt-3 text-2xl text-slate-800">Como você prefere compartilhar sua avaliação?</h1></header>
            <div className="mt-8 space-y-4">
              <button
                onClick={handleEscolherGoogle}
                disabled={enviando}
                className="w-full border border-[#8793a0] bg-white p-5 text-left shadow-[inset_0_1px_0_rgb(18_34_53_/_0.06)] transition-colors hover:border-[#214d76] disabled:opacity-60"
              >
                <p className="text-base font-bold text-[#233d55]">Publicar no Google</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">Sua avaliação ajuda outras pessoas a conhecerem a {empresa.nome_exibicao}.</p>
              </button>
              <button
                onClick={handleEscolherEmpresa}
                disabled={enviando}
                className="w-full border border-[#8793a0] bg-white p-5 text-left shadow-[inset_0_1px_0_rgb(18_34_53_/_0.06)] transition-colors hover:border-[#214d76] disabled:opacity-60"
              >
                <p className="text-base font-bold text-[#233d55]">Enviar direto pra {empresa.nome_exibicao}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">Prefere só avisar a equipe, sem publicar? Também podemos te dar um retorno.</p>
              </button>
            </div>
            {enviando && <p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Aguarde...</p>}
            <button onClick={() => setEtapa("comentario")} className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Editar comentário</button>
          </section>
        </div>
      </main>
    );
  }

  if (etapa === "retorno") {
    return (
      <main className="min-h-screen paper-screen px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-md animate-fade-in">
          <header className="mb-8 text-center"><img src={siaLogo} alt="SIA Lite" className="sia-logo-lockup mx-auto mb-3" /><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[#b9c1c9] bg-[#ece9df] text-[#214d76]"><UserRound className="h-5 w-5" /></div><p className="eyebrow">Atendimento e acompanhamento</p><h1 className="display-title mt-3 text-3xl text-slate-800">Queremos ajudar.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">Deixe uma forma de contato para receber um retorno.</p></header>
          <section className="review-card border border-slate-100/80 p-7 sm:p-9">
            <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="nome-retorno">Nome</label><Input id="nome-retorno" maxLength={120} value={nomeRetorno} onChange={(e) => setNomeRetorno(e.target.value)} placeholder="Como podemos chamar você?" className="legacy-field mt-2 px-3 text-sm" /></div><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="telefone-retorno">Celular</label><Input id="telefone-retorno" maxLength={40} type="tel" value={telefoneRetorno} onChange={(e) => setTelefoneRetorno(e.target.value)} placeholder="(00) 00000-0000" className="legacy-field mt-2 px-3 text-sm" /></div><div className="sm:col-span-2"><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="email-retorno">E-mail</label><Input id="email-retorno" maxLength={200} type="email" value={emailRetorno} onChange={(e) => setEmailRetorno(e.target.value)} placeholder="seu@email.com" className="legacy-field mt-2 px-3 text-sm" /><p className="mt-2 text-xs text-slate-500">Informe pelo menos um contato: celular ou e-mail.</p></div></div>
            <div className="mt-7 border-t border-[#d6cebf] pt-6"><Button onClick={handleFinalizarEmpresa} disabled={enviando} className="legacy-button h-12 w-full gap-2 text-sm font-bold" size="lg">{enviando ? <><Loader2 className="h-4 w-4 animate-spin" />Aguarde...</> : "Registrar e finalizar"}</Button></div>
            {(empresa.whatsapp_empresa || empresa.email_empresa) && <div className="mt-6 border-t border-[#d6cebf] pt-6"><p className="text-center text-sm leading-6 text-[#5d6872]">Gostaria de uma solução imediata para o seu caso? Nos envie diretamente nos botões abaixo.</p><div className="mt-4 space-y-3">{empresa.whatsapp_empresa && <Button onClick={handleWhatsApp} disabled={enviando} variant="outline" className="h-12 w-full gap-3 border-[#bdb3a0] text-sm text-[#31495f] hover:bg-[#ece9df]">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}{enviando ? "Aguarde..." : "Enviar via WhatsApp"}</Button>}{empresa.email_empresa && <Button onClick={handleEmail} disabled={enviando} variant="outline" className="h-12 w-full gap-3 border-[#bdb3a0] text-sm text-[#31495f] hover:bg-[#ece9df]">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{enviando ? "Aguarde..." : "Enviar via e-mail"}</Button>}</div></div>}
            <div className="mt-6 border-t border-[#d6cebf] pt-6"><button onClick={() => setEtapa("empresa_retorno")} className="flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Voltar</button></div>
          </section>
          <p className="mt-7 text-center text-xs text-slate-400">Powered by SIA</p>
        </div>
      </main>
    );
  }

  // etapa === "empresa_retorno"
  return (
    <main className="min-h-screen paper-screen px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-md animate-fade-in">
        {isDemo && <div className="mb-6 text-center"><span className="inline-flex bg-[#f5f0e5]/10 px-3 py-1.5 text-xs font-medium text-[#f5f0e5]">Demonstração</span></div>}
        <section className="review-card border border-slate-100/80 p-8 sm:p-10">
          <header className="text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#b9c1c9] bg-[#ece9df] text-[#214d76]"><MessageCircle className="h-6 w-6" strokeWidth={1.5} /></div><p className="eyebrow">Recebemos sua avaliação</p><h1 className="display-title mt-3 text-2xl text-slate-800">Gostaria de receber um retorno da nossa equipe?</h1></header>
          <div className="mt-8 grid gap-3 sm:grid-cols-2"><Button onClick={() => setEtapa("retorno")} className="legacy-button h-12 text-sm font-bold">Sim</Button><Button onClick={handleFinalizarEmpresa} disabled={enviando} variant="outline" className="legacy-button-secondary h-12 text-sm font-semibold">{enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar e finalizar"}</Button></div>
          <button onClick={() => setEtapa("escolha")} className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Voltar</button>
        </section>
      </div>
    </main>
  );
}
