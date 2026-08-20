import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  Link2,
  MessageSquare,
  Play,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import siaLogo from "@/assets/sia-lite-logo.png";

const WHATSAPP_SIA = "5512988052097";

function linkWhatsAppSia(mensagem: string) {
  return `https://wa.me/${WHATSAPP_SIA}?text=${encodeURIComponent(mensagem)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.478 2 2 6.478 2 12.004c0 2.116.553 4.19 1.604 6.005L2 22l4.116-1.605A9.965 9.965 0 0012.004 22C17.53 22 22 17.522 22 11.996 22 6.47 17.53 2 12.004 2zm0 18.062a8.06 8.06 0 01-4.126-1.129l-.296-.176-2.445.937.965-2.377-.192-.309a8.06 8.06 0 01-1.24-4.28c0-4.462 3.63-8.093 8.09-8.093 4.462 0 8.093 3.631 8.093 8.093 0 4.462-3.63 8.334-8.849 8.334z" />
    </svg>
  );
}

const features = [
  {
    icon: Star,
    number: "01",
    title: "Mais avaliações positivas",
    desc: "Facilite o caminho para clientes satisfeitos compartilharem sua experiência no Google.",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "Feedback direto para a empresa",
    desc: "Quando a experiência não foi boa, o cliente encontra um canal privado para falar com você.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Acompanhamento simples",
    desc: "Veja notas, comentários e origem dos feedbacks em um único painel.",
  },
];

const steps = [
  { number: "01", title: "Cliente acessa", desc: "Por QR Code ou link exclusivo da empresa." },
  { number: "02", title: "Escolhe uma nota", desc: "Uma experiência rápida e clara no celular." },
  { number: "03", title: "SIA direciona", desc: "O próximo passo muda de acordo com a avaliação." },
  { number: "04", title: "Você acompanha", desc: "Os feedbacks ficam organizados no seu painel." },
];

export default function Index() {
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [linkAvaliacao, setLinkAvaliacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [etapaDialogLink, setEtapaDialogLink] = useState<"inicial" | "pergunta_ajuda">("inicial");

  const handleOpenLinkDialog = () => {
    if (nomeEmpresa.trim()) {
      setEtapaDialogLink("inicial");
      setShowLinkDialog(true);
    }
  };

  const handleProsseguir = async (comLink: boolean) => {
    setIsSubmitting(true);
    try {
      await supabase.from("leads_teste").insert({
        nome_empresa: nomeEmpresa.trim(),
        link_avaliacao: comLink && linkAvaliacao.trim() ? linkAvaliacao.trim() : null,
      });
    } catch {
      // A demonstração segue disponível mesmo quando o registro do lead falha.
    }
    setShowLinkDialog(false);
    navigate(`/av/demo?nome=${encodeURIComponent(nomeEmpresa.trim())}`);
  };

  return (
    <main className="site-shell overflow-hidden">
      <a
        href={linkWhatsAppSia("Olá! Vim do site do SIA e gostaria de saber mais.")}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <header className="masthead relative z-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="brand-mark overflow-hidden" aria-hidden="true">
              <img src={siaLogo} alt="" className="sia-logo-mark" />
            </div>
            <div>
              <span className="block text-sm font-bold leading-none tracking-tight text-[#f5f8fc]">SIA</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#b7d4e7] sm:text-[10px]">
                Sistema Inteligente de Avaliações
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-7 text-xs font-semibold text-[#d2e7f5] md:flex">
            <a href="#beneficios" className="transition-colors hover:text-[#68d9ef]">Benefícios</a>
            <a href="#processo" className="transition-colors hover:text-[#68d9ef]">Como funciona</a>
            <button type="button" onClick={() => navigate("/acesso")} className="transition-colors hover:text-[#68d9ef]">
              Área do cliente
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate("/acesso")}
            className="border border-[#4a7394] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#d2e7f5] transition-colors hover:border-[#68d9ef] hover:text-[#68d9ef] md:hidden"
          >
            Entrar
          </button>
          <span className="hidden border-l border-[#4a7394] pl-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6de0ee] md:inline">
            Reputação e feedback
          </span>
        </nav>
      </header>

      <section className="relative border-b border-[#bdb3a0] bg-[#f8f5ed]/90 px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-2"><span className="h-1.5 w-1.5 bg-[#b7783a]" /> Gestão de reputação</p>
            <h1 className="display-title mt-5 max-w-3xl text-4xl text-[#122235] sm:text-5xl lg:text-6xl">
              A opinião do cliente merece um processo à altura.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#52606b] lg:text-lg">
              O SIA organiza o caminho entre a avaliação, o Google e o retorno privado. Sem ruído, sem improviso e com uma experiência natural para quem avalia.
            </p>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-y border-[#c9c0b0] py-4 text-xs font-semibold text-[#31495f]">
              {["Demonstração gratuita", "Sem cartão", "Desenhado para celular"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#8b5427]" />{item}</span>
              ))}
            </div>
          </div>

          <aside className="legacy-card relative p-1">
            <div className="border border-[#d6cebf] bg-[#fdfbf6] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 border-b border-[#d6cebf] pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-[#bdb3a0] bg-[#e7e1d5] text-[#214d76]"><Play className="h-4 w-4 fill-current" /></div>
                  <div><p className="text-sm font-bold text-[#122235]">Veja o SIA em ação</p><p className="mt-0.5 text-xs text-[#697481]">Simule a jornada do cliente</p></div>
                </div>
                <span className="border border-[#c9c0b0] px-2 py-1 text-[10px] font-bold tracking-wide text-[#8b5427]">DEMO</span>
              </div>
              <div className="pt-5">
                <label htmlFor="empresa" className="text-xs font-bold uppercase tracking-[0.1em] text-[#31495f]">Nome da sua empresa</label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="empresa"
                    placeholder="Ex.: Clínica J. Fenix"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleOpenLinkDialog()}
                    className="legacy-field flex-1 px-3 text-sm"
                  />
                  <Button onClick={handleOpenLinkDialog} disabled={!nomeEmpresa.trim() || isSubmitting} className="legacy-button h-12 px-5 font-bold">
                    Testar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#697481]">Você verá exatamente a experiência entregue ao cliente no momento da avaliação.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="beneficios" className="border-b border-[#bdb3a0] bg-[#f1ede3]/75 px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-[#c9c0b0] pb-8 md:grid-cols-[.75fr_1.25fr] md:items-end">
            <p className="eyebrow">Por que usar o SIA</p>
            <h2 className="display-title max-w-2xl text-3xl text-[#122235] sm:text-4xl">Mais clareza para a sua reputação e mais cuidado com a experiência do cliente.</h2>
          </div>
          <div className="grid border-l border-[#c9c0b0] md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="border-b border-r border-[#c9c0b0] bg-[#f8f5ed]/80 p-6 last:md:border-b-0 lg:p-8">
                <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-[0.14em] text-[#8b5427]">{feature.number}</span><feature.icon className="h-5 w-5 text-[#214d76]" /></div>
                <h3 className="mt-12 text-lg font-bold text-[#122235]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5d6872]">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="bg-[#e9e5db]/85 px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-8 border-b border-[#c9c0b0] pb-8"><div><p className="eyebrow">Fluxo de avaliação</p><h2 className="display-title mt-3 text-3xl text-[#122235] sm:text-4xl">Quatro passos. Sem complicação.</h2></div><ShieldCheck className="hidden h-8 w-8 text-[#8b5427] sm:block" /></div>
          <div className="mt-8 overflow-hidden border border-[#bdb3a0] bg-[#bdb3a0]">
            <div className="grid gap-px md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="min-h-52 bg-[#f8f5ed] p-6 lg:p-7">
                  <span className="text-xs font-bold tracking-[0.15em] text-[#8b5427]">ETAPA {step.number}</span>
                  <h3 className="mt-9 text-base font-bold text-[#122235]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5d6872]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ink-shell border-y border-[#122235] px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 border border-[#6c7882] bg-[#122235]/80 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="eyebrow text-[#d6a66a]">Próximo passo</p><h2 className="display-title mt-3 max-w-2xl text-3xl text-[#f5f0e5] sm:text-4xl">Veja como seus clientes vão avaliar.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#c3c8c7]">Faça uma demonstração gratuita e conheça o fluxo completo do SIA antes de começar.</p></div>
          <Button onClick={() => document.querySelector<HTMLInputElement>("#empresa")?.focus()} className="legacy-button h-12 px-6 font-bold">
            Testar gratuitamente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-[#bdb3a0] bg-[#ded8cb] px-5 py-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 text-xs text-[#5d6872] sm:flex-row"><span>© SIA — Sistema Inteligente de Avaliações</span><span>Experiência simples. Feedback útil.</span></div>
      </footer>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="legacy-card max-w-md border-[#bdb3a0] p-0 text-[#122235] sm:rounded-sm">
          <div className="p-6">
            <DialogHeader className="border-b border-[#d6cebf] pb-5">
              <DialogTitle className="flex items-center gap-3 text-xl font-bold"><span className="flex h-8 w-8 items-center justify-center border border-[#bdb3a0] bg-[#e7e1d5] text-[#214d76]"><Link2 className="h-4 w-4" /></span> Link de avaliação</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-5">
              {etapaDialogLink === "inicial" ? (
                <>
                  <p className="text-sm leading-6 text-[#5d6872]">Se você já tem o link de avaliação do Google, informe-o para experimentar o fluxo completo.</p>
                  <Input placeholder="https://g.page/r/..." value={linkAvaliacao} onChange={(e) => setLinkAvaliacao(e.target.value)} className="legacy-field px-3 text-sm" />
                  <Button onClick={() => handleProsseguir(true)} disabled={!linkAvaliacao.trim() || isSubmitting} className="legacy-button h-11 w-full font-bold">Continuar com o link</Button>
                  <button onClick={() => setEtapaDialogLink("pergunta_ajuda")} disabled={isSubmitting} className="w-full border-t border-[#d6cebf] pt-4 text-sm font-semibold text-[#214d76] transition-colors hover:text-[#8b5427]">Não tenho o link agora</button>
                </>
              ) : (
                <>
                  <p className="text-center text-sm font-semibold leading-6 text-[#233d55]">Gostaria de ajuda para encontrar o link da sua empresa no Google?</p>
                  <a
                    href={linkWhatsAppSia("Olá! Vim do site do SIA e gostaria de ajuda para encontrar o link da minha empresa no Google.")}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleProsseguir(false)}
                    className="flex h-11 w-full items-center justify-center gap-2 bg-[#25D366] text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Sim, quero ajuda pelo WhatsApp
                  </a>
                  <Button onClick={() => handleProsseguir(false)} disabled={isSubmitting} variant="outline" className="legacy-button-secondary h-11 w-full font-semibold">Não, seguir sem o link</Button>
                  <button onClick={() => setEtapaDialogLink("inicial")} disabled={isSubmitting} className="w-full border-t border-[#d6cebf] pt-4 text-sm font-medium text-[#5d6872] transition-colors hover:text-[#214d76]">Voltar</button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
