const MODEL_URL =
  'https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

const LINK_CLASS =
  'pointer-events-auto underline decoration-dim/40 underline-offset-2 transition-colors hover:text-paper/80';

/**
 * CC-BY 4.0 attribution — required by the license (creator + source + license
 * URI) and mandatory in every section that shows the model, visible without
 * hover. Typography (mono, 10px, uppercase, dim) is inherited from the
 * wrapping footer; pass `className` only when the site owns the type itself.
 *
 * @see docs/specs/colophon-outro.md
 */
export function ModelAttribution({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      Modelo 3D por{' '}
      <a href={MODEL_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        Eskze
      </a>
      {' · '}
      <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        CC BY 4.0
      </a>
    </p>
  );
}
