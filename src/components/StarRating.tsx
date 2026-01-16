import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export function StarRating({ value, onChange, readonly = false, size = "lg" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
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
              "transition-all duration-150 touch-manipulation",
              !readonly && "cursor-pointer hover:scale-110 active:scale-95",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                isFilled
                  ? "fill-star-filled text-star-filled"
                  : "fill-transparent text-star-empty"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
