# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Site de página única (portfólio) da psicóloga clínica **Jennyfer Brito Dias** (Terapia Cognitivo-Comportamental, CRP 13/11710). Vite + HTML/CSS/JS sem framework; animações com GSAP (ScrollTrigger, SplitText) e Lenis; Three.js só no fundo do hero. Todo o conteúdo e os comentários do código estão em português (pt-BR).

## Comandos

```bash
npm run dev              # http://localhost:5173  (npm run dev -- --host para abrir no celular pela rede)
npm run build            # dist/ — também gera robots.txt e sitemap.xml (plugin em vite.config.js)
npm run preview          # serve o build
npm run photo            # regenera public/img/*.webp a partir de assets/foto.png (sharp)
python scripts/subset-fonts.py   # regenera src/assets/fonts/ (requer: pip install fonttools brotli)
```

Não há testes nem linter. A verificação é visual/manual (ver "Como verificar").

## Arquitetura

- **Conteúdo só no `index.html`** (estático, indexável); o JS apenas anima. Textos provisórios estão marcados com `<!-- EDITAR -->`. O link do WhatsApp com mensagem pré-preenchida se repete em vários lugares (hero, cards, FAQ, contato, rodapé, botão flutuante): para mudá-lo, procure por `wa.me`. Ícones são `<symbol>` num `<svg hidden>` no topo do `<body>`.
- **`src/main.js`** define a ordem de inicialização: marca `window.__siteReady` (o script inline do `<head>` remove a classe `.js` após 4 s se o JS falhar, reexibindo o conteúdo); cria o Lenis (não cria com "reduzir movimento"), links de âncora, cursor e `revealOnFocus`; espera a fonte de títulos (máx. 2,5 s); inicia as seções **na ordem do DOM** (o pin de "Como funciona" precisa existir antes das seções abaixo dele) e por fim `ScrollTrigger.refresh()`.
- **`src/core/`**: `gsap.js` é o único lugar que registra plugins (importe gsap/ScrollTrigger/SplitText sempre daqui); `smooth-scroll.js` liga o Lenis ao `gsap.ticker` + `ScrollTrigger.update` e trata cliques em `#âncoras` (rola e move o foco); `motion.js` tem as checagens de "reduzir movimento"/capacidade do aparelho e `MOTION_CONDITIONS`; `reveal.js` tem os helpers de entrada (`revealLines`, `revealUp`, `revealFade`) e `revealOnFocus`.
- **Padrão das seções** (`src/sections/*.js`): cada uma exporta `initX()` e usa `gsap.matchMedia().add(MOTION_CONDITIONS, …)` com dois ramos — `reduced` (só fades curtos: sem pin, parallax, letra a letra, partículas nem cursor) e completo. Cada seção tem seu CSS em `src/styles/`, importado por `main.css` (ordem: fontes → tokens → base → componentes → seções).
- **Acessibilidade das animações (importante):** animações de entrada usam **`opacity`, nunca `autoAlpha`/`visibility`**, em qualquer conteúdo que possa ser focado ou lido. Com `visibility: hidden`, o Tab pulava seções inteiras e leitores de tela não liam o texto ainda não revelado. `revealOnFocus` conclui na hora as animações pendentes quando o foco cai dentro delas. `autoAlpha` só em elementos decorativos (`aria-hidden`) e na intro breve do hero.
- **Melhoria progressiva:** o CSS padrão é a versão estática (lista de passos, FAQ nativo); o JS acrescenta o modo animado. Ex.: "Como funciona" é uma lista até o JS adicionar `.is-pinned` (painel fixo, anel em `conic-gradient` controlado pela variável `--p`, fita de números 01–04). Na linha do tempo do pin, cada passo ocupa 1 unidade e a troca acontece em `i - 0.3` (o texto que sai some antes de o próximo entrar).
- **Hero:** nome dividido em letras com SplitText (desfoque + subida). As partículas (`hero-particles.js`, import dinâmico) só carregam se `canRunParticles()` permitir (sem "reduzir movimento", sem economia de dados/rede lenta, ≥4 núcleos e ≥4 GB quando informados, WebGL) e depois da intro; desligam sozinhas se a mediana do quadro passar de 26 ms e pausam fora da tela. A névoa em CSS (`.hero__fog`) é o fallback. O chunk do Three (~130 KB gzip) é esperado (`chunkSizeWarningLimit` foi aumentado).
- **Cérebro da Publicação** (`components/brain.js` + SVG inline no `index.html`): traços com `pathLength="1"` e `stroke-dasharray: 1` são "desenhados" animando `strokeDashoffset`; impulsos são criados dinamicamente e percorrem os caminhos `.brain__net` via `getPointAtLength`, acendendo o nó mais próximo do fim do caminho. Roda só com o SVG na tela (ScrollTrigger de visibilidade) e não roda com "reduzir movimento" (o desenho fica estático).
- **Outros pontos não óbvios:** a altura do trilho da Trajetória é calculada em JS no evento `refreshInit` do ScrollTrigger; o FAQ (`<details>` nativo) anima a altura, mantém uma resposta aberta por vez e chama `ScrollTrigger.refresh()` após abrir/fechar (a altura da página muda); o botão flutuante sincroniza a visibilidade com `progress > 0` em `onUpdate`/`onToggle`/`onRefresh` (só `onToggle` o escondia no fim exato da página e em saltos diretos).
- **Transbordo horizontal:** brilhos decorativos que passam da largura da tela exigem `overflow-x: clip` na seção (já usado em `.about`, `.process`; `.hero` e `.contact` usam `overflow: clip`). Ao criar brilhos novos, confira `document.documentElement.scrollWidth` em 360 px.
- Em desenvolvimento, `window.ScrollTrigger` fica exposto para depuração.

