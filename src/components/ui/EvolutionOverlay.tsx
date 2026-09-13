import { SplitTextHeadline } from './SplitTextHeadline';

/**
 * Evolution section overlay — copy and composition.
 *
 * Text aligned right, never covers the chest symbol.
 * Safe zones: mobile max 82vw, desktop max 560px.
 * Sticky within the 150vh scroll section for sustained visibility.
 *
 * @see docs/specs/evolution-chest-symbol.md §3
 * @see docs/design/composition-rules.md
 */
export function EvolutionOverlay() {
  return (
    <div className="sticky top-0 z-10 flex h-dvh items-center justify-end p-6 sm:p-12 md:p-16">
      <section
        aria-labelledby="evolution-title"
        className="flex max-w-[82vw] flex-col items-end text-right md:max-w-[420px] lg:max-w-[560px]"
      >
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          <span aria-hidden="true" className="beat-accent-rule" />A mudança
        </p>
        <SplitTextHeadline
          text={'ALGO NELE\nESTÁ MUDANDO.'}
          as="h2"
          id="evolution-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
          Anos de noites sem nome cobraram um preço. O que começou como cansaço virou outra coisa —
          algo que nem Peter consegue explicar.
        </p>
      </section>
    </div>
  );
}
