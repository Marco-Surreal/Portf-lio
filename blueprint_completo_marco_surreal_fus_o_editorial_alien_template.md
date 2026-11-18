# MARCO SURREAL (`@marcosurreal`) — Blueprint de Arquitetura, Direção de Arte & Animações

> **Objetivo do Documento:** Unificar a dinâmica estrutural, tipografia monumental e micro-interações do template **Alien (Oversight)** com a estética **Editorial Tattoo & Psychedelic 60s Luxe** desenvolvida para o artista multifacetado **Marco Surreal** (Tatuagem Old School / Oriental / Psicodélica, Design Gráfico e Cerâmica Autoral).

---

## 1. Conceito & Fusão Estética

A fusão parte do encontro entre o **brutalismo editorial de alto contraste** (linhas divisórias visíveis, tipografia display gigante em perspectiva, marquees infinitos com `#HASHTAGS` e menu overlay de tela cheia) e a **riqueza artesanal da tatuagem tradicional e dos cartazes psicodélicos de 1968** (papel algodão quente, tinta sumi, pigmentos laca vermilion, ouro ocre, índigo Ukiyo-e e verde floresta).

### Hierarquia de Atuação (`@marcosurreal`)
1. **Tatuagem Autoral (Foco Principal):** Old School Surreal, Oriental / Ukiyo-e e Psicodelia Anos 60.
2. **Design Gráfico & Direção de Arte (Foco Principal):** Cartazes Fillmore, capas de disco em vinil, tipografia e identidade visual.
3. **Cerâmica & Objetos Escultóricos (Ateliê Complementar):** Vasos totêmicos e peças únicas em grés de alta temperatura.
4. **E-commerce & Flash Book:** Venda de Flashes exclusivos 1/1 (tatuados apenas uma vez), serigrafias numeradas e peças de ateliê.

---

## 2. Design System & Tokens Visuais

### 2.1 Paleta Cromática (Tinta Sumi & Pigmentos 60s)
Substitui o preto/branco puro do template *Alien* por tons orgânicos de estúdio e gravura:

| Token | Hex | Uso na Interface |
| :--- | :--- | :--- |
| `--bg-cotton` | `#F4EFE6` | Fundo principal (Papel Algodão / Flash Sheet) |
| `--bg-cream` | `#EAE2D3` | Cards, superfícies secundárias e barras de filtro |
| `--ink-sumi` | `#121110` | Tipografia principal, bordas estruturais (`1.5px`), sombras sólidas |
| `--bg-forest` | `#162A24` | Seção de Loja / Flash Book e contrastes profundos |
| `--accent-vermilion` | `#D93829` | Laca japonesa / CTA principal, selos Hanko e destaques |
| `--accent-ochre` | `#E2A025` | Ouro mostarda anos 60 / Sacola, badges e efeitos hover |
| `--accent-indigo` | `#1F4E78` | Azul Ukiyo-e / Detalhes gráficos e ondas |
| `--accent-plum` | `#7B2D5B` | Ameixa psicodélica / Ornamentos místicas |
| `--accent-jade` | `#2B7A62` | Verde esmalte / Feedbacks de sucesso e cerâmica |

### 2.2 Tipografia Editorial & Monumental
Adaptando o contraste *Bebas Neue + Montserrat* do template *Alien* para uma assinatura psicodélica sofisticada:

- **Display Monumental (Títulos Hero & Marquees):** `'Cinzel Decorative'` ou `'Syne'` (Peso `800`/`900`, uppercase, tracking ajustado para impacto de cartaz).
- **Editorial Poético (Manifesto & Subtítulos):** `'Cormorant Garamond'` (Itálico `600`, trazendo elegância clássica).
- **Corpo & UI (Descrições):** `'Plus Jakarta Sans'` (`400`/`500`, alta legibilidade).
- **Técnico & Hashtags (`#MENU`, `#PROJECTS`, `#FLASH`):** `'Space Mono'` (`400`/`700`, uppercase, `letter-spacing: 0.18em`).

### 2.3 Texturas & Bordas
- **Granulação de Papel (`paper-grain`):** Overlay fixo com ruído fractal (`opacity: 0.04`, `pointer-events: none`) simulando papel algodão 300g.
- **Padrão Seigaiha:** Ondas japonesas sutis no fundo das seções Hero e Agendamento.
- **Linhas Estruturais (Estilo *Alien*):** Bordas sólidas de `1.5px solid #121110` conectadas por pequenos blocos quadrados (`6px × 6px` em `#121110`) nas extremidades das linhas divisórias.

