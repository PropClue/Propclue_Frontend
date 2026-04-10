import { useRef, useCallback } from "react";

const useDebounce = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback(
    (callback: (...args: any[]) => void, delay: number) => {
      return (...args: any[]) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      };
    },
    []
  );

  return debounce;
};

export default useDebounce;
