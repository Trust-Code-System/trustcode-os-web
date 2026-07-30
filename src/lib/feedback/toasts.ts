export type ToastTone = "success" | "error";
export type ToastEvent = { id: number; tone: ToastTone; title: string; message?: string };

type ToastListener = (toast: ToastEvent) => void;

const listeners = new Set<ToastListener>();
let nextId = 1;

export function showToast(input: Omit<ToastEvent, "id">) {
  const toast = { ...input, id: nextId++ };
  listeners.forEach((listener) => listener(toast));
  return toast.id;
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
