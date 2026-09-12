import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitTextHeadline } from './SplitTextHeadline';
import { useMediaQuery } from '../../hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

/** Technical annotation copy (docs/specs/arsenal-macro-hud.md §2). */
const HUD_LABELS = [
  { id: 'shooter', text: 'web-shooter · mk.ii' },
  { id: 'cartridge', text: 'cartucho de teia · pressurizado' },
  { id: 'trigger', text: 'gatilho · duplo toque' },
  { id: 'handmade', text: 'construído à mão' },
] as const;

function smoothstep(x: number, a: number, b: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Arsenal section overlay — narrative copy, then a technical macro HUD.
 *
 * Text aligned left, never covers the launcher/wrist (P0.1). As the camera
 * pushes into the web-shooter (macro, P2a), the narrative copy recedes and a
 * thin engineering HUD takes over: call-out hairlines on desktop, a bottom
 * legend on mobile. The CC-BY attribution stays visible the whole time.
 *
 * The HUD is a fixed layer (the canvas is fixed too); a single ScrollTrigger on
 * the Arsenal section drives both opacities from its progress, so it never
 * depends on sticky/overflow behaviour.
 *
 * @see docs/specs/arsenal-web-shooters.md §3
 * @see docs/specs/arsenal-macro-hud.md
 * @see docs/design/composition-rules.md
 */
export function ArsenalOverlay() {
  const copyRef = useRef<HTMLElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const section = document.querySelector('#arsenal-section');
    const copy = copyRef.current;
    const hud = hudRef.current;
    if (!section || !hud) return;

    const apply = (progress: number) => {
      if (reduceMotion) {
        // Snap to the macro: signature reads without motion.
        const macro = progress > 0.5 ? 1 : 0;
        if (copy) copy.style.opacity = String(1 - macro);
        hud.style.opacity = String(macro);
        return;
      }
      const copyOpacity = 1 - smoothstep(progress, 0.28, 0.44);
      const hudOpacity = smoothstep(progress, 0.42, 0.6);
      if (copy) copy.style.opacity = String(copyOpacity);
      hud.style.opacity = String(hudOpacity);
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => apply(self.progress),
      onLeave: () => {
        hud.style.opacity = '0';
      },
      onLeaveBack: () => {
        hud.style.opacity = '0';
      },
    });

    apply(0);
    return () => trigger.kill();
  }, [reduceMotion]);

  return (
    <div className="sticky top-0 z-10 flex h-dvh items-end justify-start p-6 pb-16 sm:p-12 sm:pb-16 md:items-center md:p-16">
      <section
        ref={copyRef}
        aria-labelledby="arsenal-title"
        className="flex max-w-[82vw] flex-col items-start text-left md:max-w-[420px] lg:max-w-[560px]"
      >
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
          <span aria-hidden="true" className="beat-accent-rule" />
          O que sobrou
        </p>
        <SplitTextHeadline
          text={'SEM APOIO.\nSÓ O ESSENCIAL.'}
          as="h2"
          id="arsenal-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mt-4 font-display text-sm leading-[1.55] text-paper/80 sm:text-base md:text-lg">
          Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele mesmo
          construiu nos pulsos — e a cidade que continua escolhendo proteger.
        </p>
      </section>

      {/* Technical HUD — fixed layer, driven by Arsenal scroll progress */}
      <div
        ref={hudRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-20 opacity-0"
      >
        {/* Desktop: hairline call-outs in the margins */}
        <div className="parallax-mid relative hidden h-full w-full md:block">
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g className="hud-hairline" strokeWidth="1" opacity="0.55" fill="none">
              <line x1="74%" y1="16%" x2="54%" y2="48%" />
              <line x1="78%" y1="44%" x2="58%" y2="52%" />
              <line x1="72%" y1="60%" x2="55%" y2="58%" />
              <line x1="22%" y1="37%" x2="46%" y2="52%" />
            </g>
            <g fill="#e9e5da">
              <circle cx="54%" cy="48%" r="2" />
              <circle cx="58%" cy="52%" r="2" />
              <circle cx="55%" cy="58%" r="2" />
              <circle cx="46%" cy="52%" r="2" />
            </g>
          </svg>

          <span className="absolute left-[74%] top-[13%] font-mono text-[10px] uppercase tracking-[0.18em] text-paper/80">
            {HUD_LABELS[0].text}
          </span>
          <span className="absolute left-[78%] top-[41%] font-mono text-[10px] uppercase tracking-[0.18em] text-paper/80">
            {HUD_LABELS[1].text}
          </span>
          <span className="absolute left-[72%] top-[57%] font-mono text-[10px] uppercase tracking-[0.18em] text-paper/80">
            {HUD_LABELS[2].text}
          </span>
          <span className="absolute left-[22%] top-[34%] font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
            {HUD_LABELS[3].text}
          </span>
        </div>

        {/* Mobile: compact bottom legend + markers */}
        <div className="parallax-far absolute inset-x-0 bottom-0 md:hidden">
          <div className="beat-accent-border-soft mx-auto flex max-w-[82vw] flex-col gap-1.5 border-t pt-4 pb-4">
            {HUD_LABELS.map((label, index) => (
              <div key={label.id} className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    index === HUD_LABELS.length - 1 ? 'bg-signal' : 'bg-paper/60'
                  }`}
                />
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
                    index === HUD_LABELS.length - 1 ? 'text-signal' : 'text-paper/70'
                  }`}
                >
                  {label.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CC-BY attribution — never fades, never hidden by the macro transition */}
      <footer className="absolute bottom-6 left-6 right-6 z-10 font-mono text-[10px] uppercase tracking-[0.15em] text-dim/60 sm:bottom-10 sm:left-12 md:left-16">
        <p>
          Modelo 3D &quot;Spider-Man Brand New Day&quot; por{' '}
          <a
            href="https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto underline decoration-dim/40 underline-offset-2 transition-colors hover:text-paper/80"
          >
            Eskze
          </a>
          , licenciado sob CC-BY 4.0
        </p>
      </footer>
    </div>
  );
}