---

## 3. Arquitetura da Página & Mapeamento do Template

A estrutura segue exatamente o fluxo rítmico do template **Alien**, enriquecido com as seções de **Flash Book / Loja** e **Agendamento**:

```text
[00] NAVBAR FIXA + OVERLAY MENU FULLSCREEN (#Menu) + BOTÃO SACOLA
 │
[01] HERO SECTION MONUMENTAL ("MARCO / SURREAL / TATTOO & DESIGN")
 │    ├── 3 Linhas de Texto Gigante em Perspectiva (3D Reveal)
 │    ├── Linha Vertical Animada com Blocos Terminais + Bio + Localização
 │    └── Imagem/Flash Sheet Flutuante com Parallax no Mouse/Scroll
 │
[02] INFINITE MARQUEE 01:  #TATTOO  ✦  #DESIGN  ✦  #PSICODELIA60S  ✦
 │
[03] SEÇÃO ABOUT / MANIFESTO ("A AGULHA, O GRID E O BARRO")
 │    ├── Linhas Horizontais Progressivas no Scroll
 │    ├── Composição Assimétrica de Duas Imagens (Ateliê + Pele) com Parallax Duplo
 │    └── Link "#AGENDAR SESSÃO"
 │
[04] INFINITE MARQUEE 02:  #PORTFÓLIO  ✦  #OBRAS  ✦  #ARCHIVE  ✦
 │
[05] GRID DE PORTFÓLIO (3 COLUNAS COM BORDAS ESTRUTURAIS)
 │    ├── Filtros: [Todos] [Tatuagem] [Design] [Cerâmica]
 │    └── Cards estilo "Alien":
 │         ├── Efeito Cortina Tripla na Imagem (_01, _02, _03 expandindo altura)
 │         ├── Faixa Marquee "VIEW FULL PROJECT ✦" no Hover
 │         └── Clique abre Modal de Ficha Técnica (Agulhas, Pigmentos, Grid)
 │
[06] INFINITE MARQUEE 03:  #FLASHBOOK  ✦  #LOJA  ✦  #EDIÇÕES1/1  ✦
 │
[07] SEÇÃO E-COMMERCE (FLASHES EXCLUSIVOS 1/1, PRINTS & CERÂMICA)
 │    ├── Fundo Verde Floresta (#162A24) com Cards em Papel Algodão
 │    └── Botão "+ Sacola" conectado ao Drawer Lateral
 │
[08] BRIEFING & AGENDAMENTO DE TATUAGEM / PROJETO
 │    └── Formulário interativo (Serviço, Vertente Estética, Parte do Corpo/Formato)
 │
[09] INFINITE MARQUEE 04:  #THE END  ✦  @MARCOSURREAL  ✦
 │
[10] FOOTER EDITORIAL + BOTÃO "VOLTAR AO TOPO" COM LINHA ANIMADA
```

---

## 4. Especificação das Animações & Micro-interações (Coreografia *Alien*)

Para reproduzir fielmente a sensação fluida e cinética do template de referência, implemente os seguintes comportamentos (via CSS + Vanilla JS / IntersectionObserver ou GSAP):

### 4.1 Menu Fullscreen Curtain (`#Menu`)
- **Estado Fechado:** `.nav-menu-wrapper` com `height: 0%` e `overflow: hidden`.
- **Ao Clicar em `#Menu`:**
  1. O painel expande de `height: 0%` para `100vh` em `0.65s` (`cubic-bezier(0.77, 0, 0.175, 1)`).
  2. Os links gigantes (`Portfólio`, `Flash & Loja`, `Manifesto`, `Agendar`) entram com *stagger* (atraso de `80ms` cada) partindo de `translate3d(0, 60px, 0)` para `translate3d(0, 0, 0)`.
  3. O bloco lateral de filosofia e links sociais (`#INSTAGRAM`, `#BEHANCE`, `#SPOTIFY`) sobe suavemente de `translate3d(0, 150px, 0)` com `opacity: 0 -> 1`.

### 4.2 Hero Perspective Reveal & Parallax
- **Entrada das 3 Palavras-Chave (`MARCO` / `SURREAL` / `ESTÚDIO`):**
  - Envolvidas em containers com `perspective: 1000px`.
  - Animam de `rotateX(-80deg) translate3d(0, 40px, 0)` e `opacity: 0` para posição neutra (`0deg`, `opacity: 1`) nos primeiros `900ms` após o carregamento.
