# BACKLOG PRIORIZADO — "Reels de Concurso"

> Artefato da **Sprint 0**. Priorização MoSCoW do MVP e critérios de aceite.
> Referência de produto: [`contexto.md`](./contexto.md). Plano: [`sprint.md`](./sprint.md).

---

## 1. Escopo do MVP (congelado)

O MVP é a **fatia vertical mínima utilizável para estudo real**, entregue ao fim da **Sprint 4**:

- Abrir o `index.html` e cair direto na **Home** (1 toque para estudar).
- Rodar uma **run** completa em ritmo de reels (flashcards + blocos de questões).
- Ver o **Sumário** com acerto por conteúdo.
- Ter os **itens fracos reinjetados** automaticamente na run seguinte.

**Fora do MVP:** Plano completo (Sprint 5), Progresso/Stats (Sprint 6), Coach e Revisão (Sprint 7), Polish/A11y (Sprint 8), Backup (Sprint 9).

---

## 2. Backlog MoSCoW

### Must (obrigatório para o MVP)

| # | Item | Sprint | Critério de aceite |
|---|---|---|---|
| M-01 | `index.html` único, offline, `file://` | 1 | Abre nos 4 navegadores sem rede |
| M-02 | Store central + persistência com fallback | 1 | Estado sobrevive a reload |
| M-03 | Navegação por estado (router) | 1 | Troca de telas sem recarregar |
| M-04 | Home com botão único "Estudar agora" | 1 | 1 toque inicia fluxo |
| M-05 | Syllabus por disciplina/peso | 2 | Todos os itens com `syllabusId` válido |
| M-06 | Flashcards + questões seed | 2 | Seed carregado e validado |
| M-07 | Motor de run (aquecimento→novo→reforço) | 3 | Run completa do início ao fim |
| M-08 | Regra "4 cards → bloco de questões" | 3 | Respeitada em toda run |
| M-09 | Flipcard com "Sei/Não sei" + swipe/teclado | 3 | Toque e teclado funcionam |
| M-10 | Autosave + interrupção segura | 3 | `status: partial` retomável |
| M-11 | Sumário com acerto por conteúdo | 4 | Fiel aos dados da run |
| M-12 | Cálculo de `weakScore` + reinjeção | 4 | 100% dos fracos na próxima run |

### Should (importante, não bloqueia MVP)

| # | Item | Sprint |
|---|---|---|
| S-01 | Scheduler com cooldown e pesos | 5 |
| S-02 | Plano de 10 meses + ritmo semanal | 5 |
| S-03 | Stats, streak, heatmap | 6 |
| S-04 | SRS (SM-2 simplificado) | 7 |
| S-05 | Tela Coach + regra dos 5 minutos | 7 |
| S-06 | Acessibilidade (teclado, aria-live, AA) | 8 |
| S-07 | Export/import JSON | 9 |

### Could (desejável)

| # | Item | Sprint |
|---|---|---|
| C-01 | Temas claro/escuro + tamanho de texto | 8 |
| C-02 | Sons (Web Audio) e háptico | 8 |
| C-03 | Modo hands-free (auto-avanço) | 3/8 |
| C-04 | PWA manifest inline | 9 |
| C-05 | Relatórios exportáveis | pós-1.0 |

### Won't (fora do escopo da v1.0)

| # | Item | Motivo |
|---|---|---|
| W-01 | Login / conta / nuvem | Contraria offline-first e privacidade |
| W-02 | Sync entre dispositivos | Exige rede/back-end |
| W-03 | Múltiplos perfis | Complexidade sem valor imediato |
| W-04 | Reprodução de material protegido | Restrição legal; aponta p/ cursos |

---

## 3. Critérios de aceite do MVP

1. A usuária abre o `index.html` offline e vê a Home em < 1 s.
2. Um toque em "Estudar agora" inicia uma run sem confirmações.
3. A run intercala 4 flashcards → bloco de 4–5 questões, com feedback imediato.
4. Sair no meio salva `partial`; retomar não repete itens já respondidos.
5. Ao encerrar, o Sumário mostra acerto geral e por conteúdo.
6. Conteúdos abaixo do limiar entram automaticamente na próxima run.
7. Zero requisições de rede; zero erros no console nos fluxos críticos.

---

## 4. Wireframes (baixa fidelidade)

**Home:** eyebrow "Sua próxima run" → saudação → card com 3 números (streak / min hoje / runs) → botão único "Estudar agora" → dica de meta.

**Run:** barra de progresso fixa no topo (`▮▮▮▯` + `12/34`) → card vertical full-viewport (pergunta) → toque revela → dois botões grandes (Não sei / Sei) → a cada 4 cards, banner "Treine agora" → bloco de questões → feedback → "Próxima".

**Summary:** acerto geral (X/Y) + tempo → barras por conteúdo (verde/amarelo/vermelho) → lista de itens fracos + "Reforçar agora" → "o que já foi carregado na próxima run" → streak/meta → frase do coach.

**Plan:** lista de disciplinas com peso → % de progresso → módulos pendentes/bloqueados → ajuste de meta e data da prova.

---

## 5. Riscos do MVP

| Risco | Mitigação |
|---|---|
| Escopo inflado | MoSCoW rígido; Must = MVP apenas |
| `file://` bloqueia storage | Fallback localStorage→sessionStorage→memória |
| Conteúdo seed fraco | Seed enxuto/rotulado + importação JSON |
| Motor de run travar | FSM explícita + autosave por item |
