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
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fade-up">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-4 h-4",
                  star <= nota
                    ? "fill-star-filled text-star-filled"
                    : "fill-transparent text-star-empty"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              tipo_envio === "direto" 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {tipo_envio === "direto" ? "Direto" : "Anônimo"}
            </span>
          </div>
        </div>
        
        {comentario && (
          <p className="mt-3 text-foreground/80 text-sm leading-relaxed">
            {comentario}
          </p>
        )}
        
        <p className="mt-3 text-xs text-muted-foreground">
          {format(new Date(created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
