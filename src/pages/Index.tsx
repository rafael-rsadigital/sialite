import { useState } from "react";
import { Star, Sparkles, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");

  const handleDemo = () => {
    if (slug.trim()) {
      navigate(`/av/${slug.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            Sistema Inteligente de Avaliações
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up">
            Transforme feedback em
            <span className="text-primary"> crescimento</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up">
            Capture avaliações de clientes de forma inteligente. Direcione elogios para o Google 
            e receba críticas construtivas de forma privada.
          </p>

          {/* Demo Input */}
          <Card className="max-w-md mx-auto shadow-card animate-scale-in">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    /av/
                  </span>
                  <Input
                    placeholder="sua-empresa"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleDemo()}
                  />
                </div>
                <Button onClick={handleDemo} disabled={!slug.trim()}>
                  Testar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card hover:shadow-card-hover transition-shadow group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Avaliações Inteligentes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Direcione automaticamente avaliações 4-5 estrelas para o Google Reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-shadow group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Feedback Privado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receba críticas construtivas via WhatsApp, e-mail ou de forma anônima.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-shadow group">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Dashboard Secreto
                </h3>
                <p className="text-sm text-muted-foreground">
                  Acesse um mural privado com todas as avaliações e estatísticas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Cliente acessa", desc: "Via QR Code ou link" },
              { step: "2", title: "Avalia com estrelas", desc: "Interface simples" },
              { step: "3", title: "Sistema decide", desc: "Baseado na nota" },
              { step: "4", title: "Ação direcionada", desc: "Google ou privado" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm">SIA - Sistema Inteligente de Avaliações</span>
        </div>
      </footer>
    </div>
  );
}
