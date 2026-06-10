import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactElement;
  open?: boolean;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', action }: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++toastCount}`;
    setToasts((prev) => [...prev, { id, title, description, variant, action, open: true }]);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
