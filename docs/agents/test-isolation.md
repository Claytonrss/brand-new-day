# Runbook: Isolamento de ambiente para agents rodarem testes

**Autoria:** feat/arsenal-click-reveal follow-up
**Data:** 2026-09-13
**Audiência:** agents (e humanos) rodando Playwright, evidências visuais ou dev
servers neste repo — especialmente em múltiplos checkouts/worktrees na mesma
máquina.

## 1. Por que este runbook existe

Em 2026-09-13, uma suite de testes da worktree `feat/arsenal-click-reveal`
falhou de forma aparentemente inexplicável: `data-testid` recém-adicionado
"não existia" na página. A causa real: um **dev server de outro checkout**
(`brand-new-day`, raiz) estava ocupando a porta **5173**, e o Playwright está
configurado com `reuseExistingServer: !process.env.CI` — ou seja, **localmente
ele reusa qualquer servidor que já responda na porta, de qualquer checkout**.
Os testes rodaram contra código estranho, silenciosamente.

A mesma armadilha vale para as evidências visuais: `pnpm evidence:visual` e os
scripts `scripts/collect-*.mjs` **não sobem servidor** — eles fotografam o que
estiver servido em `localhost:5173`, venha de onde vier.

## 2. Quem usa a porta 5173

| Comando                                | Comportamento na porta 5173                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                             | Sobe o Vite em 5173                                                                                                    |
| `pnpm test:smoke` / `pnpm test:visual` | Sobe `pnpm dev` em 5173 **só se a porta estiver livre**; senão **reusa** o que estiver lá (`reuseExistingServer: !CI`) |
| `pnpm evidence:visual`                 | **Não sobe servidor** — captura `localhost:5173` (`BASE_URL` configurável)                                             |
| `scripts/collect-*.mjs`                | Idem; alguns aceitam a URL como `argv[2]`                                                                              |
| `pnpm preview`                         | Porta **4173** (build pronto); usada em capturas manuais                                                               |

## 3. Regra de ouro

> Antes de qualquer comando que toque a 5173, confirme que o código servido vem
> **do mesmo checkout em que você está rodando**.

Pre-flight (barato, 2 segundos):

```bash
# 1) A porta está ocupada?
lsof -nP -iTCP:5173 -sTCP:LISTEN

# 2) Se houver PID: de qual diretório esse servidor serve?
lsof -p <PID> | grep cwd
```

Decisão:

- **Porta livre** → pode rodar. O Playwright subirá o server do **seu** checkout.
- **Ocupada por um processo do seu checkout** → ok (é o server que você subiu).
- **Ocupada por outro checkout/worktree do repo** → **não rode**. É um processo
  órfão de outro agent/sessão? Mate (`kill <PID>` — dev server é trivialmente
  reiniciável) e siga. É o server de trabalho do usuário com sessão aberta?
  **Não mate sozinho** — coordene antes.

## 4. Worktrees: isolamento de código

1. Crie a worktree a partir da main: `git worktree add -b <branch> <caminho> origin/main`.
2. Rode `pnpm install` **dentro da worktree** (store global do pnpm torna isso rápido).
3. Todos os comandos (`verify`, `test:smoke`, evidências) rodam **a partir da
   worktree** — nunca de outro checkout "por conveniência".
4. `git worktree list` mostra worktrees esquecidas; `git worktree remove <caminho>`
   limpa as de rascunho.

## 5. O que pode rodar em paralelo

| Seguro em paralelo                           | Precisa de exclusão mútua (porta 5173)           |
| -------------------------------------------- | ------------------------------------------------ |
| `pnpm test` (Vitest unit)                    | `pnpm dev`                                       |
| `pnpm typecheck`, `pnpm lint`                | `pnpm test:smoke` / `pnpm test:visual`           |
| `pnpm build` (cada checkout tem seu `dist/`) | `pnpm evidence:visual` / `scripts/collect-*.mjs` |
| `pnpm inspect:glb`                           | `pnpm exec playwright screenshot ...`            |

