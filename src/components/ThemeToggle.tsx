import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
        <div className="w-9 h-5 rounded-full bg-border" />
      </div>
    );
  }

  const isDark = theme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors overflow-hidden group"
      aria-label="Cambiar tema"
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        >
          <span className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full bg-primary/20 animate-ripple" />
        </span>
      ))}

      <Sun className={`h-4 w-4 transition-all ${isDark ? 'rotate-90 scale-0 text-muted-foreground' : 'rotate-0 scale-100 text-amber-500'}`} />

      <div className="relative w-9 h-5 rounded-full bg-border transition-colors">
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow-sm transition-all duration-300 ease-in-out ${
            isDark ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>

      <Moon className={`h-4 w-4 transition-all ${isDark ? 'rotate-0 scale-100 text-blue-400' : '-rotate-90 scale-0 text-muted-foreground'}`} />
    </button>
  );
}
