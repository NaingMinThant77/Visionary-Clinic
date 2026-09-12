interface AuthIllustrationProps {
  title: string
  description: string
}

export function AuthIllustration({ title, description }: AuthIllustrationProps) {
  return (
    <div className="relative hidden flex-col justify-center overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground shadow-xl shadow-primary/20 md:flex">
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

      <svg viewBox="0 0 240 200" fill="none" className="relative mx-auto mb-8 h-44 w-56">
        <rect x="18" y="46" width="150" height="100" rx="14" fill="white" fillOpacity="0.14" transform="rotate(-6 18 46)" />
        <rect x="46" y="34" width="150" height="100" rx="14" fill="white" fillOpacity="0.9" />
        <rect x="46" y="34" width="150" height="30" rx="14" fill="white" />
        <circle cx="66" cy="49" r="6" fill="currentColor" opacity="0.35" />
        <rect x="82" y="44" width="60" height="10" rx="5" fill="currentColor" opacity="0.25" />
        <rect x="60" y="80" width="114" height="10" rx="5" fill="currentColor" opacity="0.15" />
        <rect x="60" y="98" width="80" height="10" rx="5" fill="currentColor" opacity="0.15" />
        <circle cx="176" cy="150" r="22" fill="white" />
        <path d="M167 150l6 6 12-12" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <h2 className="relative text-center font-display text-2xl font-bold">{title}</h2>
      <p className="relative mx-auto mt-2 max-w-xs text-center text-sm text-primary-foreground/85">
        {description}
      </p>
    </div>
  )
}
