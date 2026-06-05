"use client";

function BrownieIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M3 13h18" />
      <path d="M12 7v13" />
    </svg>
  );
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9"  cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9"  r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LoafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19h16" />
      <path d="M5 19v-7a7 7 0 0 1 14 0v7" />
      <path d="M9 12a3 3 0 0 1 6 0" />
    </svg>
  );
}

const CATEGORIES = [
  { value: "Brownies", label: "brownies", Icon: BrownieIcon },
  { value: "Cookies",  label: "cookies",  Icon: CookieIcon },
  { value: "Loaves",   label: "loaves",   Icon: LoafIcon },
];

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function PreferencePicker({ selected, onChange }: Props) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="flex gap-3">
      {CATEGORIES.map(({ value, label, Icon }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={`relative flex-1 flex flex-col items-center gap-3 py-6 border transition-all ${
              active
                ? "border-burgundy bg-burgundy/5"
                : "border-ink/20 hover:border-ink/40"
            }`}
          >
            {active && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-burgundy flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            <Icon className={`w-8 h-8 transition-colors ${active ? "text-burgundy" : "text-ink/40"}`} />
            <span className={`font-inter text-xs tracking-widest uppercase transition-colors ${active ? "text-burgundy" : "text-ink/50"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
