# CONTEXTO DO APLICATIVO — "REELS DE CONCURSO" (Perito Criminal — PF — Farmácia)

> Documento de contexto vivo. Toda mudança de escopo, regra de negócio ou decisão técnica deve ser registrada aqui antes de ser implementada no arquivo único HTML.

---

## 1. Objetivo

Criar um **aplicativo web de estudo em formato "Reels"** que transforme o tempo curto e fragmentado de estudo disponível para a candidata em sessões curtas, previsíveis e altamente potencializadas por repetição adaptativa.

**Objetivo geral:** ser um **professor particular + coach pessoal** digital, que:

- Organiza todo o conteúdo da banca (PF — Perito Criminal, área Farmácia) em um **planejamento global** de estudos.
- Quebra esse planejamento global em **runs** (sprints curtos de ~30–45 min) para caber na rotina de quem trabalha das 07h às 18h.
- Entrega **micro-conteúdo em loop de flashcards** (ritmo de reels de rede social) intercalado com **blocos de questões** de prova.
- Fecha cada run com **sumário analítico** que identifica os conteúdos de menor desempenho e os **reforça automaticamente na próxima run**.
- Funciona **100% offline**, em **arquivo HTML único e monolítico**, sem servidor, sem build, sem CDN, sem conta e sem qualquer chamada de rede.

**Objetivo do usuário final (em uma frase):** *"consigo estudar 30 minutos no sofá às 22h e mesmo assim meu progresso no concurso é real, mensurável e agendado."*

### 1.1 Métricas de sucesso do app

| Métrica | Meta |
|---|---|
| Sessão (run) concluída | ≥ 5 por semana |
| Taxa de acerto média por run | ≥ 70% |
| Itens fracos revisados na run seguinte | 100% dos itens abaixo do limiar |
| Tempo médio de run | 25–45 min (compatível com a janela noturna) |
| Usos offline | 100% das funcionalidades |

---

## 2. Contexto geral do usuário (público-alvo)

**Quem é:** candidata em preparação para o concurso de **Perito Criminal da Polícia Federal — área Farmácia**. Formada em Farmácia.

**Perfil comportamental:**

- **Rotina de trabalho:** propagandista médica, visitas a médicos. Trabalha **07h–18h**, com **1h30 de intervalo para almoço**.
- **Janela de estudo declarada:** **2 h/dia, de segunda a sábado** (domingo livre). Turno noturno disponível; apartamento pequeno, de pé, às 22h, cansado, celular na mão.
- **Prazo:** **10 meses** até a prova.
- **Neurodivergência:** **TDAH** com déficit de atenção.
- **Ferramentas disponíveis:** possui acesso a cursos de **Estratégia Concursos** e **Gran Cursos** (o app **não deve reproduzir material protegido**; deve funcionar como *sistema de estudo* — planejador, questionador e rastreador — apontando para o conteúdo externo).

### 3. Implicações de design (consequência direta do TDAH)

- **Sem atrito:** nada de login, nada de menu profundo, nada de tela inicial com 10 botões. **O app abre direto na próxima run.**
- **Fluxo de baixo limiar:** 1 toque = começar a estudar. 1 toque = pular card. Sem confirmações.
- **Micro-recompensa imediata:** feedback visual/sonoro a cada acerto, streak, progresso visível no topo.
- **Ritmo de reels:** cards verticais, arraste/avanço — o usuário não precisa "ler" nem "decidir" — só responder.
- **Externalização da memória:** não confiar na candidata para lembrar o que estudou; o app planeja e mostra.
- **Zero culpa:** se a run for abandonada, o progresso parcial é salvo e retomável; sem tela de punição.

---

## 4. Arquitetura

### 4.1 Restrição estrutural

**Um único arquivo `index.html`**, autocontido, que funciona por `file://` em qualquer navegador moderno (Chrome/Edge/Firefox/Safari desktop e mobile).

**Proibições absolutas:**

- Nenhuma requisição de rede em runtime (zero `fetch`, zero `XMLHttpRequest`, zero `<script src>`, zero `<link rel="stylesheet">` externo, zero `@import`, zero fonte CDN, zero imagem remota).
- Nenhum passo de build, bundler, transpiler, framework ou dependência de terceiros (sem React/Vue/Tailwind/libs externas).
- Nenhum back-end, banco de dados, service worker obrigatório ou API.

**Consequências técnicas assumidas:**

