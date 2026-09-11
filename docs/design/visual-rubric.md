# Rubrica Visual

> Rubrica objetiva para reduzir subjetividade na aprovação estética. Cada item
> recebe nota de 1 a 5. A tabela preenchida entra no relatório de verify e no PR.

> **Nota de evidência (2026-09-10):** a nota 5.0/5.0 registrada nas waves 1–4
> foi **autoatribuída, sem evidência humana** — a captura real em
> `docs/evidence/portfolio-audit/` (24 screenshots, 3 viewports) **não**
> atingia 4 nos bloqueantes "integração texto/personagem" e "composição mobile"
> (copy cobrindo o lançador no Arsenal e o peito no FullBody).
>
> **Re-preenchida na Wave P0** contra a captura `docs/evidence/portfolio-audit-p0/`
> (24 screenshots novos, mesmos 3 viewports e mesmos 8 pontos de scroll, gerados
> por `scripts/collect-portfolio-audit.mjs`). Os bloqueantes passam a ≥ 4.
> Limitação honesta: **FPS em dispositivo real continua não medido** (Fase 7.3);
> a nota de "performance percebida mobile" é inferida do `budget.spec.ts`
> (draw calls ≤ 48, sem recompilação de shader), não de medição em hardware.
>
> **Atualizada em P1a/P1b (2026-09-10):** "sensação cinematográfica/editorial" e
> "originalidade de portfólio" sobem para 5 com loader teaser, opening title card
> e colofon autoral (evidências `docs/evidence/{loader-teaser,opening-title-card,colophon-outro}/`).
> Média ponderada **4,4**.

## Escala

| Nota | Significado |
|---|---|
| 1 | fraco, genérico, parece template ou demo técnica |
| 2 | funcional, mas sem presença visual |
| 3 | aceitável, porém ainda comum |
| 4 | forte, intencional, digno de portfólio |
| 5 | memorável, com identidade clara e execução refinada |

## Critérios e pesos

| Critério | Peso | Nota mínima |
|---|---:|---:|
| Primeira dobra / impacto imediato | 3 | 4 |
| Composição mobile | 3 | 4 |
| Integração texto + personagem | 3 | 4 |
| Iluminação e silhueta | 2 | 4 |
| Tipografia e hierarquia | 2 | 4 |
| Ritmo de scroll e câmera | 2 | 4 |
| Sensação cinematográfica/editorial | 2 | 4 |
| Originalidade de portfólio | 2 | 4 |
| Performance percebida mobile | 3 | 4 |
| Motion reduzida ainda bonita | 1 | 3 |

## Regras de aprovação

1. **Bloqueantes:** primeira dobra, composição mobile e integração
   texto/personagem abaixo de 4 → não vai para PR.
2. **Média ponderada < 4** → volta para Look Dev ou Scene Spec.
3. Qualquer item crítico com nota 3 → Look Dev v3 obrigatório.
4. A tabela de notas é registrada no relatório de verify ou no PR.

## Preenchimento — Wave P0 (2026-09-10)

Evidência: `docs/evidence/portfolio-audit-p0/` (3 viewports × 8 pontos).

| Critério | Peso | Nota | Nota mínima | OK? | Observação (contra evidência) |
|---|---:|---:|---:|:---:|---|
| Primeira dobra / impacto imediato | 3 | 5 | 4 | ✅ | `390/430/1440-scroll-0`: máscara domina, copy ancorada embaixo, rim light separa a silhueta |
| Composição mobile | 3 | 4 | 4 | ✅ | Arsenal `390/430-scroll-75`: lançador 100% livre (copy na base); FullBody `390/430-scroll-100`: peito/símbolo livre |
| Integração texto + personagem | 3 | 4 | 4 | ✅ | Nenhuma palavra cortada (`1440-scroll-45/75`, `390-scroll-100`); texto fora do foco em todos os beats |
| Iluminação e silhueta | 2 | 5 | 4 | ✅ | Rim oxide/signal, materialidade do traje legível nos close-ups (`1440-scroll-30/45`) |
| Tipografia e hierarquia | 2 | 4 | 4 | ✅ | Quebras manuais do storyboard (`SplitTextHeadline` com `\n`); fim do `ESTÁ M/UDANDO.` |
| Ritmo de scroll e câmera | 2 | 4 | 4 | ✅ | Chapter cards + órbita do Arsenal + assinatura final; ritmo ainda por variação (escopo da P1c) |
| Sensação cinematográfica/editorial | 2 | 5 | 4 | ✅ | Loader teaser + opening title card + colofon editorial (`loader-teaser/`, `opening-title-card/`, `colophon-outro/`) |
| Originalidade de portfólio | 2 | 5 | 4 | ✅ | Rig procedural + shaders autorais + assinatura de autor com stack e CTA |
| Performance percebida mobile | 3 | 4 | 4 | ✅ | `budget.spec.ts`: draw calls ≤ 48, `programs` estável no scroll; FPS real pendente (Fase 7.3) |
| Motion reduzida ainda bonita | 1 | 4 | 3 | ✅ | `reduced-motion.spec.ts` com enquadramento por seção e composição preservada |
| **Média ponderada** | | **4,4** | **≥ 4** | ✅ | 101/23 |

**Bloqueantes:** primeira dobra (5), composição mobile (4) e integração
texto/personagem (4) — todos ≥ 4.

**Pendência que impede nota máxima:** FPS em dispositivo real não medido
(TD-002 / Fase 7.3). Autoria (P1b) já endereçada pelo colofon.
