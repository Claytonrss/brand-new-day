import { SplitTextHeadline } from './SplitTextHeadline';
import { OverlayBody, OverlayKicker } from './overlay';
import { MOTION } from '@/design/motion';

/**
 * FullBody section overlay — final narrative beat.
 *
 * "A Revelação" — the hero without mask or headlines. Copy follows
 * `docs/design/storyboard.md` (ADR-017): title in four short blocks, the
 * premiere date as the kicker and body.
 * Text centered per composition-rules.md (FullBody: centralizado), anchored to
 * the bottom third with a legibility scrim so the title never crosses the
 * chest symbol (first-frame-legibility wave, criterion 3).
 *
 * @see docs/design/composition-rules.md (§FullBody)
 * @see docs/design/storyboard.md
 * @see docs/memory/decisions.md (ADR-017)
 */
export function FullBodyOverlay() {
  return (
    <div className="sticky top-0 z-10 flex h-dvh flex-col items-center justify-end p-6 pb-14 sm:p-12 sm:pb-10 md:p-16">
      {/* Legibility scrim — the title zone stays readable over the legs. */}
      <div
        aria-hidden="true"
        className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
      />
      <section
        aria-labelledby="fullbody-title"
        className="relative flex max-w-[82vw] flex-col items-center text-center md:max-w-[480px] lg:max-w-[560px]"
      >
        <OverlayKicker>31 de julho</OverlayKicker>
        <SplitTextHeadline
          text={'UM HOMEM\nSEM NOME.\nUMA CIDADE\nSEM ESCOLHA.'}
          as="h2"
          id="fullbody-title"
          stagger={MOTION.stagger.base}
          className="mt-2 font-display text-[32px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[40px] lg:text-[64px]"
        />
        <OverlayBody>
          SPIDER-MAN: BRAND NEW DAY chega aos cinemas em 31 de julho de 2026.
        </OverlayBody>
      </section>
    </div>
  );
}
