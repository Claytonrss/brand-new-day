# Launch checklist — kit de divulgação

> **Data:** 2026-09-14 · **Fonte:** A10 da auditoria + onda W6 do
> pós-lançamento (PRs #62–#69). Tudo abaixo é **ação do
> dono** — os artefatos estão prontos para colar. Ordem = funil: repo em
> forma → perfil → post.

## Pré-requisitos (marcar antes do post)

- [x] Mergear a cadeia de lançamento (#62–#69) — concluído (todos merged;
      resumo no arquivo de planos concluídos do `PROGRESS.md`).
- [ ] Resolver o billing do GitHub Actions (Settings → Billing & plans) — o CI
      está sem rodar desde o #59.
- [ ] Sessão de device S23 (Bloco A): o "zero janks" já saiu do colofon
      preventivamente (ADR-031); com a medição em mãos, o claim volta
      **com número** ou fica suave para sempre (`ColophonSection.tsx`).
- [ ] Passada Safari/iPhone (M15, de carona no TD-002) — uma tarde.
- [ ] Tornar o repo **público** (Settings → General → Danger Zone).
- [ ] Habilitar Web Analytics no dashboard Vercel (toggle; dados do W5).

## 1. GitHub (10 min)

- [ ] **Pin do repo** no perfil (Profile → Customize your pins).
- [ ] **Profile README** (`Claytonrss/Claytonrss` repo) — snippet pronto:

```markdown
### 🕷️ Em destaque

**[Spider-Man: Brand New Day — cinematic 3D landing](https://brand-new-day-fan.vercel.app/)**
Experiência 3D guiada por scroll construída com React Three Fiber + GSAP:
rig procedural sem clipes, câmera Catmull-Rom por 7 beats e três tiers
adaptativos de performance. Código, motion e process todo documentado
([case study](https://github.com/Claytonrss/brand-new-day/blob/main/docs/case-study-ai-harness.md)).
```

- [ ] Conferir que a `description` e o Website do repo seguem corretos
      (corrigidos em 2026-09-14: URL da demo + descrição em inglês).

## 2. LinkedIn (15 min)

Post principal (PT-BR, rascunho — ajustar a voz):

> **Feito à mão.**
>
> Publiquei uma experiência 3D cinematográfica construída do zero: o
> Spider-Man: Brand New Day como pretexto para resolver problemas reais de
> frontend — rig procedural sem animações pré-gravadas, câmera contínua por
> 7 beats narrativos e três tiers de qualidade que se adaptam ao hardware de
> quem visita.
>
> Alguns números: 44 draw calls por frame (começaram em 118), modelo de 6,5 MB
> com compressão meshopt, 168 testes unitários + suíte visual, Lighthouse
> 43/94 (mobile/desktop). Tudo construído com um harness de agentes de IA que
> eu mesmo projetei — specs dirigem código, e todo PR carrega evidências.
>
> 🔗 Demo: https://brand-new-day-fan.vercel.app/
> 💻 Código + case study: https://github.com/Claytonrss/brand-new-day
>
> #threejs #react #webgl #frontend #portfolio

- [ ] Anexar o vídeo/GIF do scroll (fonte: `docs/assets/demo-loop.gif` ou
      regravar 15 s direto do deploy — em post, vídeo nativo performa melhor).
- [ ] **Featured:** fixar o post no perfil (ao lado do featured existente).
- [ ] (Opcional, 2h) Artigo "Como estruturei um harness de agentes de IA para
      construir um portfólio 3D" — base pronta em
      `docs/case-study-ai-harness.md`.

## 3. X/Twitter (5 min, opcional)

> One rainy night in NYC, rendered in real time.
>
> A scroll-driven Spider-Man 3D experience — procedural rig, continuous
> camera, adaptive quality tiers. Built with React Three Fiber + GSAP + an
> AI agent harness I designed.
>
> 🕸️ https://brand-new-day-fan.vercel.app/
> 📂 https://github.com/Claytonrss/brand-new-day

## 4. Pós-post (feedback loop)

- [ ] Vercel Analytics: visitas × profundidade de scroll × colofon (o funil
      que a auditoria pediu).
- [ ] Logs do beacon `/api/log`: falhas de WebGL por device.
- [ ] Números de device (S23) → atualizar README/auditoria (C4).
