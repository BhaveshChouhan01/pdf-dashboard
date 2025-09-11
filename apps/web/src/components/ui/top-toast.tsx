// components/ui/top-toast.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function TopToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration (default 5 seconds)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map(toast => (
          <TopToast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function TopToast({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  const Icon = icons[toast.variant];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-2 duration-300',
        colors[toast.variant]
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[toast.variant])} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.description && (
            <p className="text-sm mt-1 opacity-90">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useTopToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useTopToast must be used within TopToastProvider');
  }

  return {
    toast: (options: {
      title: string;
      description?: string;
      variant?: 'success' | 'error' | 'info' | 'warning';
      duration?: number;
    }) => {
      context.addToast({
        variant: 'info',
        ...options,
      });
    },
    success: (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'success' });
    },
    error: (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'error' });
    },
    info: (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'info' });
    },
    warning: (title: string, description?: string) => {
      context.addToast({ title, description, variant: 'warning' });
    },
  };
}