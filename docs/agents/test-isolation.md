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

| Comando                                | Comportamento na porta 5173                                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                             | Sobe o Vite em 5173 (ou em `PORT`, ver §10)                                                                              |
| `pnpm test:smoke` / `pnpm test:visual` | Sobe `pnpm dev` na porta alvo **só se ela estiver livre**; senão **reusa** o que estiver lá (`reuseExistingServer: !CI`) |
| `pnpm evidence:visual`                 | **Não sobe servidor** — captura `localhost:5173` (`BASE_URL`/`PORT` configuráveis)                                       |
| `scripts/collect-*.mjs`                | Idem; alguns aceitam a URL como `argv[2]`                                                                                |
| `pnpm preview`                         | Porta **4173** (build pronto); usada em capturas manuais                                                                 |

Tudo honra `PORT` (default 5173) — ver §10.

## 3. Regra de ouro

> Antes de qualquer comando que toque a 5173, confirme que o código servido vem
> **do mesmo checkout em que você está rodando**.

Pre-flight (barato, 2 segundos) — automatizado por **`pnpm env:doctor`** (ver §11),
que sai com exit 1 quando algo bloqueia:

```bash
pnpm env:doctor

# Fallback manual:
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
2. Rode **`pnpm bootstrap`** dentro da worktree — instala dependências, cria o
   `.env` com a porta isolada da worktree (§10) e abre o VS Code na pasta.
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

- Rode **`pnpm env:teardown`**: para o server `dev`/`preview` **deste** checkout —
  só avança sobre processos cujo cwd é deste checkout (ver §11).
  `pnpm env:teardown --force` inclui órfãos de playwright/chromium deste checkout;
  `--clean` remove `dist/`, `test-results/` e `playwright-report/` (o `.env`
  fica — é a identidade de porta, §10).
- Remova worktrees de rascunho (`git worktree remove <path>`); mantenha a da
  branch em andamento.
- Deixe a porta do checkout livre por padrão: o estado "nenhum server rodando"
  é o único que garante que o próximo agent testa o próprio código.

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

## 10. Porta por worktree (`PORT`)

Vite, Playwright e todos os scripts de evidência honram `PORT` (default
**5173**). Com uma porta única por worktree, o cenário do incidente (server
alheio na 5173) deixa de existir: a sua suíte nunca olha a porta de outro
checkout.

- **Checkout principal:** mantenha o default — `pnpm dev` na 5173.
- **Worktrees:** rode **`pnpm bootstrap`** ao criar a worktree — o setup cria o
  `.env` da worktree com uma porta determinística e livre (faixa 5174+, hash do
  caminho) e abre o VS Code na pasta. Depois disso, todos os comandos saem
  falando na porta do `.env` **sem flags**:

  ```bash
  pnpm dev               # sobe na porta do .env
  pnpm test:smoke        # testa na porta do .env
  pnpm evidence:visual   # fotografa a porta do .env
  ```

- Sem `.env` (ou para forçar outra porta), o env explícito vence:
  `PORT=5200 pnpm test:smoke`.
- Pre-flight vira "checar **a sua** porta": `lsof -nP -iTCP:5200 -sTCP:LISTEN`.
- A regra de contaminação (§3/§6) continua valendo **para a porta que você
  usar** — portas diferentes só isolam se forem realmente únicas.

## 11. Automatização: `pnpm env:doctor` e `pnpm env:teardown`

As checagens manuais deste runbook (§3 pre-flight, §7 limpeza, §9.2
capacidade/órfãos) viraram scripts executáveis (2026-09-14, inspirados no ciclo
`init`/`check`/`down` de templates de bootstrap para agentes): a checagem deixa
de ser prosa que o agent interpreta e vira um **gate com exit code**.

> **Atenção ao nome:** é `pnpm env:doctor`, **não** `pnpm doctor` — `doctor` é
> comando embutido do pnpm e roda silenciosamente no lugar do nosso script.

| Comando                     | O que faz                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm env:doctor`           | Diagnóstico read-only: dono da porta + cwd, health HTTP, suíte Playwright ativa **na máquina**, Chromium órfão, load vs núcleos. Exit 1 = bloqueado.                 |
| `pnpm env:doctor --fix`     | Repara **este** checkout: mata server degradado e órfãos seus e, se a porta estiver livre, sobe um dev server com health check (`test-results/logs/dev-server.log`). |
| `pnpm env:teardown`         | Stop gracioso: mata só o processo da porta cujo cwd é deste checkout. De outro checkout → reporta e **não toca** (§3).                                               |
| `pnpm env:teardown --force` | + órfãos de playwright/chromium **escopados por cwd** deste checkout.                                                                                                |
| `pnpm env:teardown --clean` | + remove `dist/`, `test-results/`, `playwright-report/`. `.env` preservado (identidade de porta, §10).                                                               |

Gates automáticos: `pnpm test:smoke`, `pnpm test:visual` e
`pnpm evidence:visual` rodam o `doctor` antes de abrir qualquer browser e
abortam com a razão se bloqueado. Fluxo típico de evidência:

```bash
pnpm env:doctor --fix     # garante server deste checkout saudável na porta do .env
pnpm evidence:visual  # fotografa (só roda se o doctor passou)
pnpm env:teardown         # higiene de fim de tarefa (§7)
```

Invariantes que os scripts preservam (não podem regredir):

1. **Nunca matam processo de outro checkout** — classificam pelo cwd
   (`lsof -p <PID> -d cwd`); sem dono identificável, tratam como alheio.
2. **`doctor --fix` não repara nada enquanto há suíte ativa na máquina** —
   suíte rodando é bloqueio (§9.1, "aguarde"), não alvo de repair.
3. **A porta vem do `.env`** (§10) — mesmo contrato de `pnpm dev` e suítes.
4. Exit 1 do `doctor` significa: **não rode** Playwright/evidência agora.

Os comandos manuais das seções acima continuam valendo como fallback (CI
minimalista ou debug do próprio doctor).
