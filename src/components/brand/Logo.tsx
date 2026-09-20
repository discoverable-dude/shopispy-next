// ShopiSpy brand mark — "Markdown Scope": a magnifying glass framing a price
// tag, because the product's job is spotting price moves, not just "spying."
//
// Built as inline SVG (crisp at every size, no raster scaling) using the same
// CSS variables as the rest of the site (--primary, --accent), so it themes
// automatically with the existing `.dark` class toggle — no useTheme/mounted
// dance required, unlike the PNG components it replaces.

interface LogoMarkProps {
  className?: string;
  size?: number;
}

export function LogoMark({ className, size = 28 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="42"
        cy="42"
        r="24"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="7"
      />
      <line
        x1="60"
        y1="60"
        x2="78"
        y2="78"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 34 34 L 46 34 L 54 42 L 42 54 L 34 46 Z"
        fill="hsl(var(--accent))"
      />
      <circle cx="38" cy="38" r="2.6" fill="hsl(var(--background))" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  markSize?: number;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}

export function Logo({ className, markSize = 28, wordmarkClassName, showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <LogoMark size={markSize} />
      {showWordmark && (
        <span className={`font-sans text-xl font-extrabold tracking-tight text-foreground ${wordmarkClassName || ""}`}>
          ShopiSpy
        </span>
      )}
    </span>
  );
}
