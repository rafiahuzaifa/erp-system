import { create } from 'zustand';

let toastId = 0;

const useToastStore = create((set) => ({
  toasts: [],

  addToast: (type, message, duration = 4000) => {
    const id = ++toastId;
    set(state => ({
      toasts: [...state.toasts, { id, type, message }]
    }));
    if (duration > 0) {
      setTimeout(() => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },

  success: (message) => useToastStore.getState().addToast('success', message),
  error: (message) => useToastStore.getState().addToast('error', message, 6000),
  warning: (message) => useToastStore.getState().addToast('warning', message),
  info: (message) => useToastStore.getState().addToast('info', message),
}));

export default useToastStore;