Dois agents em worktrees diferentes **não** devem rodar suites Playwright ao
mesmo tempo sem coordenar a porta: o segundo reusaria o server do primeiro. E
mesmo em portas diferentes há o custo de máquina — ver §9.

## 6. Sintomas de contaminação

Se aparecer algum destes, **checar a 5173 vem antes de debugar código**:

- `element(s) not found` para `data-testid`/seletores que existem no **seu** código.
- Snapshot de página (error-context) mostrando features de **outra** branch
  (ex.: overlays que só existem no WIP de outro checkout).
- Suite passando em testes que você não tocou e falhando exatamente nos que você
  escreveu — ou o inverso.
- "Seu" fix não muda nada no comportamento dos testes, mesmo com rebuild.

## 7. Limpeza (higiene de fim de tarefa)

- Mate os servers `dev`/`preview` **que você subiu**.
- Remova worktrees de rascunho (`git worktree remove <path>`); mantenha a da
  branch em andamento.
- Deixe o `5173` livre por padrão: o estado "nenhum server rodando" é o único
  que garante que o próximo agent testa o próprio código.

## 8. CI

No CI (`process.env.CI`), `reuseExistingServer` é `false` e cada job tem
ambiente próprio — o risco descrito aqui é **exclusivamente local**. Por isso
suíte que passa no CI pode falhar localmente (e vice-versa) quando há server
estranho na porta: o CI não é o sintoma, a máquina compartilhada é.

## 9. Capacidade da máquina: processos Playwright e concorrência

Playwright aqui é **pesado por construção**: cada worker sobe um Chromium com
renderização WebGL por software (SwiftShader), carrega um GLB de dezenas de MB
e roda com timeout de 240s. Com `workers: 3` (local), uma suíte profunda pode
consumir todos os núcleos por 10+ minutos. Duas suítes simultâneas = máquina
travada para todo mundo, inclusive para o usuário.

### 9.1 Limite

> **Uma (1) suíte Playwright por máquina, por vez.** Vale para `test:smoke`,
> `test:visual`, `evidence:visual` e `collect-*.mjs` — cada um abre os próprios
> browsers. O limite é **global na máquina**, não por checkout/worktree.

Não aumente `--workers` (o config já limita: 3 local, 2 CI). Em máquina
modesta, reduza: `pnpm test:visual --workers=2`.

### 9.2 Pre-flight: já existe Playwright rodando?

```bash
pgrep -fl "playwright" | head -10        # runners e processos utilitários
ps aux | grep -ic "[c]hromium"           # browsers vivos (contagem)
uptime                                   # load average — compare com hw.ncpu
memory_pressure | head -1                # % livre de memória (macOS)
```

- **Nada rodando e máquina folgada** (load < núcleos) → pode iniciar.
- **Suíte em andamento (de você ou de outro agent)** → **aguarde**, não empilhe
  (ver 9.3).
- **Processos Chromium/Playwright órfãos** (ninguém rodando suíte, mas há
  browsers vivos e load alta) → sobra de run morto: `pkill -f playwright` e
  `pkill -if chromium` **limitados aos PIDs que você confirmou serem órfãos** —
  nunca um `pkill` largo sem olhar a lista.

### 9.3 Esperar a liberação (poll com timeout)

Se houver suíte rodando, espere em vez de iniciar outra — poll de 30s, teto de
15 min:

```bash
for i in $(seq 1 30); do
  pgrep -f "playwright test" >/dev/null || break
  sleep 30
done

if pgrep -f "playwright test" >/dev/null; then
  echo "PLAYWRIGHT BUSY: suíte de outro agent ainda em execução após 15 min."
  # Reporte ao usuário / devolva a tarefa. NÃO inicie a sua em cima.
fi
```

O mesmo vale para evidências (`collect-*.mjs`) — elas abrem Chromium também.

### 9.4 Sintomas de saturação

- Suíte que normalmente leva 1 min levando 5×+ isso (timeouts em cascata, tests
  `slow()` estourando 240s).
- `uptime` com load muito acima dos núcleos durante/antes do run.
- Testes aleatórios falhando com timeout sem motivo de código — pode ser outra
  suíte comendo a máquina em paralelo, não flakiness.
