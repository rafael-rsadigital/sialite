import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Acesso() {
  const [chave, setChave] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleAcessar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chave.trim()) {
      setErro("Digite sua chave de acesso");
      return;
    }

    setLoading(true);
    setErro("");

    const { data, error } = await supabase
      .from("empresas")
      .select("hash_secreto")
      .eq("hash_secreto", chave.trim())
      .single();

    if (error || !data) {
      setErro("Chave inválida ou não encontrada");
      setLoading(false);
      return;
    }

    navigate(`/dashboard/${data.hash_secreto}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden p-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
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
        <CardContent className="p-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Área do Cliente
            </span>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-6">
            <KeyRound className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Acesse seu Mural
          </h1>
          <p className="text-slate-400 mb-8">
            Digite sua chave de acesso para visualizar seus feedbacks
          </p>

          <form onSubmit={handleAcessar} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Digite sua Chave de Acesso"
                value={chave}
                onChange={(e) => {
                  setChave(e.target.value);
                  setErro("");
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all duration-300"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Acessar Mural
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
