"use client";

import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  dismissing: boolean;
}

let toastId = 0;
let addToastFn: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export function showToast(message: string, type: ToastType = "success", duration: number = 3000) {
  addToastFn?.(message, type, duration);
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-lime-200",
  error: "bg-red-200",
  info: "bg-cyan-200",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success", duration: number = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, dismissing: false }]);
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-3rem)] max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={classNames(
            "border-2 border-black px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all duration-300",
            toast.dismissing
              ? "opacity-0 translate-y-4"
              : "animate-slide-up opacity-100 translate-y-0",
            typeStyles[toast.type],
          )}
          onClick={() => dismissToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
