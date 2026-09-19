const MODEL_URL =
  'https://sketchfab.com/3d-models/spider-man-brand-new-day-ff9df30377094808ba9df7c82cb09cda';
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

const LINK_CLASS =
  'pointer-events-auto underline decoration-dim/40 underline-offset-2 transition-colors hover:text-paper/80';

/**
 * CC-BY 4.0 attribution — required by the license §3(a) (title of work +
 * copyright notice + creator + source + license URI + indication of
 * modifications) and mandatory in every section that shows the model, visible
 * without hover. Typography (mono, 10px, uppercase, dim) is inherited from the
 * wrapping footer; pass `className` only when the site owns the type itself.
 *
 * Responsive length: below `md` the title and modification note collapse
 * visually (kept for screen readers) so the credit fits one line as fixed
 * chrome; creator, source link and license stay always visible.
 *
 * The link accessible names ("Eskze", "CC BY 4.0") are contract —
 * tests/visual/credits.spec.ts matches them by exact name.
 *
 * @see docs/specs/first-frame-legibility.md §11 (criterion 2)
 * @see NOTICE.md
 */
export function ModelAttribution({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      <span className="max-md:hidden">Modelo 3D "Spider-Man Brand New Day" · © </span>
      <span className="md:hidden">© </span>
      <a href={MODEL_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        Eskze
      </a>
      {' · '}
      <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        CC BY 4.0
      </a>
      <span className="max-md:hidden">{' · convertido e otimizado a partir do original'}</span>
    </p>
  );
}
