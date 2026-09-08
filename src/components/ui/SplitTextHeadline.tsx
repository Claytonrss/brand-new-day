import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextHeadlineProps {
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
 * @see docs/design/design-bible.md
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

  // Split text into individual characters
  const chars = text.split('').map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{ willChange: 'transform' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <Tag
      ref={containerRef}
      id={id}
      className={`${className} overflow-hidden`}
      aria-label={text}
    >
      <span aria-hidden="true">{chars}</span>
    </Tag>
  );
}
