import { AlertTriangle, MessageCircle, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ServicoSuspenso() {
  const whatsappLink = "https://wa.me/5512988052097?text=Ol%C3%A1%2C%20gostaria%20de%20reativar%20meu%20servi%C3%A7o%20SIA.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 max-w-md w-full animate-fade-in">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            Serviço Temporariamente Suspenso
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            O acesso a esta página foi desativado. Entre em contato com a RSA Digital para reativar seu serviço.
          </p>

          <Button
            onClick={() => window.open(whatsappLink, '_blank')}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar com RSA Digital
          </Button>

          <p className="text-slate-500 text-sm mt-4">
            (12) 98805-2097
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-slate-600">
        <Zap className="w-4 h-4 text-amber-400/50" />
        <span className="text-sm">SIA - Sistema Inteligente de Avaliações</span>
      </div>
    </div>
  );
}
