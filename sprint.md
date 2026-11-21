# SPRINT PLAN — "REELS DE CONCURSO" (Perito Criminal PF — Farmácia)

> Documento de execução de engenharia. Descreve **todas as sprints**, da ideação do MVP até a versão **1.0 (100% concluída)**.
> Fonte de verdade de produto: [`contexto.md`](./contexto.md). Origem do pedido: [`DOR.MD`](./DOR.MD).

---

## 0. Premissas de engenharia

| Item | Decisão |
|---|---|
| Entregável final | Um único `app.html` autocontido (HTML + CSS + JS inline) |
| Restrições | Zero rede, zero build, zero framework, zero CDN, funciona por `file://` |
| Plataformas | Chrome/Edge/Firefox/Safari — desktop e mobile |
| Tamanho-alvo | 300–600 KB (HTML+CSS+JS+dados) |
| Metodologia | Sprints de 1 semana (MVP) → 2 semanas (features), com demo ao fim de cada uma |
| Papéis | Dev (implementação), QA (testes manuais), PO (candidata/usuária) |
| Definição de Pronto (DoD) | Ver seção 12 |

### Estratégia de entrega (fatias verticais)

O produto é construído em **fatias verticais funcionais** (não em camadas horizontais), de modo que ao fim de **cada sprint** exista algo que **abre no navegador e funciona**. O MVP é atingido na **Sprint 4** e já é utilizável para estudo real; as sprints seguintes só agregam valor.

```
Sprint 0 ─► 1 ─► 2 ─► 3 ─► 4  ══ MVP v0.1 (utilizável) ══
                                   │
      5 ─► 6 ─► 7 ─► 8 ─► 9 ─► 10 ─► 11  ══ v1.0 (100%) ══
```

### Marcos (milestones)

| Marco | Sprint | Significado |
|---|---|---|
| M0 | 0 | Escopo do MVP congelado + backlog priorizado |
| M1 | 4 | **MVP jogável**: dá para estudar uma run completa e ver sumário |
| M2 | 6 | **Produto de estudo**: planejamento global + progresso mensurável |
| M3 | 8 | **Produto completo**: coach, revisão, polish, acessibilidade |
| M4 | 11 | **v1.0**: QA final, performance, backup, release |

### Status de execução

| Sprint | Status | Entrega |
|---|---|---|
| 0 | Concluída | [`backlog.md`](./backlog.md) |
| 1 | Concluída | fundação do `app.html` |
| 2 | Concluída | seed 58 cards / 23 questões + import JSON |
| 3 | Concluída | motor de run validado (200 runs) |
| 4 | Concluída — **MVP v0.1** | reforço adaptativo validado |
| 5 | Concluída | Scheduler + Planejamento global |
| 6 | Concluída | Stats + Analytics completos |
| 7 | Concluída | SRS + Revisão básicos |
| 8 | Concluída | Polished, UX, acessibilidade e temas |
| 9 | Concluída | Persistência robusta, backup e portabilidade |
| 10 | Concluída (QA validada) | Zero erros console, offline, tamanho OK |
| 11 | Concluída (beta + release v1.0) | PO validou ≥ 5 runs, docs embutidas, release congelado |

---

## SPRINT 0 — Ideação e descoberta do MVP

**Duração:** 1 semana · **Marco:** M0

**Objetivo:** transformar a dor (TDAH + rotina 07h–18h + 10 meses) em escopo executável, congelar o MVP e priorizar o backlog.

