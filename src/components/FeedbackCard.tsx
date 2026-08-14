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
  return (
    <Card className="border-white/10 bg-white/[0.035] shadow-none transition-colors hover:border-white/[0.18] hover:bg-white/[0.05]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-label={`${nota} de 5 estrelas`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={cn("h-4 w-4", star <= nota ? "fill-amber-400 text-amber-400" : "text-slate-700")} />
            ))}
            <span className="ml-2 text-xs font-medium text-slate-500">{nota}/5</span>
          </div>
          <span className={cn(
            "rounded-md border px-2.5 py-1 text-[11px] font-medium",
            tipo_envio === "google" ? "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300" :
            tipo_envio === "whatsapp" ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300" :
            tipo_envio === "email" ? "border-blue-400/15 bg-blue-400/[0.06] text-blue-300" :
            "border-white/10 bg-white/[0.04] text-slate-500"
          )}>
            {tipo_envio === "google" ? "Google" : tipo_envio === "whatsapp" ? "WhatsApp" : tipo_envio === "email" ? "E-mail" : "Anônimo"}
          </span>
        </div>

        {comentario ? (
          <p className="mt-5 text-sm leading-6 text-slate-300">“{comentario}”</p>
        ) : (
          <p className="mt-5 text-sm italic text-slate-600">Sem comentário.</p>
        )}

        <p className="mt-5 border-t border-white/[0.06] pt-4 text-xs text-slate-600">
          {format(new Date(created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
