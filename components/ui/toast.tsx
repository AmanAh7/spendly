"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastProps = {
  message: string | null;
  variant: "success" | "error";
  onDismiss: () => void;
};

export function Toast({ message, variant, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message || variant !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onDismiss();
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, onDismiss, variant]);

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          key={`${variant}-${message}`}
          initial={{ opacity: 0, x: 24, y: -12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 24, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role={variant === "error" ? "alert" : "status"}
          aria-live={variant === "error" ? "assertive" : "polite"}
          className={`fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:right-6 sm:top-6 ${
            variant === "error"
              ? "border-destructive/30 bg-destructive/15 text-destructive"
              : "border-success/30 bg-success/15 text-success"
          }`}
        >
          {variant === "error" ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-background/30 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
