# CLAUDE.md — contrato operacional do agente

Regras canônicas do repo, importadas na íntegra: @AGENTS.md
Em conflito, `AGENTS.md` vence. Este arquivo não cria regras novas — existe
para você **operar sem tentativa e erro**: como agir, como subir, como testar,
como inspecionar falhas e como navegar na interface. Contexto que não está
aqui mora em `docs/` (índice em AGENTS.md §4).

## 1. Loop operacional (toda tarefa segue este ciclo)

1. **Estado:** leia `AGENTS.md` (contrato) e a Scene Spec relevante antes de
   codar — nunca implemente sem spec (`docs/specs/README.md`).
2. **Subir:** `pnpm env:up` — idempotente; sobe o server **deste checkout** com
   health check e log. Falha [BLOCKED] tem causa impressa; não contorne.
3. **Desenvolver** na branch/worktree corretas (AGENTS.md §5, §10).
4. **Validar:** `pnpm verify` (lint + typecheck + test + build) é o piso.
   Gate de PR: + `pnpm test:smoke` + evidências (AGENTS.md §5.7).
5. **Observar:** `pnpm env:logs -f` enquanto itera. Debug orientado por
   evidência: log/erro real → hipótese → mudança mínima → revalidar. Sem
   evidência, não há "deve funcionar".
6. **Encerrar:** `pnpm env:teardown` ao fim da tarefa (limpa a porta deste
   checkout; `--force` órfãos seus, `--clean` artefatos).

## 2. Ambiente: subir, conferir, derrubar

| Comando             | Quando                                                              |
| ------------------- | ------------------------------------------------------------------- |
| `pnpm env:up`       | quer o app no ar (gerenciado, log em `test-results/logs/`)          |
| `pnpm env:health`   | conferência rápida "está respondendo?" (exit 1 = não)               |
| `pnpm env:logs`     | ler/caçar no log do server (`-f` segue, `-n N` linhas)              |
| `pnpm env:doctor`   | pre-flight **completo** — obrigatório antes de Playwright/evidência |
| `pnpm env:teardown` | fim da tarefa — nunca deixe server órfão seu rodando                |

Regras duras (detalhe em AGENTS.md §10 e `docs/agents/test-isolation.md`):

- Server de **outro checkout** na porta é reportado e **nunca morto** — é
  coordenação, não intervenção.
- Uma suíte Playwright/evidência por máquina; suíte ocupada = esperar, não
  empilhar.
- Rodando em worktree? Ela tem `.env` próprio com porta isolada
  (`pnpm bootstrap`) — todos os comandos acima respeitam isso.

## 3. Testes são o canal de feedback

- Unit (Vitest) valida comportamento; visual (Playwright, projetos
  `mobile-390`/`desktop-1440`) valida o que o usuário vê.
- Falha de teste é informação, não atrito: leia o erro, reproduza, corrija a
  causa — **nunca** enfraqueça um teste ou mude asserção só para passar, salvo
  mudança de comportamento explicitamente decidida e documentada.
- Regras e tiers: AGENTS.md §5, §7 e `.agents/rules/tests-playwright.md`.

## 4. Navegação e UI

- Para observar comportamento visível (fluxos, interações, estados), navegue o
  app no browser em `http://127.0.0.1:$PORT` — inspeção interativa complementa,
  não substitui, o teste automatizado.
- O que valida de verdade é a evidência reprodutível: specs Playwright e os
  coletores `pnpm evidence:visual` / `scripts/collect-*.mjs`
  (inventário: `scripts/README.md`).
- Design é a feature principal (AGENTS.md §7): implementação funcional sem
  impacto visual conferido **não está pronta**.

## 5. Observabilidade — nunca no escuro

- Log do dev server: `test-results/logs/dev-server.log` (`pnpm env:logs`).
- Log por gate do verify: `test-results/logs/<gate>.log` (lint, typecheck,
  test, build).
- Playwright: report em `playwright-report/`, artefatos em `test-results/`.
- Erros de runtime do browser (console/pageerror) aparecem nos specs e
  coletores — procure lá antes de supor comportamento.

## 6. Skills — aceleram a base, não a substituem

Nesta ordem, e só depois do loop operacional acima:

- `spec-driven` — antes de implementar qualquer feature visual/3D.
- `test-isolation` — antes de `test:smoke`, `test:visual`, evidências ou
  qualquer coletor.
- `pr-evidence` — antes de abrir PR (sem evidências o PR não abre).

Se a base operacional (contrato, scripts, testes, logs) não estiver de pé,
pare e consolide-a primeiro — skill em ambiente mal preparado só acelera a
desorganização.

## 7. Limites de ação

Vale integralmente AGENTS.md §11 (ACI): confirmação humana para `rm -rf`,
`push --force`/`reset --hard`, configs de agente e mudança de dependências;
autonomia para editar arquivos, rodar gates e criar branches locais. Nada
neste arquivo amplia ou reduz esses limites.
