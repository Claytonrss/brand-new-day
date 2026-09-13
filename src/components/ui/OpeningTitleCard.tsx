import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitTextHeadline } from './SplitTextHeadline';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

/**
 * OpeningTitleCard — Beat 0, the breath before the mask.
 *
 * A ~100vh typographic trailer card that sits between the preloader and the
 * Hero. It carries no 3D of its own: the camera already holds the static Hero
 * keyframe behind a solid `ink` card, so the first 3D frame (the mask) lands
 * only after this silence. Scrolling lifts the copy out and "hands over" to the
 * Hero.
 *
 * The title reuses `SplitTextHeadline`, which triggers on mount (the card is at
 * the top of the page, already inside the scroll trigger's range).
 *
 * @see docs/specs/opening-title-card.md
 * @see docs/design/design-bible.md
 */
export function OpeningTitleCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

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
      className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-ink px-6"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-dim/70"
      >
        role
      </p>
    </div>
  );
}
