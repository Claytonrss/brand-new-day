import { ModelAttribution } from './ModelAttribution';
import { SplitTextHeadline } from './SplitTextHeadline';
import { OverlayBody, OverlayKicker } from './overlay';

export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col justify-between p-6 sm:p-12 md:p-16">
      {/* Top Header / Metadata */}
      <header className="parallax-mid flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-2 w-2 rounded-full bg-signal shadow-[0_0_8px_#c23b34]"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            Portfolio Showcase
          </span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">Julho de 2026</p>
      </header>

      {/* Hero Copy — Safe zone: Bottom on mobile, Left on desktop */}
      <section
        aria-labelledby="hero-title"
        className="parallax-near max-w-[82vw] md:max-w-[480px] lg:max-w-[560px]"
      >
        <OverlayKicker>Spider-Man: Brand New Day</OverlayKicker>
        <SplitTextHeadline
          text="NINGUÉM SABE."
          as="h1"
          id="hero-title"
          className="mt-2 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[64px] lg:text-[80px]"
        />
        <OverlayBody>
          Quatro anos depois de desaparecer da memória de todos que ama, Peter Parker ainda está lá
          em cima, sozinho, sob a máscara.
        </OverlayBody>
      </section>

      {/* CC-BY Attribution Footer */}
      <footer className="pointer-events-auto mt-8 font-mono text-[10px] uppercase tracking-[0.15em] text-dim/60 sm:mt-12">
        <ModelAttribution />
      </footer>
    </div>
  );
}
