export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col justify-between p-6 sm:p-12 md:p-16">
      {/* Top Header / Metadata */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_8px_#c23b34]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            Portfolio Showcase
          </span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
          Julho de 2026
        </p>
      </header>

      {/* Hero Copy — Safe zone: Bottom on mobile, Left on desktop */}
      <div className="max-w-[82vw] md:max-w-[480px] lg:max-w-[560px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          Spider-Man: Brand New Day
        </p>
        <h1 className="mt-2 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[64px] lg:text-[80px]">
          NINGUÊM SABE.
        </h1>
        <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
          Quatro anos depois de desaparecer da memória de todos que ama, Peter Parker ainda está lá
          em cima, sozinho, sob a máscara.
        </p>
      </div>
    </div>
  );
}
