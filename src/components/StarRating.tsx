import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function StarRating({ value, onChange, readonly = false, size = "lg" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="rating-control flex items-center gap-2" role="radiogroup" aria-label="Escolha uma nota de 1 a 5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
            aria-checked={value === star}
            role="radio"
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onTouchStart={() => !readonly && setHovered(star)}
            onTouchEnd={() => {
              if (!readonly) {
                onChange(star);
                setHovered(0);
              }
            }}
            className={cn(
              "rating-star-button touch-manipulation",
              !readonly && "cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <span aria-hidden="true" className={cn(sizeClasses[size], "rating-star", isFilled && "is-active")} />
          </button>
        );
      })}
    </div>
  );
}
