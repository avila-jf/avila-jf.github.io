# Portfólio de Fotografia

Site estático de fotografia (paisagem, retrato e rua) com visual escuro e cinematográfico.
Feito com [Astro](https://astro.build), publicado no GitHub Pages.

🔗 **Site no ar:** https://avila-jf.github.io

<!-- Depois de publicar, tire um print do site e coloque aqui: ![Print do site](docs/print.png) -->

## Destaques técnicos

- **Galeria automática:** basta soltar as fotos na pasta certa, sem escrever HTML.
- **Imagens otimizadas:** o Astro converte para WebP e gera vários tamanhos (`srcset`), então o celular baixa só o necessário.
- **Carregamento sob demanda** (`loading="lazy"`) para as fotos fora da tela.
- **Lightbox próprio** em JavaScript puro, com `<dialog>` nativo, teclado (← → Esc) e gesto de deslizar no celular.
- **Mobile-first**, com menu responsivo e grade estilo masonry feita só com CSS (`columns`).
- **Acessibilidade:** textos alternativos, `aria-*`, foco visível e respeito a `prefers-reduced-motion`.
- **Deploy contínuo:** cada `git push` publica o site sozinho via GitHub Actions.

## Rodando no seu computador

Precisa do [Node.js](https://nodejs.org) (versão LTS).

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # abre em http://localhost:4321
npm run build    # gera o site final na pasta dist/
```

## Adicionando fotos

Coloque os arquivos `.jpg`, `.png` ou `.webp` em:

```
src/assets/fotos/paisagem/
src/assets/fotos/retrato/
src/assets/fotos/rua/
```

- **Ordem:** comece o nome com um número: `01-...`, `02-...`
- **Legenda:** o resto do nome vira a legenda: `03-neblina-na-serra.jpg` → "neblina na serra"
- **Capa da home:** defina `capaPrincipal` em `src/data/site.ts` (ex.: `'paisagem/01-sol-sobre-a-baia'`)
- **Capa de cada categoria:** campo `capa` da categoria em `src/data/site.ts`
- **Slider da home:** lista `destaques` em `src/data/site.ts`

## Projetos de programação

A página `/projetos` e a seção "Também programo" da home leem a lista `projetos` em `src/data/site.ts`.
Para os destaques, coloque um print do site em `src/assets/projetos/<nome>.jpg` e marque `destaque: true`.
- **Foto da página Sobre:** `src/assets/eu.jpg`

Dica: exporte do Lightroom com o lado maior em 2400 px e qualidade de ~85%.

## Estrutura

```
src/
├── data/site.ts          ← seu nome, bio, contatos e categorias (comece por aqui!)
├── styles/global.css     ← cores e fontes
├── layouts/Base.astro    ← "moldura" de todas as páginas (head, menu, rodapé)
├── components/
│   ├── Nav.astro         ← menu
│   ├── Galeria.astro     ← grade de fotos
│   ├── Lightbox.astro    ← foto em tela cheia
│   └── Rodape.astro
├── lib/
│   ├── fotos.ts          ← lê as fotos das pastas
│   └── url.ts            ← monta links que funcionam no GitHub Pages
└── pages/                ← cada arquivo aqui vira uma página
    ├── index.astro       → /
    ├── [categoria].astro → /paisagem, /retrato, /rua
    ├── sobre.astro       → /sobre
    └── contato.astro     → /contato
```

## Ideias para praticar

- [ ] Trocar a cor `--destaque` em `global.css` e ver o site mudar
- [ ] Criar uma categoria nova (ex.: "Eventos") só editando `site.ts` e criando a pasta
- [ ] Mostrar os dados da foto (câmera, abertura, ISO) no lightbox
- [ ] Criar uma página `/links` estilo "linktree" para a bio do Instagram
- [ ] Adicionar um contador "foto 3 de 12" no lightbox
- [ ] Filtro na home para alternar entre categorias sem trocar de página
