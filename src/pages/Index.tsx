import { useState } from "react";
import { ArrowRight, BarChart3, Check, Link2, MessageSquare, Play, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const features = [
  { icon: Star, title: "Mais avaliações positivas", desc: "Facilite o caminho para que clientes satisfeitos publiquem sua experiência no Google." },
  { icon: MessageSquare, title: "Feedback que chega até você", desc: "Quando a experiência não foi boa, o cliente encontra um canal privado para falar com a empresa." },
  { icon: BarChart3, title: "Tudo em um só lugar", desc: "Acompanhe notas, comentários e origem dos feedbacks em um painel simples." },
];

const steps = [
  { number: "01", title: "Cliente acessa", desc: "Por QR Code ou link exclusivo da empresa." },
  { number: "02", title: "Escolhe uma nota", desc: "Uma experiência rápida, clara e amigável no celular." },
  { number: "03", title: "SIA direciona", desc: "O próximo passo muda de acordo com a avaliação." },
  { number: "04", title: "Você acompanha", desc: "Os feedbacks ficam organizados no seu painel." },
];

export default function Index() {
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [linkAvaliacao, setLinkAvaliacao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const handleOpenLinkDialog = () => {
    if (!nomeEmpresa.trim()) return;
    setShowLinkDialog(true);
  };

  const handleProsseguir = async (comLink: boolean) => {
    setIsSubmitting(true);
    try {
      await supabase.from("leads_teste").insert({
        nome_empresa: nomeEmpresa.trim(),
        link_avaliacao: comLink && linkAvaliacao.trim() ? linkAvaliacao.trim() : null,
      });
    } catch {
      // O teste continua mesmo se o registro do lead falhar.
    }
    setShowLinkDialog(false);
    navigate(`/av/demo?nome=${encodeURIComponent(nomeEmpresa.trim())}`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-400/20">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-12rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg shadow-cyan-500/10"><Zap className="h-4 w-4 fill-current" /></div>
          <span className="text-base font-semibold tracking-tight">SIA</span>
        </div>
        <span className="hidden text-sm text-slate-500 sm:block">Sistema Inteligente de Avaliações</span>
      </nav>

      <section className="relative z-10 px-5 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300"><Sparkles className="h-3.5 w-3.5 text-cyan-400" />Gestão inteligente de avaliações</div>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">Transforme a experiência do cliente em <span className="text-cyan-400">reputação.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">O SIA organiza o caminho entre a opinião do cliente, o Google e o feedback privado — de forma simples para sua empresa e natural para quem avalia.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Teste gratuito</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Sem cartão</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Feito para celular</span>
            </div>
          </div>

          <Card className="relative overflow-hidden border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="border-b border-white/10 px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400"><Play className="h-4 w-4 fill-current" /></div><div><p className="text-sm font-semibold text-white">Veja o SIA em ação</p><p className="mt-0.5 text-xs text-slate-500">Leva menos de um minuto</p></div></div></div>
            <CardContent className="p-6">
              <label htmlFor="empresa" className="text-sm font-medium text-slate-300">Nome da sua empresa</label>
              <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
                <Input id="empresa" placeholder="Ex.: Clínica Reali" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleOpenLinkDialog()} className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:border-cyan-400/50 focus-visible:ring-cyan-400/10" />
                <Button onClick={handleOpenLinkDialog} disabled={!nomeEmpresa.trim() || isSubmitting} className="h-12 shrink-0 bg-cyan-400 px-5 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-40">Testar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Você verá exatamente a experiência que seu cliente teria ao avaliar.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/[0.07] bg-white/[0.018] px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl"><div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Por que usar o SIA</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Uma experiência melhor para sua reputação.</h2></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{features.map((feature) => <Card key={feature.title} className="border-white/10 bg-white/[0.035] shadow-none transition-colors hover:border-white/20 hover:bg-white/[0.055]"><CardContent className="p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-400"><feature.icon className="h-5 w-5" /></div><h3 className="mt-5 text-base font-semibold text-white">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc}</p></CardContent></Card>)}</div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 lg:px-8"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Como funciona</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Quatro passos. Sem complicação.</h2></div><ShieldCheck className="hidden h-7 w-7 text-slate-700 md:block" /></div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">{steps.map((step) => <div key={step.number} className="bg-slate-950 p-6 lg:p-7"><span className="text-xs font-semibold tracking-widest text-slate-600">{step.number}</span><h3 className="mt-8 text-sm font-semibold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p></div>)}</div>
      </div></section>

      <section className="relative z-10 px-5 pb-20 lg:px-8"><div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.05] p-8 text-center sm:p-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Comece agora</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Veja como seus clientes vão avaliar.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">Faça uma demonstração gratuita e conheça o fluxo completo do SIA.</p><Button onClick={() => document.querySelector<HTMLInputElement>("#empresa")?.focus()} className="mt-7 h-11 bg-white px-6 font-semibold text-slate-950 hover:bg-slate-100">Testar gratuitamente <ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>

      <footer className="relative z-10 border-t border-white/[0.07] px-5 py-7 lg:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-slate-600"><span>© SIA — Sistema Inteligente de Avaliações</span><span>Experiência simples. Feedback útil.</span></div></footer>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}><DialogContent className="border-white/10 bg-slate-950 text-white shadow-2xl sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><Link2 className="h-5 w-5 text-cyan-400" />Link de avaliação</DialogTitle></DialogHeader><div className="space-y-5 pt-2"><p className="text-sm leading-6 text-slate-400">Se você já tem o link de avaliação do Google, coloque aqui para experimentar o fluxo completo.</p><Input placeholder="https://g.page/r/..." value={linkAvaliacao} onChange={(e) => setLinkAvaliacao(e.target.value)} className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus-visible:border-cyan-400/50" /><Button onClick={() => handleProsseguir(true)} disabled={!linkAvaliacao.trim() || isSubmitting} className="h-11 w-full bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">Continuar com o link</Button><button onClick={() => handleProsseguir(false)} disabled={isSubmitting} className="w-full py-2 text-sm text-slate-500 transition-colors hover:text-slate-300">Não tenho o link agora</button></div></DialogContent></Dialog>
    </main>
  );
}
