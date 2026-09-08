import { SplitTextHeadline } from './SplitTextHeadline';

/**
 * Arsenal section overlay — copy and composition.
 *
 * Text aligned left, never covers the launcher/wrist.
 * Safe zones: mobile max 82vw min margin 24px, desktop max 560px.
 * Sticky within the 150vh scroll section for sustained visibility.
 *
 * @see docs/specs/arsenal-web-shooters.md §3
 * @see docs/design/composition-rules.md
 */
export function ArsenalOverlay() {
  return (
    <div className="sticky top-0 z-10 flex h-dvh items-center justify-start p-6 sm:p-12 md:p-16">
      <section
        aria-labelledby="arsenal-title"
        className="flex max-w-[82vw] flex-col items-start text-left md:max-w-[420px] lg:max-w-[560px]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          O que sobrou
        </p>
        <SplitTextHeadline
          text="SEM APOIO. SÓ O ESSENCIAL."
          as="h2"
          id="arsenal-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
          Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele mesmo
          construiu nos pulsos — e a cidade que continua escolhendo proteger.
        </p>

        {/* CC-BY Attribution */}
        <footer className="mt-8 font-mono text-[10px] uppercase tracking-[0.15em] text-dim/60 sm:mt-12">
          <p>
            Modelo 3D &quot;Spider-Man Brand New Day&quot; por{' '}
            <a
              href="https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dim/40 underline-offset-2 transition-colors hover:text-paper/80"
            >
              Eskze
            </a>
            , licenciado sob CC-BY 4.0
          </p>
        </footer>
      </section>
    </div>
  );
}
