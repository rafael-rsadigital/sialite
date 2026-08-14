import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle2, Copy, ExternalLink, Mail, MessageCircle, PenLine, Pencil, Star, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/StarRating";
import { ServicoSuspenso } from "@/components/ServicoSuspenso";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Etapa = "coleta" | "desfecho" | "retorno";

const DEMO_DATA = {
  id: "demo",
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
    id: string;
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
  const [etapa, setEtapa] = useState<Etapa>("coleta");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nomeRetorno, setNomeRetorno] = useState("");
  const [contatoRetorno, setContatoRetorno] = useState("");

  useEffect(() => {
    async function fetchEmpresa() {
      if (isDemo) {
        setEmpresa({ ...DEMO_DATA, nome_exibicao: nomeFromQuery || DEMO_DATA.nome_exibicao });
        setLoading(false);
        return;
      }

      if (!slug) return;
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome_exibicao, link_google, whatsapp_empresa, email_empresa, modelo_sugestao, status_assinatura")
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

  const salvarFeedback = async (tipoEnvio: string, texto: string) => {
    if (!isDemo && empresa?.id) {
      await supabase.from("feedbacks").insert({
        empresa_id: empresa.id,
        nota,
        comentario: texto,
        tipo_envio: tipoEnvio,
      });
    }
  };

  const montarFeedback = (incluirContato = false) => {
    const partes = [comentario.trim()];
    if (incluirContato && (nomeRetorno.trim() || contatoRetorno.trim())) {
      const identificacao = [nomeRetorno.trim(), contatoRetorno.trim()].filter(Boolean).join(" · ");
      partes.push(`Solicitação de retorno: ${identificacao}`);
    }
    return partes.filter(Boolean).join("\n\n") || "Feedback sem comentário";
  };

  const handleRegistrar = () => {
    if (nota === 0) {
      toast.error("Por favor, selecione uma nota");
      return;
    }
    setEtapa("desfecho");
  };

  const handleCopyAndRedirect = async () => {
    const texto = montarFeedback();
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = texto;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    await salvarFeedback("google", texto);
    setCopied(true);
    toast.success("Comentário copiado!");
    setTimeout(() => {
      if (empresa?.link_google) window.open(empresa.link_google, "_blank");
    }, 500);
  };

  const handleWhatsApp = async () => {
    if (!empresa?.whatsapp_empresa) return;
    const texto = montarFeedback(true);
    await salvarFeedback("whatsapp", texto);
    const phone = empresa.whatsapp_empresa.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const handleEmail = async () => {
    if (!empresa?.email_empresa) return;
    const texto = montarFeedback(true);
    await salvarFeedback("email", texto);
    const subject = encodeURIComponent("Solicitação de retorno — avaliação");
    window.open(`mailto:${empresa.email_empresa}?subject=${subject}&body=${encodeURIComponent(texto)}`, "_blank");
  };

  const handleFinalizar = async () => {
    const solicitouRetorno = etapa === "retorno";
    await salvarFeedback(solicitouRetorno ? "direto" : "anonimo", montarFeedback(solicitouRetorno));
    setSubmitted(true);
  };

  const isPositive = nota >= 4;

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
          <p className="eyebrow mt-7 text-[#d6a66a]">Reclamação registrada</p>
          <h1 className="display-title mt-3 text-3xl text-[#f5f0e5]">Obrigado por compartilhar sua experiência.</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#c1c9cf]">Seu relato foi registrado. Vamos trabalhar para evoluir continuamente e oferecer uma experiência melhor nas próximas oportunidades.</p>
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
          <header className="mb-12 text-center"><p className="eyebrow">Sua avaliação</p><h1 className="display-title mt-3 text-3xl text-slate-800">Obrigado por escolher a <span className="font-bold">{empresa.nome_exibicao}</span></h1><p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">Sua opinião nos ajuda a melhorar continuamente.</p></header>
          <section className="review-card border border-slate-100/80 p-8 sm:p-10"><div className="mb-12 flex justify-center"><StarRating value={nota} onChange={setNota} /></div><div className="mb-10"><Textarea placeholder="Conte-nos sobre sua experiência (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} className="min-h-[120px] resize-none rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-slate-100" /></div><Button onClick={handleRegistrar} className="legacy-button h-12 w-full text-sm font-bold" size="lg">Enviar avaliação</Button></section>
          <p className="mt-8 text-center text-xs text-slate-400">Powered by SIA</p>
        </div>
      </main>
    );
  }

  if (etapa === "retorno") {
    return (
      <main className="min-h-screen paper-screen px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-md animate-fade-in">
          <header className="mb-8 text-center"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-[#b9c1c9] bg-[#ece9df] text-[#214d76]"><UserRound className="h-5 w-5" /></div><p className="eyebrow">Atendimento e acompanhamento</p><h1 className="display-title mt-3 text-3xl text-slate-800">Queremos ajudar.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">Deixe uma forma de contato se desejar receber um retorno sobre sua reclamação.</p></header>
          <section className="review-card border border-slate-100/80 p-7 sm:p-9">
            <div className="space-y-5"><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="comentario-retorno">Seu relato</label><Textarea id="comentario-retorno" placeholder="Descreva o que podemos melhorar..." value={comentario} onChange={(e) => setComentario(e.target.value)} className="mt-2 min-h-[110px] resize-none rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-slate-100" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="nome-retorno">Nome <span className="font-normal normal-case tracking-normal">(opcional)</span></label><Input id="nome-retorno" value={nomeRetorno} onChange={(e) => setNomeRetorno(e.target.value)} placeholder="Como podemos chamar você?" className="legacy-field mt-2 px-3 text-sm" /></div><div><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="contato-retorno">Telefone ou e-mail <span className="font-normal normal-case tracking-normal">(opcional)</span></label><Input id="contato-retorno" value={contatoRetorno} onChange={(e) => setContatoRetorno(e.target.value)} placeholder="Seu melhor contato" className="legacy-field mt-2 px-3 text-sm" /></div></div></div>
            {(empresa.whatsapp_empresa || empresa.email_empresa) && <div className="mt-8 border-t border-[#d6cebf] pt-6"><p className="text-center text-sm leading-6 text-[#5d6872]">Gostaria de uma solução imediata para o seu caso? Nos envie diretamente nos botões abaixo.</p><div className="mt-4 space-y-3">{empresa.whatsapp_empresa && <Button onClick={handleWhatsApp} variant="outline" className="h-12 w-full gap-3 border-[#bdb3a0] text-sm text-[#31495f] hover:bg-[#ece9df]"><MessageCircle className="h-4 w-4" />Enviar via WhatsApp</Button>}{empresa.email_empresa && <Button onClick={handleEmail} variant="outline" className="h-12 w-full gap-3 border-[#bdb3a0] text-sm text-[#31495f] hover:bg-[#ece9df]"><Mail className="h-4 w-4" />Enviar via e-mail</Button>}</div></div>}
            <div className="mt-7 border-t border-[#d6cebf] pt-6"><Button onClick={handleFinalizar} className="legacy-button h-12 w-full text-sm font-bold" size="lg">Registrar e finalizar</Button><button onClick={() => setEtapa("coleta")} className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Alterar nota</button></div>
          </section>
          <p className="mt-7 text-center text-xs text-slate-400">Powered by SIA</p>
        </div>
      </main>
    );
  }

  return (
    <main className={isPositive ? "positive-stage min-h-screen px-4 py-10 sm:py-14" : "min-h-screen paper-screen px-4 py-10 sm:py-14"}>
      <div className="mx-auto max-w-md animate-fade-in">
        {isDemo && <div className="mb-6 text-center"><span className="inline-flex bg-[#f5f0e5]/10 px-3 py-1.5 text-xs font-medium text-[#f5f0e5]">Demonstração</span></div>}
        {isPositive ? (
          <section className="positive-panel p-7 text-center sm:p-9">
            <div className="flex justify-center gap-1 text-[#efbf43]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-5 w-5 fill-current" />)}</div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#efbf43]">Muito obrigado</p>
            <h1 className="display-title mx-auto mt-3 max-w-sm text-3xl leading-tight text-[#f9f3e7] sm:text-4xl">Obrigado por escolher a <strong>{empresa.nome_exibicao}</strong>.</h1>
            <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#d6d0c4]">Sua experiência é importante para nós. Se você gostou do atendimento, uma avaliação ajuda outras pessoas a conhecerem a {empresa.nome_exibicao}.</p>
            <div className="mt-7 text-left"><label className="text-[10px] font-bold uppercase tracking-[.14em] text-[#d4cbbb]" htmlFor="comentario-positivo">Seu comentário</label><Textarea id="comentario-positivo" placeholder="Adicione ou edite seu comentário..." value={comentario} onChange={(e) => setComentario(e.target.value)} className="mt-2 min-h-[96px] resize-none border-[#6b665e] bg-black/20 text-sm text-[#f9f3e7] placeholder:text-[#aaa399] focus:border-[#d6a66a] focus:ring-[#d6a66a]/20" /></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="positive-tip"><Camera className="mx-auto h-4 w-4 text-[#efbf43]" /><p>Se puder, tire uma foto do produto ou do serviço realizado.</p></div><div className="positive-tip"><PenLine className="mx-auto h-4 w-4 text-[#efbf43]" /><p>Comente o que achou do atendimento e cite o nome do produto ou serviço.</p></div></div>
            {empresa.modelo_sugestao && <div className="mt-4 border border-[#625c55] bg-black/10 p-4 text-left"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#d4cbbb]">Sugestão de mensagem</p><p className="mt-2 text-sm leading-6 text-[#e8e0d2]">“{empresa.modelo_sugestao}”</p></div>}
            <Button onClick={handleCopyAndRedirect} className="positive-cta mt-6 h-12 w-full gap-2 text-sm font-bold" size="lg">{copied ? <><CheckCircle2 className="h-4 w-4" />Copiado — abrindo Google</> : <><Copy className="h-4 w-4" />Copiar e avaliar no Google <ExternalLink className="h-3.5 w-3.5 opacity-75" /></>}</Button>
            <button onClick={() => setEtapa("coleta")} className="mt-5 flex w-full items-center justify-center gap-1.5 text-sm text-[#c7c0b4] transition-colors hover:text-[#f9f3e7]"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Alterar nota</button>
            <p className="mt-7 text-[11px] text-[#aaa399]">SIA — Sistema Inteligente de Avaliações</p>
          </section>
        ) : (
          <section className="review-card border border-slate-100/80 p-8 sm:p-10">
            <header className="text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#b9c1c9] bg-[#ece9df] text-[#214d76]"><MessageCircle className="h-6 w-6" strokeWidth={1.5} /></div><p className="eyebrow">Sua opinião importa</p><h1 className="display-title mt-3 text-3xl text-slate-800">Lamentamos que sua experiência não tenha sido ideal.</h1><p className="mt-3 text-sm leading-6 text-slate-500">Seu relato nos ajuda a entender e melhorar.</p></header>
            <div className="mt-8"><label className="text-xs font-bold uppercase tracking-[.1em] text-[#31495f]" htmlFor="comentario-negativo">Seu comentário</label><Textarea id="comentario-negativo" placeholder="Descreva o que podemos melhorar..." value={comentario} onChange={(e) => setComentario(e.target.value)} className="mt-2 min-h-[110px] resize-none rounded-lg border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-slate-100" /></div>
            <div className="mt-7 border-y border-[#d6cebf] py-6 text-center"><p className="text-base font-semibold leading-6 text-[#233d55]">Deseja receber um retorno sobre sua reclamação?</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Button onClick={() => setEtapa("retorno")} className="legacy-button h-12 text-sm font-bold">Sim</Button><Button onClick={handleFinalizar} variant="outline" className="h-12 border-[#bdb3a0] text-sm font-semibold text-[#31495f] hover:bg-[#ece9df]">Registrar e finalizar</Button></div></div>
            <button onClick={() => setEtapa("coleta")} className="mt-5 flex w-full items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"><Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Alterar nota</button>
          </section>
        )}
      </div>
    </main>
  );
}
