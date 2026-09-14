import { ModelAttribution } from './ModelAttribution';
import { SplitTextHeadline } from './SplitTextHeadline';
import { useMagnetic } from '@/hooks/useMagnetic';
import { SECTION_SPANS } from '@/components/3d/beat/sections';

const REPO_URL = 'https://github.com/Claytonrss/brand-new-day';
const LINKEDIN_URL = 'https://www.linkedin.com/in/clayton-rafael/';

/** Craft arguments the portfolio is selling — mono list under the body copy. */
const CHALLENGES = [
  'Rig procedural com molas, respiração e spider-sense em runtime',
  'Câmera Catmull-Rom sincronizada com 7 beats de narrativa',
  'Três tiers de performance sem corte visual brusco',
  '6,5 MB de GLB · 66 joints · zero janks em mobile mid-range',
] as const;

/**
 * Colophon — the outro that turns the demo into a signed piece.
 *
 * After the FullBody "living poster", the model dissolves into the fog (the
 * section's top gradient lets the residual silhouette fade behind the page)
 * and the frame becomes a quiet editorial page: authorship first (kicker
 * names the author), the craft argument, the mandatory CC-BY attribution and
 * a two-weight CTA — GitHub primary, LinkedIn clearly subordinate
 * (colophon-outro.md §2: a second destination never matches the primary's
 * weight).
 *
 * @see docs/specs/colophon-outro.md
 * @see docs/memory/decisions.md (ADR-019)
 */
export function ColophonSection() {
  const ctaRef = useMagnetic<HTMLAnchorElement>();

  return (
    <section
      aria-labelledby="colophon-title"
      className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 sm:px-12"
      style={{ minHeight: `${SECTION_SPANS.colophon}dvh` }}
    >
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
          Portfólio — Clayton R.
        </p>
        <SplitTextHeadline
          text="FEITO À MÃO."
          as="h2"
          id="colophon-title"
          className="mt-2 font-display text-[36px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[64px]"
        />
        <p className="mx-auto mt-4 max-w-[46ch] font-display text-sm leading-[1.6] text-paper/80 sm:text-base md:mx-0">
          Um personagem icônico como pretexto para resolver problemas verdadeiros: rig procedural
          sem clipes, câmera scroll-driven com Catmull-Rom e degradação adaptativa por tier de
          hardware.
        </p>
        <p className="mx-auto mt-3 max-w-[46ch] font-display text-sm leading-[1.6] text-paper/80 sm:text-base md:mx-0">
          66 joints, zero animações pré-gravadas. Todo o movimento é gerado em runtime — a página
          inteira é um argumento em código.
        </p>

        <ul className="mx-auto mt-6 flex w-fit flex-col gap-1.5 text-left font-mono text-[11px] leading-relaxed text-dim md:mx-0">
          {CHALLENGES.map((challenge) => (
            <li key={challenge} className="flex gap-2">
              <span aria-hidden="true" className="text-signal/60">
                ·
              </span>
              <span>{challenge}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
          React 19 · Three.js · GSAP ScrollTrigger · Lenis · WebGL
        </p>

        <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 md:justify-start">
          <a
            ref={ctaRef}
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-cta inline-block font-mono text-xs uppercase tracking-[0.2em] text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            ver o código →
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-[0.2em] text-dim underline decoration-dim/40 underline-offset-4 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            Clayton no LinkedIn →
          </a>
        </div>
      </div>

      {/* CC-BY Attribution + fan-work disclaimer — required, visible without hover */}
      <footer className="absolute bottom-6 left-1/2 z-10 w-full max-w-[92vw] -translate-x-1/2 space-y-1 px-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
        <ModelAttribution />
        <p>
          Projeto fan-made, sem fins comerciais — sem afiliação ou endosso da Marvel/Sony/Disney.
        </p>
      </footer>
    </section>
  );
}
