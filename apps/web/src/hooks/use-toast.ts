// hooks/use-toast.ts
"use client"

import { useTopToast } from '@/components/ui/top-toast'

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "info" | "warning"
  duration?: number
}

export function useToast() {
  const topToast = useTopToast();

  const toast = ({ title, description, variant = "default", duration }: ToastOptions) => {
    const message = title || "Notification";
    
    switch (variant) {
      case "destructive":
        topToast.error(message, description);
        break;
      case "success":
        topToast.success(message, description);
        break;
      case "warning":
        topToast.warning(message, description);
        break;
      case "info":
        topToast.info(message, description);
        break;
      default:
        topToast.info(message, description);
        break;
    }
  };

  return { 
    toast,
    success: topToast.success,
    error: topToast.error,
    info: topToast.info,
    warning: topToast.warning
  };
}