- Sem `localStorage` garantido em modo privado / `file://` em alguns navegadores → persistência implementada com **camada de fallback**: `localStorage` → `IndexedDB` → `sessionStorage` → `file://` in-memory (com aviso discreto de "sessão não será salva").
- Sem `import`/`export` de módulos por `file://` (CORS em `file://` bloqueia ES modules em vários navegadores) → **um único script clássico inline** `<script>` (sem `type="module"`).
- Imagens e ícones → **SVG inline ou CSS puro**; fontes → **fontes do sistema** (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`).
- Áudio → **Web Audio API / Synthesis** (bipe gerado em código), sem arquivos de som.
- Ícone do app (PWA manifest inline via data-URI, se desejado) → **sem manifest externo**; alternativa: `<link rel="icon" href="data:image/svg+xml,...">`.

### 4.2 Camadas lógicas dentro do arquivo (separação por `<section>` + módulos JS internos)

```
index.html
├─ <style>            → Design system (tokens CSS), layout, componentes, animações
├─ <body>             → Shell fixo: header, #viewport (main), tabbar inferior, toast, modais
└─ <script>           → Núcleo JS (script único, IIFE)
   ├─ 1. Store        → estado central + persistência + migrações de esquema
   ├─ 2. Data Layer   → Syllabus (conteúdos), banco de questões, flipcards
   ├─ 3. Scheduler   → plano global → runs (gerador de runs adaptativas)
   ├─ 4. Engine       → motor de sessão (run): loop de cards + blocos de questões
   ├─ 5. Reviewer     → SM-2 simplificado, itens fracos, reforço na próxima run
   ├─ 6. UI/Views     → renderização por telas (Telas 1–8)
   ├─ 7. Analytics    → métricas, streaks, sumário,Insights
   └─ 8. Utils        → helpers (seeded shuffle, datas, formatação, eventos)
```

### 4.3 Modelo de dados (persistido)

```js
{
  version: 1,                    // migração de esquema
  profile: { name, examDate, dailyGoalMinutes, weekdayOnly: [1..6], startDate },
  syllabus: [                    // CONTEÚDOS GLOBAIS (hierarquia)
    { id, name, parentId, weight, order, discipline: 'Direito'|'Farmácia'|'Processo'|'Legislação'|'Admin' } ],
  runs: [                       // histórico de runs
    { id, startedAt, endedAt, plannedItems:[], items:[{syllabusId, type, correct, ts}],
      score, accuracy, status: 'done'|'partial'|'abandoned', reinforcedIds:[] } ],
  cards: { [syllabusId]: { ease, intervalDays, reps, lapses, dueAt, lastResult, weak } },
  progress: { [syllabusId]: { seen, correct, total, streak } },
  weakItems: { [questionId|syllabusId]: { score, lastSeenAt, reviews } },
  streak: { current, longest, lastStudyDate },
  settings: { sound, theme, cardSpeed, questionCountPerBlock, passThreshold }
}
```

### 4.4 Decisões de engenharia (princípios)

1. **Renderização por tela, estado único.** Um único `state` em memória; telas re-renderizam a partir dele. Sem framework.
2. **Determinismo por seed.** Shuffle usa PRNG com semente (`mulberry32`) para que uma run seja reproduzível e auditável.
3. **Não bloquear a UI.** Perguntas pré-carregadas por run inteira; nada de "carregando...".
4. **Degradação graciosa.** Toda feature externa (áudio, háptico, notificações, clipboard, storage) é opcional e verificada por `typeof`/`try-catch`.
5. **Acessibilidade:** teclado completo, `aria-live` para feedback, contraste AA, alvos de toque ≥ 44 px, respeitar `prefers-reduced-motion`.
6. **Tamanho alvo:** manter o arquivo em torno de 300–600 KB (HTML+CSS+JS+dados), carregando instantaneamente mesmo em 3G.
7. **Offline real:** também funciona em "Modo Avião" e sem permissões de rede; nenhum recurso reidratar.

---

## 5. Funcionalidade

### 5.1 Mapa de telas

| # | Tela | Nome | Propósito |
|---|---|---|---|
| 1 | `Home` | **Agora** | Ponto de entrada. Mostra a run sugerida, botão único "Estudar agora", streak, progresso do dia, meta de minutos. |
| 2 | `Run` | **Run** | Loop estilo reels: flashcards intercalados com blocos de questões. É o coração do app. |
| 3 | `Summary` | **Sumário** | Fim da run: acertos, por conteúdo, conteúdos fracos, o que foi reforçado, meta atingida. |
| 4 | `Plan` | **Plano** | Planejamento global: syllabus por disciplina com peso, % de progresso, módulos bloqueados/pendentes, ajuste de meta diária e data da prova. |
| 5 | `Stats` | **Progresso** | Streak, horas estudadas,heatmap diário, evolução da taxa de acerto, ranking de conteúdos fracos, gráfico por disciplina. |
| 6 | `Review` | **Revisão** | Fila SRS (itens com prazo vencido) + fila de reforços dos conteúdos fracos. |
| 7 | `Coach` | **Coach** | Coach pessoal: rotina, hora ideal de estudo, frases de foco, ajuste de plano com base no desempenho e na TDAH. |
| 8 | `Settings` | **Ajustes** | Sons, tamanho do texto, contraste, tema claro/escuro, backup/restore (export/import JSON), zerar progresso. |

### 5.2 O conceito de "Run"

Uma **run** é a unidade atômica de estudo, desenhada para caber na janela noturna da candidata.

**Estrutura fixa de uma run (configurável em Ajustes):**

```
RUN (padrão: ~30 min)
│
├─ FASE 1 — Aquecimento (4 flashcards)
│    4 cards de reciclagem (itens fracos / SRS vencido)
│    ritmo: 1 card a cada ~8–12 s, swipe/avanço automático opcional
│
├─ FASE 2 — Bloco de conteúdo novo
│    8–12 flashcards de UM conteúdo (conteúdo global selecionado pelo scheduler)
│    a cada 4 flashcards → INSERÇÃO DE BLOCO DE QUESTÕES (4–5 questões)
│
├─ FASE 3 — Reforço adaptativo
│    4 flashcards + 4–6 questões dos CONTEÚDOS DE MENOR DESEMPENHO
│    (os ids foram marcados em `reinforcedIds` e entram na próxima run)
│
└─ FASE 4 — Sumário (tela Summary)
     acerto por conteúdo, tempo, itens fracos, meta batida, streak atualizado
```

**Regras do motor de run:**

- **Cada run tem peso (número de itens) alvo = `minutos_disponíveis / minutos_por_item`.**
- **A cada 4 flashcards vêm 4–5 questões** do mesmo conteúdo (regra do pedido original).
- **Coleta de desempenho item a item:** cada card respondido (revelação + autoavaliação *facil / difícil*) e cada questão (certo / errado) alimenta o modelo de item fraco.
- **Interrupção segura:** se a candidata sair no meio, `status: 'partial'` é salvo ao voltar/fechar; cards respondidos não voltam.
- **Fim de run com chave:** `Esc` ou botão "encerrar" → sumário do que foi feito, sem penalidade.

### 5.3 Modo Reels (a interface da Run)

- Cards **verticais, full-viewport**, um por vez, empilhados (`transform: translateY` / `scale`).
- **Avanço:** arrastar para cima (swipe), `↓`/`Espaço`, ou auto-avanço com timer ajustável (modo "hands-free", útil para revisar no sofá).
- **Flipcard:** toque para revelar; dois botões grandes: **"Não sei"** / **"Sei"** (o "Não sei" inicia revisão em ~10 min conforme SRS).
- **Transição para o bloco de questões:** um banner "Treine agora" encerra a sequência de 4 cards.
- **Questões:** alternativas grandes, toque para responder, feedback imediato (certo/errado) + explicação curta + botão "Próxima".
- **Micro-recompensas:** streak de acertos dentro da run, contador de xp, som sutil (bipe) no acerto, sem som no erro (evita punição sensorial).
- **Indicador de progresso no topo:** `▮▮▮▯▯▯▯▯` + contagem `12/34`, sempre visível (ancora externa de atenção).

### 5.4 Adaptive Reinforcement (o diferencial)

- Cada conteúdo (`syllabusId`) e cada questão individual recebe um **score de fragilidade**:
  `weakScore = (1 - acerto) * recência + Repeticoes_ Erradas * pesoDisciplina`.
- Conteúdos com `weakScore` acima do limiar entram **automaticamente** nas próximas 2–3 runs (fila `weakItems`), conjugados com itens SRS vencidos.
- No **Sumário**, a app mostra explicitamente: *"Conteúdos a reforçar na próxima run: X (2 itens), Y (5 itens)"* — e a próxima run já nasce com eles.
- **Critério de reprovação por run:** `accuracy < passThreshold` (padrão 60%) → run marcada como *reforçável* e os conteúdos falhados entram na fila de reforço.

### 5.5 Planejamento global → Scheduler

- O **Syllabus** inicial cobre a banca PF/Perito Criminal — área Farmácia, organizado por disciplina e peso relativo (ex.: Direito Constitucional 10, Direito Processual Penal 10, Legislação Penal 8, Toxicologia 8, Farmacologia 8, Farmacognosia 6, Bromatologia 6, Toxicologia Forense, Criminalística, Legislação Sanitária,SUS, Direito Administrativo, Direito Tributário, Financeira, Economia, Portuguesa, Raciocínio Lógico, INFORMÁTICA, Conhecimentos Bancários...). *Estrutura inicial editável pela usuária.*
- **Scheduler** escolhe o próximo conteúdo por **maior (peso × prioridade do SRS × atraso)**, evitando conteúdo recently estudado (cooldown de 1 run por conteúdo).
- **Meta diária** (2 h × 6 dias = 12 h/semana) convertida em "runs alvo por dia" (≈ 2 runs de 30 min, ou 1 longa de 60 min à noite).
- **Plano de 10 meses:** o app mostra a data da prova, a data-alvo de conclusão de cada disciplina e o ritmo semanal necessário (`itens/semana`), alertando quando o ritmo real cai atrás do planejado.

### 5.6 SRS simplificado (revisão espaçada)

- Modelo **SM-2 simplificado**: por dificuldade → intervalo 1d → 3d → 7d → 14d → 30d → 60d; erro → intervalo reseta para 10 min (na sessão) e o item volta a 1d.
- Cards com *dueAt* vencido entram no "Aquecimento" da run.
- A fila de **Revisão** permite sessões de 5/10/20 min só com SRS, para os dias de pouco tempo.

### 5.7 Coach (coaching pessoal e rotina)

- Painel com a **rotina dela** (acordar 5h, treino 1h, trabalho 07h–18h, almoço 1h30, noite livre) e **sugestão de janela de estudo**: bloco de 21h–23h como "zona de foco", alternativa 05h00–05h50 (antes do treino) como "opção de baixo atrito" nos dias de exaustão.
- **Regra dos 5 minutos:** nos dias ruins, a run mínima é de 5 min (1 bloco curto) — mantém o streak e a rotina.
- **Frases de foco / micro-instruções** rotativas e curtas (TDAH-friendly): "só mais 1 card", "não precisa terminar hoje".
- **Micro-ciclo de rotina:** checklist de hábitos (acordar no horário, treino, 2h de estudo, revisão do resumo) com checkboxes por dia.
- **Alerta de sobrecarga:** se 3+ dias seguidos sem estudo → sugestão de "run de manutenção" e não de "recuperar tudo".

### 5.8 Sumário da Run (tela obrigatória)

1. Acerto geral (X/Y) e tempo total.
2. Barra por **conteúdo** com % de acerto (verde ≥ 70%, amarelo 50–69%, vermelho < 50%).
3. Lista de **itens fracos** (conteúdos + questões erradas) → button "Reforçar agora" (abre mini-run só com esses itens).
4. O que **já foi carregado** na próxima run (visibilidade do loop de reforço).
5. Streak atualizado + xp + meta do dia (barra de minutos).
6. Uma frase de coach ("Você acertou 8/10 em Toxicologia. Amanhã: 15 min de Farmacologia + 10 min de revisão.").

### 5.9 Dados iniciais (seed) embutidos

- **Syllabus completo** com pesos e ordem de revisão.
- **Banco de questões seed** (bloco inicial, ex. 200–400 questões curtas de banca, com alternativas e explicação de 1–2 linhas) — deve ser declaradamente **não-oficial / material de estudo próprio**, apontando para Estratégia/Gran Cursos para a teoria.
- **Flashcards seed** (≈ 300–500 cards curtos, formato "pergunta → resposta" de definição/regra/número legal), priorizando Farmácia forense e Direito.
- Botão "Carregar mais conteúdo" → permite colar/apender blocos de questões e cards em JSON, mantendo o app monolitico e utilizável offline com material próprio.

### 5.10 Persistência, backup e portabilidade

- Autosave a cada item respondido (debounced).
- **Exportar** dados → arquivo `.json` baixado via Blob/`<a download>`.
- **Importar** → `<input type="file">` + validação de esquema.
- Sem cloud: o backup é responsibility da usuário (recomendado no Coach).

---

## 6. Público-alvo (detalhamento)

| Aspecto | Descrição |
|---|---|
| **Primário** | Candidato(a) a Perito Criminal PF — área Farmácia, 10 meses pré-prova, TDAH, rotina de trabalho integral |
| **Idade/perfil** | Adulta jovem-média, formada em Farmácia, alta familiaridade com Concursos (Estratégia e Gran), mas baixa familiaridade com método de estudo e alta fricção de atenção |
| **Uso** | 100% **mobile** (celular no sofá à noite, no almoço, no ônibus), secundariamente desktop |
| **Frequência** | Diário, 2 h/dia × 6 dias/semana; ~12 h/semana; sessões de 5–45 min |
| **Dispositivo/ambiente** | Aparelho com 4G instável → exige carga instantânea e zero rede; viagens → offline obrigatório |
| **Emocional** | Cansaço pós-trabalho, culpa por atrasos, necessidade de progresso visível, aversão a telas de "pendências" |
| **Restrições** | Sem cartão de crédito, sem login, sem servidor → privacidade e portabilidade são diferenciais |

---

## 7. Princípios de experiência (guardrails)

1. **Uma tela principal, um botão principal.** "Estudar agora" > menus.
2. **Ritmo de reels, não de e-learning.** Nunca exigir scroll longo, nunca exigir leitura densa durante o estudo.
3. **Reforço > repetição.** Itens fracos voltam, sempre.
4. **Recompensa, não punição.** Erro = sinal de dado, não de fracasso visual.
5. **Recuperar o controle é fácil.** Abandonar uma run é permitido e sem perda de progresso já feito.
6. **O app é um coach, não um chefe.** Sugere, explica, ajusta — não cobra.
7. **Zero atrito técnico.** Sem cadastro, sem internet, sem instalar nada: abrir o `index.html` e estudar.

---

## 8. Roadmap (ordem sugerida de implementação)

| Fase | Entrega |
|---|---|
| **F1 — Fundação** | Shell, tokens CSS, Store + persistência, navegação, Home estática |
| **F2 — Dados** | Syllabus seed + banco de flashcards + questões seed |
| **F3 — Motor de run** | Loop de cards (reels), bloco de questões, autosave, encerramento |
| **F4 — Sumário + reforço** | Tela Summary, cálculo de itens fracos, injeção na run seguinte |
| **F5 — Scheduler** | Plano global, seleção de conteúdo, metas, ajuste por desempenho |
| **F6 — Progresso** | Stats, streaks, heatmap, gráficos (SVG inline) |
| **F7 — Coach + Revisão** | Coach, rotina, fila SRS, revisão rápida |
| **F8 — Polish** | Sons, háptico, temas, acessibilidade, PWA offline, export/import |

---

## 9. Riscos e como mitigamos

| Risco | Mitigação |
|---|---|
| Escopo inflado (telas demais) | Priorizar F1–F4; telas extra só entram com valor claro |
| Banco de questões/cartões insuficiente ou de baixa qualidade | Seed enxuto e claramente rotulado; mecanismo de importação JSON para ampliar |
| TDAH: app vira mais uma fonte de atrito | Regra do "1 toque", auto-avanço, sem telas de menu antes do estudo |
| Perda de dados (localStorage limpo) | Autosave + export/import + aviso de "sessão não salva" |
| Carga inicial pesada | Sem recursos externos; dados em JS puro; alvo < 600 KB |
| Questões de banca com copyright | Conteúdo original autoral; referência às plataformas como material complementar |

---

## 10. Glossário

- **Run** — sessão de estudo completa, com cards + questões + sumário.
- **Block (bloco)** — grupo de 4–5 questões inserido a cada 4 flashcards.
- **Syllabus (conteúdo global)** — nó do planejamento (ex.: "Direito Constitucional –Titre II").
- **Item fraco (weak item)** — conteúdo ou questão com desempenho abaixo do limiar, elegível a reforço.
- **Reforço (reinforcement)** — reinserção automática de itens fracos na run seguinte.
- **SRS** — *Spaced Repetition System* (revisão espaçada).
- **Reels** — padrão de consumo de micro-conteúdo vertical, sem rolagem, com avanço por gesto/tempo.
- **Offline-first** — o app é completo sem rede; a rede nunca é requisito.
