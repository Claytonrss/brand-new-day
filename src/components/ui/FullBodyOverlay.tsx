import { SplitTextHeadline } from './SplitTextHeadline';

/**
 * FullBody section overlay — final narrative beat.
 *
 * "A Revelação" — the hero without mask or headlines.
 * Text centered per composition-rules.md (FullBody: centralizado).
 * Composition: silhueta forte + título em blocos curtos.
 *
 * @see docs/design/composition-rules.md (§FullBody)
 * @see docs/design/storyboard.md
 */
export function FullBodyOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col items-center justify-end pb-12 pt-6 sm:p-12 md:p-16">
      <section
        aria-labelledby="fullbody-title"
        className="flex max-w-[82vw] flex-col items-center text-center md:max-w-[480px] lg:max-w-[560px]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          A Revelação
        </p>
        <SplitTextHeadline
          text="UM HERÓI QUALQUER."
          as="h2"
          id="fullbody-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
          Sem máscara, sem manchetes. Só um homem tentando fazer o certo em um
          mundo que esqueceu seu nome.
        </p>
      </section>

      {/* CC-BY Attribution */}
      <footer className="mt-8 font-mono text-center text-[10px] uppercase tracking-[0.15em] text-dim/60 sm:mt-12">
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
    </div>
  );
}
