import { ModelAttribution } from './ModelAttribution';
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
 * the bottom so the four-line title never crosses the chest symbol.
 *
 * @see docs/design/composition-rules.md (§FullBody)
 * @see docs/design/storyboard.md
 * @see docs/memory/decisions.md (ADR-017)
 */
export function FullBodyOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex min-h-dvh flex-col items-center justify-end pb-10 pt-6 sm:p-12 md:p-16">
      <section
        aria-labelledby="fullbody-title"
        className="flex max-w-[82vw] flex-col items-center text-center md:max-w-[480px] lg:max-w-[560px]"
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

      {/* CC-BY Attribution */}
      <footer className="mt-6 font-mono text-center text-[10px] uppercase tracking-[0.15em] text-dim/60 sm:mt-12">
        <ModelAttribution />
      </footer>
    </div>
  );
}
