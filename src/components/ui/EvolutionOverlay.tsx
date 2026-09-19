import { SplitTextHeadline } from './SplitTextHeadline';
import { OverlayBody, OverlayKicker } from './overlay';

/**
 * Evolution section overlay — copy and composition.
 *
 * Text aligned right, never covers the chest symbol. A functional edge scrim
 * (`.scrim-r`) keeps paper/dim type legible where the copy passes over the
 * suit's shoulder/arm (first-frame-legibility wave, criterion 3).
 * Safe zones: mobile max 82vw, desktop max 560px.
 * Sticky within the 210vh scroll section for sustained visibility.
 *
 * @see docs/specs/evolution-chest-symbol.md §3
 * @see docs/design/composition-rules.md
 */
export function EvolutionOverlay() {
  return (
    <div className="sticky top-0 z-10 flex h-dvh items-center justify-end p-6 sm:p-12 md:p-16">
      <div
        aria-hidden="true"
        className="scrim-r pointer-events-none absolute inset-y-0 right-0 w-[72%] md:w-[42%]"
      />
      <section
        aria-labelledby="evolution-title"
        className="relative flex max-w-[82vw] flex-col items-end text-right md:max-w-[420px] lg:max-w-[560px]"
      >
        <OverlayKicker>A mudança</OverlayKicker>
        <SplitTextHeadline
          text={'ALGO NELE\nESTÁ MUDANDO.'}
          as="h2"
          id="evolution-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <OverlayBody>
          Anos de noites sem nome cobraram um preço. O que começou como cansaço virou outra coisa —
          algo que nem Peter consegue explicar.
        </OverlayBody>
      </section>
    </div>
  );
}
