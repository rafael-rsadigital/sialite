import { useState } from "react";
import { Star, Sparkles, ArrowRight, Shield, Zap, BarChart3, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const navigate = useNavigate();
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDemo = async () => {
    if (!nomeEmpresa.trim()) return;
    
    setIsSubmitting(true);
    
    // Salvar lead de teste
    try {
      await supabase.from("leads_teste").insert({
        nome_empresa: nomeEmpresa.trim(),
      });
    } catch {
      // Continua mesmo se falhar
    }
    
    // Redirecionar para modo demo
    navigate(`/av/demo?nome=${encodeURIComponent(nomeEmpresa.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4">
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Sistema Inteligente de Avaliações
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight animate-fade-in leading-tight">
            Transforme feedback em
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              crescimento real
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed">
            Capture avaliações de clientes de forma inteligente. Direcione elogios para o Google 
            e receba críticas de forma privada.
          </p>

          {/* Demo Card */}
          <Card className="max-w-lg mx-auto bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 animate-fade-in">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-4">
                Digite o nome da sua empresa e veja o sistema em ação:
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Nome da sua empresa"
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-cyan-400/20 transition-all duration-300"
                    onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                  />
                </div>
                <Button 
                  onClick={handleDemo} 
                  disabled={!nomeEmpresa.trim() || isSubmitting}
                  className="h-14 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-slate-500 text-sm animate-fade-in">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Sem cartão de crédito
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Grátis para testar
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Star,
                title: "Avaliações Inteligentes",
                desc: "Direcione automaticamente avaliações 4-5 estrelas para o Google Reviews.",
                gradient: "from-amber-400 to-orange-500",
                glow: "shadow-amber-500/20"
              },
              {
                icon: Shield,
                title: "Feedback Privado",
                desc: "Receba críticas construtivas via WhatsApp, e-mail ou de forma anônima.",
                gradient: "from-emerald-400 to-cyan-500",
                glow: "shadow-emerald-500/20"
              },
              {
                icon: BarChart3,
                title: "Dashboard Secreto",
                desc: "Acesse um mural privado com todas as avaliações e estatísticas.",
                gradient: "from-violet-400 to-purple-500",
                glow: "shadow-violet-500/20"
              }
            ].map((feature, i) => (
              <Card 
                key={i} 
                className={`group bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 shadow-xl ${feature.glow}`}
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-white mb-4">
            Como Funciona
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Um fluxo simples e eficiente que transforma cada avaliação em oportunidade
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Cliente acessa", desc: "Via QR Code ou link direto" },
              { step: "2", title: "Avalia com estrelas", desc: "Interface simples e intuitiva" },
              { step: "3", title: "Sistema decide", desc: "Roteamento baseado na nota" },
              { step: "4", title: "Ação direcionada", desc: "Google ou feedback privado" },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center font-bold mb-4 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-slate-400 mb-8">
              Experimente agora mesmo e veja como o SIA pode transformar suas avaliações
            </p>
            <Button 
              onClick={() => document.querySelector('input')?.focus()}
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Testar Gratuitamente
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-white/5">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm">SIA - Sistema Inteligente de Avaliações</span>
        </div>
      </footer>
    </div>
  );
}
