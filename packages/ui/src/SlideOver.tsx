import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type SlideOverProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg";
  "data-testid"?: string;
};

const widthStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SlideOver({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
  "data-testid": testId,
}: SlideOverProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        data-testid={testId}
        className={cn(
          "relative ml-auto flex h-full w-full flex-col bg-white shadow-xl",
          "animate-slide-in-right",
          widthStyles[width],
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close panel"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
