import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let uid = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((text, icon = 'bell', color = 'var(--c500)') => {
    const id = ++uid;
    setToasts((t) => [...t, { id, text, icon, color }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>{children}</ToastContext.Provider>
  );
}