## Decisões de design

- **Cores** (`tokens.css`, fonte única da paleta — CSS usa as variáveis e o JS as lê com `cssVar()` de `core/css-var.js`): fundo `#0d0d0f`, marfim `#f3ede4`, destaque **vermelho escuro (rubi)** a pedido da cliente (antes houve terracota e depois marsala). Dois tons: `--c-accent` `#9b2226` só para preenchimentos (botões de contato, seleção), com texto marfim nele a 6,8:1; contra o fundo o botão fica em 2,45:1 — abaixo do ideal de 3:1, aceitável porque o texto identifica o botão; não escurecer mais. `--c-accent-light` `#cf6166` para textos pequenos, linhas finas, ícones e contorno de foco (5,1:1). `--c-accent-glow` para pontos luminosos (impulsos do cérebro, partículas). Transparências via `rgb(var(--accent-rgb) / α)` e `rgb(var(--accent-light-rgb) / α)`. Texto secundário `#9a948c` tem 6,5:1.
- **Fontes:** Newsreader (títulos, variável com eixo de tamanho óptico) + Manrope (texto, via Fontsource). A Cormorant Garamond do briefing foi trocada porque desenha o circunflexo minúsculo (ê, ô, â) alto e solto, o que prejudica o português ("você", "Experiência"). A Newsreader é servida a partir de `src/assets/fonts/`, recortada para peso 200–400 e tamanho óptico 12–72 por `scripts/subset-fonts.py`; o pacote `@fontsource-variable/newsreader` é só a fonte de origem (devDependency). Usar um peso fora de 200–400 exige regenerar os arquivos. Os `preload` do `index.html` apontam para os arquivos de fonte (o Vite reescreve para os nomes com hash).
- `.nowrap` (a partir de 360 px) mantém "Cognitivo-Comportamental" sem quebrar no hífen; as linhas do nome no hero não quebram a partir de 75rem.
- **Foto:** `npm run photo` corta 4% à direita e 6% embaixo (o briefing pedia remover um logo no canto inferior direito; nenhum era visível no arquivo recebido), converte para P&B com mistura de canais puxada para o vermelho, aplica vinheta e enquadra em 4:5 (`FOCUS_Y`). No CSS, a foto se funde ao fundo com duas máscaras (radial + linear, `mask-composite: intersect`) e `mix-blend-mode: lighten`; a variável `--r` anima a abertura da máscara.
- Fora do projeto por decisão do briefing: Motion, Rive, Spline. Lottie também não é usado (ícones em SVG + CSS são mais leves).
- O reset aplica `svg { display: block }`, por isso existe `[hidden] { display: none !important }` (o sprite de ícones usa `hidden`).

## Regras de conteúdo (ética do CFP)

- Não prometer cura nem resultados, não usar depoimentos, linguagem sensacionalista ou preço como propaganda (o FAQ diz que os valores são informados pelo WhatsApp).
- O CRP 13/11710 aparece obrigatoriamente no hero e no rodapé. O rodapé e o FAQ trazem o aviso de emergência (CVV 188, SAMU 192).
- "TCC" no site significa Terapia Cognitivo-Comportamental; na seção Publicação, escreva "Trabalho de Conclusão de Curso" por extenso.
- Confirmado pela cliente: título do TCC ("O impacto da dependência emocional nos relacionamentos amorosos tóxicos: Um estudo de revisão integrativa") e duração das sessões (1 hora, com opção de 30 minutos).
- Ainda pendentes de revisão: descrições dos 4 passos, textos dos cards, demais respostas do FAQ, a menção a "Atendimento online" e a frase de acolhimento do hero.

## SEO e arquivos de marca

- `.env` → `VITE_SITE_URL` (hoje `https://site-jennyfer.vercel.app`, o endereço de produção na Vercel; trocar se o site ganhar domínio próprio — uma variável de mesmo nome no painel da Vercel tem prioridade sobre o `.env`). É substituído no `index.html` via `%VITE_SITE_URL%` (canonical, Open Graph, JSON-LD) e usado pelo plugin `seo-files` do `vite.config.js` para gerar `robots.txt` e `sitemap.xml`.
- JSON-LD no `<head>`: `WebSite` + `Person` (CRP em `hasCredential`) + `MedicalBusiness` (sem endereço: atendimento online).
- `public/og-image.jpg`, `public/apple-touch-icon.png` e `public/favicon-32.png` saem dos modelos em `scripts/brand/` (abertos pelo servidor de dev em `/scripts/brand/og-image.html` a 1200×630 e `/scripts/brand/touch-icon.html` a 180×180, capturados como imagem; o favicon de 32 px é a redução do ícone). Esses modelos não entram no build.

## Como verificar

Sem testes automatizados; confira no navegador:
- desktop 1440×900 e 1536×730 (o hero inteiro, com botão e CRP, precisa caber na primeira tela);
- celular 390×664 e 360×640 (alturas próximas às do navegador do Instagram, de onde vem a maior parte dos acessos);
- "reduzir movimento" ativado;
- Tab percorrendo a página inteira;
- ausência de rolagem lateral em 360 px.

Últimos resultados do Lighthouse: celular 94 / 100 / 100 / 100 e desktop 100 / 100 / 100 / 100 (desempenho / acessibilidade / boas práticas / SEO); axe-core sem violações.
