import { useCallback, useRef, useState } from "react";

/**
 * Hook toast dùng chung cho toàn app (login, doctor, admin...).
 * showToast("message", isDanger?)
 */
export function useToast() {
  const [toast, setToast] = useState({ show: false, message: "", danger: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, danger = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, message, danger });
    timerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2500);
  }, []);

  return { toast, showToast };
}
