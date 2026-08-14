import { useState } from "react";
import { ArrowRight, BarChart3, Check, Link2, MessageSquare, Play, ShieldCheck, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const features = [
  { icon: Star, title: "Mais avaliações positivas", desc: "Facilite o caminho para clientes satisfeitos compartilharem sua experiência no Google." },
  { icon: MessageSquare, title: "Feedback direto para a empresa", desc: "Quando a experiência não foi boa, o cliente encontra um canal privado para falar com você." },
  { icon: BarChart3, title: "Acompanhamento simples", desc: "Veja notas, comentários e origem dos feedbacks em um único painel." },
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

  const handleOpenLinkDialog = () => {
    if (nomeEmpresa.trim()) setShowLinkDialog(true);
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
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/20">
      <header className="border-b border-white/10 bg-slate-950">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight">SIA</span>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:block">Sistema Inteligente de Avaliações</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">Reputação e feedback</span>
        </nav>
      </header>

      <section className="border-b border-white/10 bg-slate-950 px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
              <span className="h-1.5 w-1.5 bg-blue-400" /> Gestão de avaliações
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[58px]">Transforme a experiência do cliente em <span className="text-blue-400">reputação.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">O SIA organiza o caminho entre a opinião do cliente, o Google e o feedback privado — de forma simples para sua empresa e natural para quem avalia.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Teste gratuito</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Sem cartão</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />Feito para celular</span>
            </div>
          </div>

          <Card className="rounded-md border-slate-700 bg-slate-900 shadow-2xl shadow-black/30">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600/15 text-blue-400"><Play className="h-4 w-4 fill-current" /></div>
                <div><p className="text-sm font-semibold text-white">Veja o SIA em ação</p><p className="mt-0.5 text-xs text-slate-500">Faça uma demonstração gratuita</p></div>
              </div>
            </div>
            <CardContent className="p-6">
              <label htmlFor="empresa" className="text-sm font-semibold text-slate-300">Nome da sua empresa</label>
              <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
                <Input id="empresa" placeholder="Ex.: Clínica Reali" value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleOpenLinkDialog()} className="h-12 rounded-md border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/20" />
                <Button onClick={handleOpenLinkDialog} disabled={!nomeEmpresa.trim() || isSubmitting} className="h-12 rounded-md bg-blue-600 px-5 font-semibold text-white hover:bg-blue-500 disabled:opacity-40">Testar <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Você verá a experiência que seu cliente teria ao avaliar.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-5 py-20 text-slate-900 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Por que usar o SIA</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Uma experiência melhor para sua reputação.</h2></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => <Card key={feature.title} className="rounded-md border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"><CardContent className="p-6"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700"><feature.icon className="h-5 w-5" /></div><h3 className="mt-5 text-base font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc}</p></CardContent></Card>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 text-slate-900 lg:px-8"><div className="mx-auto max-w-6xl"><div className="flex items-end justify-between gap-8"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Como funciona</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Quatro passos. Sem complicação.</h2></div><ShieldCheck className="hidden h-7 w-7 text-slate-300 md:block" /></div><div className="mt-10 grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 md:grid-cols-4">{steps.map((step) => <div key={step.number} className="bg-white p-6 lg:p-7"><span className="text-xs font-bold tracking-widest text-blue-700">{step.number}</span><h3 className="mt-8 text-sm font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p></div>)}</div></div></section>

      <section className="border-t border-slate-800 bg-slate-950 px-5 py-20 lg:px-8"><div className="mx-auto max-w-4xl border border-slate-800 bg-slate-900 p-8 text-center sm:p-12"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400">Comece agora</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Veja como seus clientes vão avaliar.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">Faça uma demonstração gratuita e conheça o fluxo completo do SIA.</p><Button onClick={() => document.querySelector<HTMLInputElement>("#empresa")?.focus()} className="mt-7 h-11 rounded-md bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500">Testar gratuitamente <ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>

      <footer className="border-t border-white/10 bg-slate-950 px-5 py-7 lg:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-xs text-slate-600"><span>© SIA — Sistema Inteligente de Avaliações</span><span className="hidden sm:block">Experiência simples. Feedback útil.</span></div></footer>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}><DialogContent className="rounded-md border-slate-700 bg-slate-900 text-white shadow-2xl sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><Link2 className="h-5 w-5 text-blue-400" />Link de avaliação</DialogTitle></DialogHeader><div className="space-y-5 pt-2"><p className="text-sm leading-6 text-slate-400">Se você já tem o link de avaliação do Google, coloque aqui para experimentar o fluxo completo.</p><Input placeholder="https://g.page/r/..." value={linkAvaliacao} onChange={(e) => setLinkAvaliacao(e.target.value)} className="h-12 rounded-md border-slate-700 bg-slate-950 text-white placeholder:text-slate-600 focus-visible:border-blue-500" /><Button onClick={() => handleProsseguir(true)} disabled={!linkAvaliacao.trim() || isSubmitting} className="h-11 w-full rounded-md bg-blue-600 font-semibold text-white hover:bg-blue-500">Continuar com o link</Button><button onClick={() => handleProsseguir(false)} disabled={isSubmitting} className="w-full py-2 text-sm text-slate-500 transition-colors hover:text-slate-300">Não tenho o link agora</button></div></DialogContent></Dialog>
    </main>
  );
}
