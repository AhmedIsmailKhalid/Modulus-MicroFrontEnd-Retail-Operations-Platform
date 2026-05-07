import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

import { cn } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
};

type ToastItemProps = Toast & { onRemove: (id: string) => void };

// ─── Icons ────────────────────────────────────────────────────────────────────

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error:   <XCircle    className="h-5 w-5 text-red-500" />,
  info:    <Info       className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

const containerStyles: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50",
  error:   "border-red-200 bg-red-50",
  info:    "border-blue-200 bg-blue-50",
  warning: "border-yellow-200 bg-yellow-50",
};

// ─── Toast Item ───────────────────────────────────────────────────────────────

function ToastItem({ id, message, variant, duration = 4000, onRemove }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => { onRemove(id); }, duration);
    return () => { clearTimeout(timer); };
  }, [id, duration, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-md",
        "animate-slide-in-up",
        containerStyles[variant],
      )}
    >
      <div className="shrink-0">{icons[variant]}</div>
      <p className="flex-1 text-sm text-gray-800">{message}</p>
      <button
        onClick={() => { onRemove(id); }}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

type ToastContainerProps = {
  toasts: Toast[];
  onRemove: (id: string) => void;
};

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ─── useToast Hook ────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const add = useCallback((message: string, variant: ToastVariant = "info", duration = 4000) => {
    counterRef.current += 1;
    const id = `toast-${String(counterRef.current)}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string) => { add(msg, "success"); }, [add]);
  const error   = useCallback((msg: string) => { add(msg, "error"); }, [add]);
  const info    = useCallback((msg: string) => { add(msg, "info"); }, [add]);
  const warning = useCallback((msg: string) => { add(msg, "warning"); }, [add]);

  return { toasts, remove, success, error, info, warning };
}
