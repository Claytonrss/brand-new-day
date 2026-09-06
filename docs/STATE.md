# Estado do Projeto — Spider-Man: Brand New Day

**Última atualização:** 2026-09-05  
**Fase Atual:** Fase 3.1 Concluída / Iniciando Fase 3.2 (Look Dev v1) & Fase 6.1 (Fundação Canvas R3F)

---

## Estado Atual da Aplicação

- **Scaffold & Stack:** Vite 8 + React 19 + TypeScript 5.9 + Tailwind CSS v4 + Three.js 0.185 + R3F 9.7 + Drei 10.7 + GSAP 3.15 + pnpm 9.
- **Modelo 3D:** Localizado em `public/models/spider-man_brand_new_day-v2.glb` (50.4 MB, Rig Mixamo 66 joints, `mixamorig:Head_06` pronto).
- **Design System & Tokens:** Definidos em `src/index.css` via `@theme` (Tailwind v4), com fontes Space Grotesk e JetBrains Mono conectadas via Google Fonts no `index.html`.
- **Documentação de Design:** 16 documentos em `docs/design/` cobrindo Design Bible, Storyboard, Composition Rules, Visual Rubric, Matriz de Qualidade, Look Dev Plan, etc.
- **Gates de Qualidade (`pnpm verify`):**
  - Lint: PASS
  - Typecheck: PASS
  - Testes unitários (Vitest): PASS
  - Build: PASS
  - Testes visuais (Playwright): Configurados para 390x844, 430x932 e 1440x900.

---

## Próximos Passos Imediatos

1. Desenvolver o componente `SceneCanvas` em R3F para renderizar o Spider-Man em 3D.
2. Implementar iluminação cinematográfica (rim light `#7a1f24` tom oxide + directional light fria).
3. Construir Look Dev v1 da Hero section (primeira dobra) com composição mobile/desktop e tipografia.
4. Executar bateria de verificação visual e validar a rubrica com nota >= 4 em todos os critérios.
