import { useState, useRef, useEffect } from "react";
import { LuInfo } from "react-icons/lu";

export function InfoTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)} // desktop hover
      onMouseLeave={() => setOpen(false)}
    >
      <LuInfo
        className="w-4 h-4 text-primary cursor-pointer"
        onClick={() => setOpen((v) => !v)} // mobile tap
      />

      {open && (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 z-50 w-60 rounded-lg border bg-popover p-3 text-xs shadow-lg">
          <p className="font-medium mb-1">What this means</p>
          <p className="text-muted-foreground">
            Compare future price trends across different Dubai neighborhoods.
          </p>

          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t"></div>
        </div>
      )}
    </div>
  );
}
