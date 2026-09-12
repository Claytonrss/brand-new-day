import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from '../../design/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

interface ChapterCardProps {
  title: string;
  subtitle?: string;
  position: 'before-evolution' | 'before-fullbody';
}

/**
 * ChapterCard — cinematic full-screen chapter transition card.
 *
 * Sits between 3D sections as a solid bg-ink break. The camera repositions
 * behind the card during these scroll sections, creating a "chapter change"
 * effect. Title characters stagger in with premium easing; subtitle fades
 * with a delay.
 *
 * Respects `prefers-reduced-motion` — all elements visible immediately.
 *
 * @see docs/design/design-bible.md
 * @see src/design/motion.ts
 */
export function ChapterCard({ title, subtitle, position }: ChapterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current || !titleRef.current) return;

    const ctx = gsap.context(() => {
      // Card entrance — scale + fade
      gsap.from(cardRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: MOTION.duration.slow / 1000,
        ease: MOTION.ease.decelerate,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Title characters stagger animation
      const chars = titleRef.current!.querySelectorAll('.char');
      gsap.from(chars, {
        opacity: 0,
        y: 50,
        stagger: MOTION.stagger.cinematic / 1000,
        duration: MOTION.duration.base / 1000,
        ease: MOTION.ease.premium,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      // Subtitle fade in with delay
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: MOTION.duration.base / 1000,
          delay: MOTION.duration.fast / 1000,
          ease: MOTION.ease.decelerate,
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    }, cardRef.current);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Split title into individual characters for stagger animation
  // (no permanent `will-change` — see SplitTextHeadline, FALHA-06)
  const titleChars = title.split('').map((char, i) => (
    <span key={i} className="char inline-block">
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div
      ref={cardRef}
      className="relative flex h-dvh items-center justify-center bg-ink"
      data-chapter={position}
    >
      <div className="text-center">
        <h2
          ref={titleRef}
          className="overflow-hidden font-display text-[64px] font-bold leading-[0.9] tracking-tight text-paper sm:text-[96px] lg:text-[128px]"
          aria-label={title}
        >
          <span aria-hidden="true">{titleChars}</span>
        </h2>
        {subtitle && (
          <p
            ref={subtitleRef}
            className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-dim sm:text-base"
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
