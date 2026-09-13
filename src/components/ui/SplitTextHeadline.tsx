import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextHeadlineProps {
  /** Newlines (`\n`) are intentional line breaks — words never break mid-line. */
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  stagger?: number;
}

/**
 * SplitTextHeadline — cinematic character-by-character reveal.
 *
 * Each character animates from yPercent 110 with premium easing,
 * triggered by ScrollTrigger when the element enters the viewport.
 * Respects `prefers-reduced-motion` — characters are visible immediately.
 *
 * Manual line breaks (`\n`) are rendered as `whitespace-nowrap` blocks, so a
 * title can never break a word in the middle regardless of viewport width.
 * Each break comes from `docs/design/storyboard.md` / `typography.md`.
 *
 * @see docs/design/design-bible.md
 * @see docs/design/typography.md
 * @see src/design/motion.ts
 */
export function SplitTextHeadline({
  text,
  className = '',
  as: Tag = 'h2',
  id,
  stagger = MOTION.stagger.cinematic,
}: SplitTextHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const chars = containerRef.current!.querySelectorAll('.char');

      gsap.from(chars, {
        yPercent: 110,
        opacity: 0,
        duration: MOTION.duration.base / 1000,
        ease: 'power3.out',
        stagger: stagger / 1000,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, [stagger, prefersReducedMotion]);

  // Split text into intentional lines, then into individual characters.
  // No `will-change` on the chars (FALHA-06): the browser promotes layers by
  // heuristics while the transform runs — a permanent hint on ~143 small
  // spans only costs compositor memory.
  const lines = text.split('\n').map((line, lineIndex) => (
    <span key={lineIndex} className="block whitespace-nowrap">
      {line.split('').map((char, i) => (
        <span key={i} className="char inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  ));

  return (
    <Tag
      ref={containerRef}
      id={id}
      className={`${className} velocity-type overflow-hidden`}
      aria-label={text.replace(/\n/g, ' ')}
    >
      <span aria-hidden="true">{lines}</span>
    </Tag>
  );
}
