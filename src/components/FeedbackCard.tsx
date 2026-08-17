import { Mail, Phone, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FeedbackCardProps {
  nota: number;
  comentario: string | null;
  tipo_envio: string;
  created_at: string;
  nomeCliente?: string | null;
  produtoServico?: string | null;
  telefoneCliente?: string | null;
  emailCliente?: string | null;
  solicitouRetorno?: boolean | null;
  solucionado?: boolean | null;
  onToggleSolucionado?: (valor: boolean) => void;
  atualizandoSolucao?: boolean;
  onExcluir?: () => void;
  excluindo?: boolean;
}

function linkWhatsApp(valor: string) {
  const digits = valor.replace(/\D/g, "");
  const numero = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${numero}`;
}

const rotuloTipoEnvio: Record<string, string> = {
  google: "Google",
  whatsapp: "WhatsApp",
  email: "E-mail",
  direto: "Direto",
  anonimo: "Anônimo",
};

export function FeedbackCard({
  nota,
  comentario,
  tipo_envio,
  created_at,
  nomeCliente,
  telefoneCliente,
  emailCliente,
  solicitouRetorno,
  solucionado,
  onToggleSolucionado,
  atualizandoSolucao,
  onExcluir,
  excluindo,
}: FeedbackCardProps) {
  const inicial = (nomeCliente?.trim()?.[0] || "?").toUpperCase();

  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.035] shadow-none transition-colors hover:border-white/[0.18] hover:bg-white/[0.05]">
      <CardContent className="grid gap-0 p-0 sm:grid-cols-[1fr_220px]">
        {/* Coluna principal: nome, estrelas e comentário — no estilo de uma avaliação do Google */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-slate-300">
                {inicial}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{nomeCliente?.trim() || "Cliente anônimo"}</p>
                <div className="mt-1 flex items-center gap-1" aria-label={`${nota} de 5 estrelas`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("h-3.5 w-3.5", star <= nota ? "fill-amber-400 text-amber-400" : "text-slate-700")} />
                  ))}
                </div>
              </div>
            </div>
            <span className="whitespace-nowrap text-xs text-slate-600">
              {format(new Date(created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          {comentario ? (
            <p className="mt-4 text-sm leading-6 text-slate-300">{comentario}</p>
          ) : (
            <p className="mt-4 text-sm italic text-slate-600">Sem comentário.</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={cn(
              "rounded-md border px-2.5 py-1 text-[11px] font-medium",
              tipo_envio === "google" ? "border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300" :
              tipo_envio === "whatsapp" ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300" :
              tipo_envio === "email" ? "border-blue-400/15 bg-blue-400/[0.06] text-blue-300" :
              "border-white/10 bg-white/[0.04] text-slate-500"
            )}>
              {rotuloTipoEnvio[tipo_envio] ?? tipo_envio}
            </span>
            {solicitouRetorno ? (
              <span className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium",
                solucionado ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300" : "border-amber-400/25 bg-amber-400/[0.08] text-amber-300"
              )}>
                {solucionado ? "Retorno solucionado" : "Solicitou retorno"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Coluna lateral: contato e ações — separada por uma borda, como uma "coluna vertical" */}
        <div className="flex flex-col justify-center gap-4 border-t border-white/[0.06] bg-white/[0.02] p-5 sm:border-l sm:border-t-0 sm:p-6">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
              <Phone className="h-3 w-3" /> Celular
            </p>
            {telefoneCliente ? (
              <a href={linkWhatsApp(telefoneCliente)} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-sm text-emerald-300 transition-colors hover:text-emerald-200">
                {telefoneCliente}
              </a>
            ) : (
              <p className="mt-1.5 text-sm text-slate-600">—</p>
            )}
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
              <Mail className="h-3 w-3" /> E-mail
            </p>
            {emailCliente ? (
              <a href={`mailto:${emailCliente}`} className="mt-1.5 block break-all text-sm text-cyan-300 transition-colors hover:text-cyan-200">
                {emailCliente}
              </a>
            ) : (
              <p className="mt-1.5 text-sm text-slate-600">—</p>
            )}
          </div>

          {solicitouRetorno && onToggleSolucionado ? (
            <label className="flex cursor-pointer items-center gap-2 border-t border-white/[0.06] pt-4 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={!!solucionado}
                disabled={atualizandoSolucao}
                onChange={(e) => onToggleSolucionado(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Solucionado
            </label>
          ) : null}

          {onExcluir ? (
            <button
              type="button"
              disabled={excluindo}
              onClick={onExcluir}
              className="flex items-center gap-1.5 border-t border-white/[0.06] pt-4 text-xs font-medium text-[#dc8a8a] transition-colors hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {excluindo ? "Excluindo..." : "Excluir avaliação"}
            </button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
