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
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.004 3C9.106 3 3.5 8.605 3.5 15.5c0 2.385.665 4.615 1.82 6.516L3 29l7.148-2.276A12.44 12.44 0 0016.004 28C22.9 28 28.5 22.395 28.5 15.5S22.9 3 16.004 3zm0 22.727a10.19 10.19 0 01-5.334-1.494l-.383-.228-4.243 1.352 1.376-4.128-.25-.4a10.16 10.16 0 01-1.616-5.5C5.554 9.833 10.286 5.1 16.004 5.1c2.751 0 5.338 1.073 7.284 3.021a10.222 10.222 0 013.012 7.29c0 5.718-4.733 10.317-10.296 10.317v-.001zm5.633-7.677c-.309-.155-1.827-.902-2.11-1.005-.283-.103-.489-.155-.695.155-.206.31-.798 1.005-.978 1.212-.18.206-.36.232-.669.078-.309-.155-1.305-.481-2.485-1.534-.918-.819-1.539-1.83-1.72-2.14-.18-.31-.02-.477.135-.631.139-.138.31-.361.464-.542.155-.18.206-.31.31-.516.103-.206.052-.387-.026-.542-.077-.155-.695-1.678-.953-2.298-.251-.602-.506-.52-.695-.53-.18-.008-.386-.01-.592-.01-.206 0-.542.077-.825.387-.283.31-1.083 1.058-1.083 2.581 0 1.523 1.108 2.995 1.263 3.202.155.206 2.183 3.334 5.29 4.675.739.319 1.315.51 1.765.652.742.236 1.417.203 1.951.123.595-.089 1.827-.747 2.085-1.469.257-.723.257-1.343.18-1.47-.077-.128-.283-.206-.593-.361z" />
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
        className="whatsapp-fab fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105"
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
