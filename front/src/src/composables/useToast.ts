/**
 * Composable para usar Toast notifications
 * Substitui os alert() por notificações mais elegantes
 */

// Event bus simples para toasts
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastEvent {
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastEventBus {
  private listeners: Array<(event: ToastEvent) => void> = [];

  on(callback: (event: ToastEvent) => void) {
    this.listeners.push(callback);
  }

  off(callback: (event: ToastEvent) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  emit(event: ToastEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

const toastBus = new ToastEventBus();

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    toastBus.emit({ message, type, duration });
  };

  const success = (message: string, duration?: number) => {
    show(message, 'success', duration);
  };

  const error = (message: string, duration?: number) => {
    show(message, 'error', duration);
  };

  const warning = (message: string, duration?: number) => {
    show(message, 'warning', duration);
  };

  const info = (message: string, duration?: number) => {
    show(message, 'info', duration);
  };

  return {
    show,
    success,
    error,
    warning,
    info,
    // Expor o bus para o componente Toast
    _bus: toastBus
  };
}
