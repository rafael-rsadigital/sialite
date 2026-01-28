import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FeedbackCardProps {
  nota: number;
  comentario: string | null;
  tipo_envio: string;
  created_at: string;
}

export function FeedbackCard({ nota, comentario, tipo_envio, created_at }: FeedbackCardProps) {
  const isPositive = nota >= 4;
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-5 h-5 transition-colors",
                  star <= nota
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-600"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-3 py-1 rounded-full font-medium",
              tipo_envio === "google" 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                : tipo_envio === "whatsapp"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : tipo_envio === "email"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/10 text-slate-400 border border-white/10"
            )}>
              {tipo_envio === "google" ? "Google" 
                : tipo_envio === "whatsapp" ? "WhatsApp" 
                : tipo_envio === "email" ? "E-mail" 
                : "Anônimo"}
            </span>
          </div>
        </div>
        
        {comentario && (
          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            "{comentario}"
          </p>
        )}
        
        <p className="mt-4 text-xs text-slate-500">
          {format(new Date(created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
