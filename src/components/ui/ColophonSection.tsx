import { ModelAttribution } from './ModelAttribution';
import { SplitTextHeadline } from './SplitTextHeadline';
import { useMagnetic } from '../../hooks/useMagnetic';

const REPO_URL = 'https://github.com/Claytonrss/brand-new-day';

/**
 * Colophon — the outro that turns the demo into a signed piece.
 *
 * After the FullBody "living poster", the model dissolves into the fog (the
 * section's top gradient lets the residual silhouette fade behind the page)
 * and the frame becomes a quiet editorial page: authorship, stack, the
 * mandatory CC-BY attribution and a single CTA.
 *
 * @see docs/specs/colophon-outro.md
 * @see docs/memory/decisions.md (ADR-019)
 */
export function ColophonSection() {
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  return (
    <section
      aria-labelledby="colophon-title"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 sm:px-12"
    >
      {/* Dissolve: model fades into ink as the section rises into frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,10,12,0.15) 0%, rgba(10,10,12,0.82) 12%, rgba(10,10,12,0.98) 28%, #0a0a0c 45%)',
        }}
      />

      {/* Suit weave — IDEIA-AMB-07: the hero's material becomes the page's paper. */}
      <div aria-hidden="true" className="suit-weave absolute inset-0" />

      <div className="parallax-mid relative z-10 w-full max-w-[82vw] text-center md:max-w-[520px] md:text-left">
        <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-dim md:justify-start">
          <span aria-hidden="true" className="beat-accent-rule" />
          Colofon
        </p>
        <SplitTextHeadline
          text="FEITO À MÃO."
          as="h2"
          id="colophon-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mx-auto mt-4 max-w-[46ch] font-display text-sm leading-[1.6] text-paper/80 sm:text-base md:mx-0">
          Uma cena interativa construída com React Three Fiber, GSAP e um modelo de 66 joints sem um
          único clipe de animação — todo o movimento é procedural.
        </p>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
          React 19 · Three.js · GSAP ScrollTrigger · Lenis · WebGL
        </p>

        <a
          ref={ctaRef}
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="magnetic-cta mt-8 inline-block font-mono text-xs uppercase tracking-[0.2em] text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          ver o código →
        </a>
      </div>

      {/* CC-BY Attribution — required, visible without hover */}
      <footer className="absolute bottom-6 left-1/2 z-10 w-full max-w-[92vw] -translate-x-1/2 px-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-dim/60">
        <ModelAttribution />
      </footer>
    </section>
  );
}
