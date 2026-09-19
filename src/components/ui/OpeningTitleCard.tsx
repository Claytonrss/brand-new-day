import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { SplitTextHeadline } from './SplitTextHeadline';
import { MOTION } from '@/design/motion';
import { SECTION_SPANS } from '@/components/3d/beat/sections';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * OpeningTitleCard — Beat 0, the breath before the mask.
 *
 * A ~100vh typographic trailer card that sits between the preloader and the
 * Hero. It carries no 3D of its own: the camera already holds the static Hero
 * keyframe behind the card, and a vertical ink gradient keeps the title zone
 * opaque while letting the lower frame go translucent — the mask ghosts into
 * the first fold, so the page opens on presence, not on an empty card
 * (Design Bible, promessa da primeira dobra; criterion 1). The landing spring
 * keeps the model held high until the Hero enters (`LandingTrigger`, intact).
 * Scrolling lifts the copy out and "hands over" to the Hero.
 *
 * The title reuses `SplitTextHeadline`, which triggers on mount (the card is at
 * the top of the page, already inside the scroll trigger's range).
 *
 * @see docs/specs/opening-title-card.md
 * @see docs/specs/first-frame-legibility.md §11
 * @see docs/design/design-bible.md
 */

/** Title zone stays opaque; the frame's lower third lets the mask through. */
const CARD_GRADIENT =
  'linear-gradient(to bottom, rgba(10,10,12,0.96) 0%, rgba(10,10,12,0.94) 55%, rgba(10,10,12,0.8) 76%, rgba(10,10,12,0.55) 100%)';

export function OpeningTitleCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion || !cardRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Hand-over: the copy lifts and fades as the Hero takes the frame.
      gsap.to(contentRef.current, {
        yPercent: -22,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // The scroll hint goes first, once the scroll has clearly started.
      if (hintRef.current) {
        gsap.to(hintRef.current, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top top',
            end: '25% top',
            scrub: true,
          },
        });
      }
    }, cardRef.current);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ height: `${SECTION_SPANS.opening}dvh`, background: CARD_GRADIENT }}
      data-opening="title-card"
    >
      {/* Suit weave — IDEIA-AMB-07: the hero's material under the title card. */}
      <div aria-hidden="true" className="suit-weave absolute inset-0" />
      <div ref={contentRef} className="relative flex flex-col items-center text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          uma peça de portfólio
        </p>
        <SplitTextHeadline
          text={'SPIDER-MAN:\nBRAND NEW DAY'}
          as="h2"
          id="opening-title"
          stagger={MOTION.stagger.base}
          className="mt-4 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[64px] lg:text-[96px]"
        />
      </div>

      <p
        ref={hintRef}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-dim"
      >
        role
      </p>
    </div>
  );
}