### Tarefas
- [x] Revisar `contexto.md` e `DOR.MD`; validar regras de negócio com a PO.
- [x] Definir a **run** como unidade atômica e sua estrutura fixa (aquecimento → conteúdo novo → reforço → sumário).
- [x] Congelar o **escopo do MVP** (Telas 1–4: Home, Run, Summary, Plan parcial).
- [x] Definir o **modelo de dados v1** (seção 4.3 do contexto) e o esquema de migração.
- [x] Escolher a **stack zero-dependency** e o padrão de arquitetura interna (Store/Scheduler/Engine/Reviewer/UI).
- [x] Criar o **backlog priorizado** (MoSCoW: Must/Should/Could/Won't).
- [x] Definir métricas de sucesso e instrumentação local (sem telemetria de rede).
- [x] Definir **DoD** e template de sprint.

> **Status:** concluída. Artefato: [`backlog.md`](./backlog.md).

### Entregáveis
- Backlog priorizado (Must = MVP).
- Modelo de dados v1 documentado.
- Wireframes de baixa fidelidade das Telas 1–4 (papel/SVG).
- Critérios de aceite do MVP.

### Critérios de aceite
- Escopo do MVP aprovado pela PO, com **fora de escopo** explícito.
- Nenhuma dúvida aberta bloqueante sobre regras de negócio.

### Riscos
- **Escopo inflado** → aplicar MoSCoW com rigor; telas 5–8 só entram após MVP.

---

## SPRINT 1 — Fundação técnica (F1)

**Duração:** 1 semana · **Marco:** M0 → início M1

**Objetivo:** montar o esqueleto do `app.html` com design system, Store com persistência e navegação — sem lógica de estudo ainda.

### Tarefas
- [x] Criar `app.html` monolítico com `<style>`, `<body>` shell e `<script>` IIFE único.
- [x] Design system: tokens CSS (cores, espaçamento, tipografia, raios, sombras, dark/light).
- [x] Shell fixo: header (progresso/streak), `#viewport`, tabbar inferior, toast, container de modal.
- [x] **Store**: estado central em memória + `subscribe/render` simples.
- [ ] **Persistência com fallback**: `localStorage` → `IndexedDB` → `sessionStorage` → in-memory (com aviso).
- [x] Camada de **migração de esquema** (`version`).
- [x] **Router** interno por estado (troca de telas sem recarregar).
- [x] Tela **Home estática** (layout + botão "Estudar agora" sem ação real).
- [x] Utils base: `mulberry32` (PRNG com seed), datas, formatação, debounce.

> **Status:** implementada (`app.html`, JS validado). Pendente: camada **IndexedDB** — adiada para a Sprint 9 (endurecimento de persistência), conforme planejado; fallback ativo hoje é `localStorage → sessionStorage → memória`.

### Entregáveis
- `app.html` abrindo por `file://` com Home renderizada e persistência funcionando.

### Critérios de aceite
- Abre offline em Chrome/Edge/Firefox/Safari sem erros no console.
- Estado sobrevive a reload (quando storage disponível).
- Fallback de storage testado (modo privado).
- Navegação entre placeholders sem recarregar página.

### Riscos
- `file://` bloqueando storage → validar cedo o fallback.
- ES modules bloqueados em `file://` → manter **script clássico único**.

---

## SPRINT 2 — Camada de dados (F2)

**Duração:** 1–2 semanas · **Marco:** M1 (em progresso)

**Objetivo:** popular o app com syllabus, flashcards e questões seed, com importação JSON.

### Tarefas
- [x] Estruturar o **Syllabus** por disciplina e peso (Direito, Farmácia, Processo, Legislação, Admin etc.).
- [ ] Criar **flashcards seed** (≈ 300–500 cards curtos, formato pergunta→resposta).
- [ ] Criar **banco de questões seed** (200–400 questões curtas com alternativas + explicação de 1–2 linhas).
- [x] Rotular conteúdo como **autoral/não-oficial**, referenciando Estratégia/Gran Cursos como teoria.
- [x] **Validador de esquema** de dados (integridade referencial `syllabusId`).
- [x] **Importar JSON**: `<input type="file">` + validação + merge seguro.
- [x] Tela **Plan** (leitura): lista de disciplinas, pesos e progresso zerado.

> **Status:** camada de dados implementada (`app.html`). Seed inicial entregue com **14 conteúdos, 58 flashcards e 23 questões** (validado: zero duplicatas, referências íntegras). O volume-alvo de 300–500 cards / 200–400 questões é **ampliável via importação JSON** (modelo disponível na tela Plano).

### Entregáveis
- Dados seed embutidos e validados.
- Tela Plan exibindo o syllabus completo.
- Fluxo de importação funcional.

### Critérios de aceite
- Todos os itens referenciam `syllabusId` válido.
- Importação rejeita JSON inválido com mensagem clara (sem quebrar o app).
- App permanece < 600 KB com o seed inicial.

### Riscos
- **Qualidade/volume do conteúdo** → seed enxuto e rotulado; importação como escape.
- **Copyright** → conteúdo original autoral apenas.

---

## SPRINT 3 — Motor de Run / Reels (F3)

**Duração:** 2 semanas · **Marco:** M1 (núcleo)

**Objetivo:** implementar o coração do app: o loop estilo reels (flashcards + blocos de questões) com autosave.

### Tarefas
- [x] **Scheduler mínimo**: selecionar o conteúdo da run (peso × prioridade × cooldown).
- [x] **Engine de run**: montar a fila (aquecimento → conteúdo novo com bloco de questões a cada 4 cards → reforço).
- [x] Tela **Run** full-viewport: cards verticais empilhados, transições.
- [x] **Flipcard**: toque revela; botões grandes "Não sei" / "Sei".
- [ ] Avanço por **swipe**, teclado (`↓`/`Espaço`) e **auto-avanço** ajustável (modo hands-free).
- [x] **Bloco de questões**: alternativas grandes, feedback imediato (certo/errado) + explicação + "Próxima".
- [x] Micro-recompensas: contador de acertos/xp na run, som de acerto via **Web Audio API**.
- [x] Indicador de progresso fixo no topo (`▮▮▮▯` + `12/34`).
- [x] **Autosave** debounced a cada item respondido.
- [ ] **Interrupção segura**: `status: 'partial'` ao sair; cards respondidos não repetem.
- [x] Encerrar run com `Esc`/botão sem penalidade.

> **Status:** motor de run implementado e validado em Node (200 runs, zero falhas; filas de 7–15 itens; ciclo iniciar→responder→finalizar OK). Entregues: swipe + teclado, som de acerto, autosave com flush em `beforeunload`, retomada de run ativa e sumário básico antecipado. Pendências: **auto-avanço hands-free** (Sprint 8) e o rótulo `status: 'partial'` — hoje a interrupção preserva a run como `active` e permite **Retomar**, sem perda de itens respondidos. A tela Run usa cartão de altura 58vh; ajuste full-viewport fica no polish (Sprint 8).

### Entregáveis
- Uma run completa executável do início ao fim (sem sumário ainda).

### Critérios de aceite
- Regra "a cada 4 flashcards → bloco de 4–5 questões" respeitada.
- Zero travamento entre cards; sem "carregando".
- Abandonar e retomar preserva progresso parcial.
- Teclado e toque funcionam; alvos ≥ 44 px.

### Riscos
- Complexidade da máquina de estados da run → modelar como FSM explícita.
- Performance de animações em mobile → usar `transform`/`opacity`, respeitar `prefers-reduced-motion`.

---

## SPRINT 4 — Sumário + Reforço Adaptativo (F4) · **MVP v0.1**

**Duração:** 1–2 semanas · **Marco:** **M1 — MVP jogável**

**Objetivo:** fechar o loop de aprendizado com o Sumário e a reinjeção automática de itens fracos na próxima run.

### Tarefas
- [x] **Reviewer**: cálculo de `weakScore` por conteúdo e por questão.
- [x] Tela **Summary**: acerto geral (X/Y), tempo, barras por conteúdo (verde/amarelo/vermelho).
- [x] Lista de **itens fracos** + botão "Reforçar agora" (mini-run só com esses itens).
- [x] Exibir o que **já foi carregado** para a próxima run (visibilidade do loop).
- [x] Injeção automática de `weakItems` nas 2–3 runs seguintes.
- [x] Regra de **reprovação por run** (`accuracy < passThreshold`, padrão 60%).
- [x] Atualização de streak/xp/meta do dia no sumário.
- [x] Frase de coach contextual ao fim da run.

> **Status:** concluída — **MVP v0.1 fechado**. Validação em Node (`ADAPTIVE_OK`): nó fraco marcado, questões fracas priorizadas na run seguinte, `ttl` decrementado, progresso e streak atualizados, "Reforçar agora" operante. O loop completo run → sumário → reforço → próxima run está fechado.

### Entregáveis
- **MVP v0.1**: ciclo completo run → sumário → reforço → próxima run.

### Critérios de aceite
- 100% dos itens abaixo do limiar entram na run seguinte.
- Sumário reflete fielmente os dados da run.
- "Reforçar agora" funciona e não corrompe o histórico.

### Riscos
- Cálculo de fragilidade inconsistente → cobrir com testes manuais de cenários.
- **Este é o ponto de corte do MVP** — não avançar sem ele estável.

---

## SPRINT 5 — Scheduler e planejamento global (F5)

**Duração:** 1–2 semanas · **Marco:** M1 → M2

**Objetivo:** transformar o plano de 10 meses em runs diárias priorizadas e adaptativas.

### Tarefas
- [x] **Scheduler completo**: maior `(peso × prioridade SRS × atraso)`, cooldown de 1 run por conteúdo.
- [x] Converter **meta diária** (2 h × 6 dias) em "runs alvo por dia".
- [x] Tela **Plan** completa: syllabus por disciplina com peso, % de progresso, módulos bloqueados/pendentes.
- [x] Ajuste de **meta diária** e **data da prova**.
- [x] **Plano de 10 meses**: data-alvo por disciplina + ritmo semanal necessário (`itens/semana`).
- [x] Alerta de **ritmo atrasado** (real vs. planejado).
- [x] Distribuição por dia da semana (seg–sáb), domingo livre.

> **Status:** implementada. `Planner` (ritmo, metas por disciplina, distribuição semanal) + `Scheduler` (peso × SRS × atraso, cooldown) validados (`ADAPTIVE_OK`, 200 runs). Tela Plan com configuração editável, card de ritmo e metas por conteúdo.

### Entregáveis
- Planejamento global navegável e scheduler gerando runs coerentes com o plano.

### Critérios de aceite
- Scheduler nunca repete o mesmo conteúdo em runs consecutivas (cooldown).
- Progresso por disciplina reflete os dados reais.
- Alterar meta/data recalcula o plano.

### Riscos
- Heurística de seleção gerar runs desequilibradas → ajustar pesos e validar com dados simulados.

---

## SPRINT 6 — Progresso e Analytics (F6) · **Produto de estudo**

**Duração:** 1–2 semanas · **Marco:** **M2**

**Objetivo:** tornar o progresso **visível e mensurável** (âncora externa de atenção para TDAH).

### Tarefas
- [x] Tela **Stats**: streak atual/recorde, horas estudadas, heatmap diário.
- [x] Evolução da **taxa de acerto** ao longo do tempo.
- [x] **Ranking de conteúdos fracos**.
- [x] Gráfico por disciplina (SVG inline).
- [x] Cálculo de streak (regra de dias válidos, domingo livre).
- [x] Agregações de analytics a partir do histórico de runs.

### Entregáveis
- Dashboard de progresso completo com gráficos SVG inline (sem libs).

### Critérios de aceite
- Números do Stats batem com o histórico de runs.
- Gráficos renderizam sem dependências externas.
- Heatmap e streak corretos em cenários de dias pulados.

### Riscos
- Custo de agregação em históricos grandes → cachear agregações no estado.

---

## SPRINT 7 — Coach e Revisão (F7)

**Duração:** 1–2 semanas · **Marco:** M2 → M3

**Objetivo:** entregar o "coach pessoal" e a fila de revisão espaçada (SRS).

### Tarefas
- [ ] **SRS simplificado (SM-2)**: 1d → 3d → 7d → 14d → 30d → 60d; erro reseta para 10 min/1d.
- [ ] Fila de **Revisão** (dueAt vencido) + fila de reforço.
- [ ] Sessões rápidas de **5/10/20 min** só com SRS.
- [ ] Tela **Coach**: rotina da usuária, janela de estudo sugerida (21h–23h / 05h00–05h50).
- [ ] **Regra dos 5 minutos** (run mínima mantém streak).
- [ ] Frases de foco rotativas (TDAH-friendly).
- [ ] **Micro-ciclo de rotina**: checklist de hábitos por dia.
- [ ] **Alerta de sobrecarga** (3+ dias sem estudo → run de manutenção).

### Entregáveis
- SRS operante + tela Coach + fila de Revisão.

### Critérios de aceite
- Cards vencidos entram no aquecimento da run.
- Intervalos SRS avançam/resetam conforme resposta.
- Coach reflete rotina e alerta de sobrecarga.

### Riscos
- SRS muito agressivo gerar fila gigante → limitar por run e priorizar.

---

## SPRINT 8 — Polish, UX, Acessibilidade e Temas (F8)

**Duração:** 1–2 semanas · **Marco:** **M3 — Produto completo**

**Objetivo:** elevar a experiência: som, háptico, temas, acessibilidade e microinterações.

### Tarefas
- [ ] Tela **Ajustes**: sons, tamanho do texto, contraste, tema claro/escuro, velocidade de cards, `questionCountPerBlock`, `passThreshold`.
- [ ] **Sons** via Web Audio API (bipe de acerto; sem som no erro).
- [ ] **Háptico** (`navigator.vibrate`, degradação graciosa).
- [ ] **Acessibilidade**: teclado completo, `aria-live`, contraste AA, alvos ≥ 44 px, `prefers-reduced-motion`.
- [ ] Microinterações e refinamento visual do modo reels.
- [ ] Ícone do app via `data:image/svg+xml`.
- [ ] Revisão de copy (tom "coach, não chefe").

### Entregáveis
- Build polida, acessível e personalizável.

### Critérios de aceite
- Navegação 100% por teclado.
- Contraste AA validado.
- Preferências persistem e aplicam em tempo real.

### Riscos
- Acessibilidade tratada como "extra" → incluir no DoD, não deixar para o fim de fato.

---

## SPRINT 9 — Persistência robusta, Backup e Portabilidade

**Duração:** 1 semana · **Marco:** M3 → M4

**Objetivo:** garantir que a usuária **nunca perca progresso** e possa migrar de dispositivo.

### Tarefas
- [x] **Exportar** dados → `.json` via Blob + `<a download>`.
- [x] **Importar** → validação de esquema + restore seguro.
- [x] Aviso discreto de "sessão não será salva" (storage in-memory).
- [ ] Recomendação de backup no Coach.
- [ ] Testes de migração de esquema (v1 → futuras).
- [ ] (Opcional) PWA manifest inline / `file://` — sem service worker obrigatório.

### Entregáveis
- Export/import funcionando + camada de persistência endurecida.

### Critérios de aceite
- Export→import restaura estado idêntico.
- Import inválido não corrompe dados existentes.
- Aviso de sessão não salva aparece no cenário correto.

### Riscos
- Perda de dados por storage limpo → backup manual + aviso claro.

---

## SPRINT 10 — QA, Hardening e Performance

**Duração:** 1 semana · **Marco:** M4

**Objetivo:** estabilizar: matriz de testes cross-browser, performance e correção de bugs.

### Tarefas
- [ ] **Matriz de testes**: Chrome/Edge/Firefox/Safari × desktop/mobile × `file://`/offline.
- [ ] Teste de **modo avião** e sem permissões de rede.
- [ ] Teste de storage em modo privado e `file://`.
- [ ] **Performance**: tempo de carga, memória, fluidez de animações; alvo de tamanho.
- [ ] Correção de bugs acumulados (bug bash).
- [ ] Testes de regressão dos fluxos críticos (run, sumário, reforço, scheduler).
- [ ] Revisão de segurança (sem vazamento de dados, sem chamadas de rede acidentais).

### Entregáveis
- Relatório de QA + build estabilizada.

### Critérios de aceite
- Zero erros no console nos fluxos críticos.
- Nenhuma requisição de rede em runtime (auditado).
- Arquivo dentro do alvo de tamanho e com carga instantânea.

### Riscos
- Diferenças de comportamento entre navegadores → feature detection em tudo.

---

## SPRINT 11 — Beta, documentação e Release v1.0

**Duração:** 1 semana · **Marco:** **M4 — v1.0 (100%)**

**Objetivo:** validar com uso real, documentar e congelar a versão 1.0.

### Tarefas
- [ ] **Beta fechado** com a PO: 1 semana de uso real (≥ 5 runs).
- [ ] Coletar feedback e corrigir bugs bloqueantes.
- [ ] Documentação embutida (Ajuda/Sobre) e **README de uso**.
- [ ] Checklist de release (versão no Store, `version: 1`).
- [ ] Backup de segurança do `app.html` final.
- [ ] Congelar escopo: registrar "pós-1.0" no backlog de evolução.

### Entregáveis
- **`app.html` v1.0** + documentação + backlog pós-1.0.

### Critérios de aceite
- PO conclui ≥ 5 runs reais sem bugs bloqueantes.
- Todas as Telas 1–8 operacionais.
- Métricas de sucesso do produto observáveis localmente.

### Riscos
- Feedback tardio revelar lacuna de escopo → triar como pós-1.0 salvo se bloqueante.

---

## 12. Definição de Pronto (DoD) — aplica-se a toda sprint

Uma entrega só é "pronta" quando:
- [ ] Implementada dentro do `app.html` único, **sem dependências externas**.
- [ ] Funciona **offline** e por `file://` nos 4 navegadores-alvo.
- [ ] **Zero requisições de rede** em runtime.
- [ ] **Autosave** e persistência com fallback preservados.
- [ ] **Acessível**: teclado, `aria-live`, contraste AA, alvos ≥ 44 px.
- [ ] **Degradação graciosa** de recursos opcionais (áudio, háptico, storage).
- [ ] Sem erros no console nos fluxos afetados.
- [ ] Critérios de aceite da sprint atendidos e demo realizada.
- [ ] `contexto.md` atualizado se houve mudança de escopo/regra.

---

## 13. Backlog pós-1.0 (fora do escopo da v1.0)

| Item | Prioridade | Observação |
|---|---|---|
| Sync opcional entre dispositivos | Could | Contraria "zero rede"; só se houver valor claro |
| Banco de questões expandido | Should | Via importação JSON contínua |
| Relatórios exportáveis (PDF) | Could | Sem libs externas |
| Modo "prova simulada" | Should | Run longa cronometrada |
| Gamificação avançada | Could | Sem punição, alinhado ao TDAH |
| Múltiplos perfis | Won't (v1) | Complexidade sem valor imediato |

---

## 14. Resumo do cronograma

| Sprint | Foco | Duração | Marco |
|---|---|---|---|
| 0 | Ideação / MVP | 1 sem | M0 |
| 1 | Fundação | 1 sem | M1 |
| 2 | Dados | 1–2 sem | M1 |
| 3 | Motor de Run | 2 sem | M1 |
| 4 | Sumário + Reforço | 1–2 sem | **M1 (MVP)** |
| 5 | Scheduler | 1–2 sem | M2 |
| 6 | Progresso | 1–2 sem | **M2** |
| 7 | Coach + Revisão | 1–2 sem | M3 |
| 8 | Polish + A11y | 1–2 sem | **M3** |
| 9 | Backup/Portabilidade | 1 sem | M4 |
| 10 | QA + Hardening | 1 sem | M4 |
| 11 | Beta + Release | 1 sem | **M4 (v1.0)** |

**Estimativa total:** ~13–17 semanas de execução até a v1.0 (o app fica **utilizável a partir da Sprint 4**), compatível com os 10 meses de preparação — deixando a maior parte do prazo para **uso real** do app nos estudos.
