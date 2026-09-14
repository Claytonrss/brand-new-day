import { ModelAttribution } from './ModelAttribution';

const REPO_URL = 'https://github.com/Claytonrss/brand-new-day';

const SECTIONS = [
  {
    id: 'hero',
    kicker: 'Julho de 2026',
    title: 'Ninguém sabe.',
    body: 'Quatro anos depois de desaparecer da memória de todos que ama, Peter Parker ainda está lá em cima, sozinho, sob a máscara.',
  },
  {
    id: 'evolution',
    kicker: 'A mudança',
    title: 'Algo nele\nestá mudando.',
    body: 'Anos de noites sem nome cobraram um preço. O que começou como cansaço virou outra coisa — algo que nem Peter consegue explicar.',
  },
  {
    id: 'arsenal',
    kicker: 'O que sobrou',
    title: 'Sem apoio.\nSó o essencial.',
    body: 'Sem Stark, sem SHIELD, sem ninguém para ligar. Só o que ele mesmo construiu nos pulsos — e a cidade que continua escolhendo proteger.',
  },
  {
    id: 'fullbody',
    kicker: '31 de julho',
    title: 'Um homem\nsem nome.\nUma cidade\nsem escolha.',
    body: 'SPIDER-MAN: BRAND NEW DAY chega aos cinemas em 31 de julho de 2026.',
  },
] as const;

/**
 * StaticFallback — the WebGL-less version of the piece.
 *
 * Not an error page: an editorial poster. One off-screen render of the real
 * model (`/fallback-poster.png`) plus the same copy as the interactive
 * sections, laid out as a quiet landing. WebGL is mentioned, never warned
 * about.
 *
 * @see docs/specs/webgl-static-fallback.md
 * @see docs/memory/decisions.md (ADR-020)
 */
export function StaticFallback() {
  return (
    <main className="relative w-full bg-ink text-paper">
      <section className="relative flex min-h-dvh items-end overflow-hidden">
        <picture>
          <source media="(max-width: 767px)" srcSet="/fallback-poster-mobile.png" />
          <img
            src="/fallback-poster-desktop.png"
            alt="Spider-Man, corpo inteiro, iluminado contra o fundo escuro"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,12,0.2) 0%, rgba(10,10,12,0.1) 35%, rgba(10,10,12,0.85) 78%, #0a0a0c 100%)',
          }}
        />
        <div className="parallax-far relative z-10 w-full px-6 pb-16 sm:px-12 md:px-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
            uma peça de portfólio
          </p>
          <h1 className="mt-3 font-display text-[44px] font-bold leading-[0.98] tracking-[-0.03em] text-paper sm:text-[64px] lg:text-[80px]">
            SPIDER-MAN:
            <br />
            BRAND NEW DAY
          </h1>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          aria-label={section.id}
          className="mx-auto flex min-h-[80vh] max-w-[640px] flex-col justify-center px-6 py-24 sm:px-12"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
            {section.kicker}
          </p>
          <h2 className="mt-3 whitespace-pre-line font-display text-[32px] font-bold leading-[1.02] tracking-[-0.03em] text-paper sm:text-[48px]">
            {section.title}
          </h2>
          <p className="mt-5 max-w-[52ch] font-display text-base leading-[1.6] text-paper/80 sm:text-lg">
            {section.body}
          </p>
        </section>
      ))}

      <footer className="mx-auto max-w-[640px] px-6 pb-16 sm:px-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          a versão interativa requer WebGL
        </p>
        <ModelAttribution className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.15em] text-dim" />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dim/40 underline-offset-2 transition-colors hover:text-paper/80"
          >
            ver o código →
          </a>
        </p>
      </footer>
    </main>
  );
}