- **Flash Sheet / Imagem Hero (`.hero-image-holder`):**
  - Responde sutilmente ao scroll (`translateY` negativo) e ao movimento do cursor, criando profundidade sobre o texto gigante.

### 4.3 Linhas Geométricas Progressivas (`.block-line` & `.lines`)
- No template *Alien*, linhas finas conectadas a pequenos quadrados sólidos crescem conforme o usuário rola a página:
  - `.block-line` (vertical na Hero): anima `height` de `0%` a `100%` vinculado ao progresso de scroll da seção Hero.
  - `.lines._02` e `.lines._03` (horizontais na seção Sobre): animam `width` de `0%` a `100%` quando entram na viewport.

### 4.4 Marquees Infinitos (`#ABOUT ME`, `#PROJECTS`, `#FLASH BOOK`, `#THE END`)
- Faixas horizontais de texto gigante (`font-size: clamp(3.5rem, 8vw, 7.5rem)`) duplicadas 3 vezes em linha (`display: flex; white-space: nowrap`), deslizando continuamente via `@keyframes marquee`:
  ```css
  @keyframes marquee {
    0% { transform: translate3d(0%, 0, 0); }
    100% { transform: translate3d(-33.333%, 0, 0); }
  }
  ```

### 4.5 Cards de Projeto com Cortina Tripla & Faixa Marquee no Hover
Esta é a assinatura visual mais marcante da grade de projetos do *Alien*:
1. **Camadas de Imagem:** Cada card possui a imagem base e duas camadas sobrepostas (`_02` e `_03`) com `height: 0%` e filtros cromáticos sutis (ex: sépia/vermilion e contraste invertido).
2. **No Hover do Card:**
   - As camadas `_02` e `_03` revelam-se em cascata (`height: 0% -> 100%` com `transition-delay: 0s` e `0.12s`).
   - O título sobe levemente (`translateY(-4px)`).
   - A faixa `.view-project` surge na base do card (`opacity: 0 -> 1`) exibindo o texto contínuo: `VER FICHA TÉCNICA ✦ VER FICHA TÉCNICA ✦`.
3. **No Clique:** Abre o **Modal de Ficha Técnica** (detalhando agulhas, pigmentos, dimensões ou especificações gráficas).

---

## 5. Funcionalidades de E-commerce & Estúdio

### 5.1 Sacola Lateral (Drawer)
- Acessível a qualquer momento pelo botão fixo na Navbar (`Sacola [0]`).
- Permite adicionar múltiplos itens (Flashes 1/1, Serigrafias, Cerâmicas), alterar quantidades (`+` / `-`), inserir observações (ex: *local do corpo para a tatuagem* ou *cupom*) e concluir a reserva com confirmação imediata.

### 5.2 Catálogo Inicial Recomendado (`@marcosurreal`)
- **Flash 1/1: Adaga, Serpente & Rosa Old School** — *Tatuado apenas 1 vez · R$ 780*
- **Flash 1/1: Máscara Kitsune & Lótus Cósmica** — *Oriental Contemporâneo · R$ 890*
- **Serigrafia "Cosmic Sound 1968" (A2)** — *Design Gráfico · Tiragem 30 cópias · R$ 260*
- **Print Fine Art "Fênix Ukiyo-e" (A3)** — *Papel Algodão 300g · R$ 190*
- **Vaso Totem "Olho do Sol" em Grés** — *Cerâmica Escultórica · Peça Única · R$ 540*

---

## 6. Prompt Pronto para Gerar o Código Completo

Se quiser gerar a versão HTML/CSS/JS completa unindo tudo isso em um único arquivo executável, utilize este prompt:

> *"Crie um site em arquivo único (`index.html`) para o artista **MARCO SURREAL (`@marcosurreal`)** seguindo fielmente a arquitetura, tipografia monumental, linhas divisórias com blocos terminais, menu overlay fullscreen, marquees infinitos (`#ABOUT`, `#PROJECTS`, `#FLASHBOOK`, `#THE END`) e hover de cortina tripla nos cards do template **Alien (Oversight)**, aplicando a paleta **Editorial Tattoo & Psychedelic 60s Luxe** (`#F4EFE6`, `#121110`, `#162A24`, `#D93829`, `#E2A025`, `#1F4E78`, `#7B2D5B`), fontes `Cinzel Decorative`, `Cormorant Garamond` e `Space Mono`, com portfólio filtrável (Tatuagem, Design, Cerâmica), modal de ficha técnica, loja com sacola lateral funcional e formulário de agendamento."*