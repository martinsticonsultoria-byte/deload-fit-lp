# deLoad.fit — Landing Page

Site estático, sem build. O que está na raiz é exatamente o que vai ao ar.

## Estrutura

```
index.html                  a página inteira
assets/css/                 design-system.css
assets/js/                  interactions.js
assets/images/              capturas da plataforma + og-cover.jpg (compartilhamento)
assets/brand/               logos, ícones e selos das lojas
assets/fonts/               Space Grotesk (local, sem CDN)
netlify.toml                diretório publicado e políticas de cache
```

Nenhum recurso externo é carregado: sem CDN de fonte, de ícone ou de script.
Os ícones são um sprite SVG embutido no próprio `index.html`.

## Publicação

O Netlify publica a raiz do repositório. Todo push na `main` republica o site.

## Ao trocar CSS ou JS

O HTML referencia esses dois arquivos com `?v=N`. Ao editá-los, **suba o número**
nas tags correspondentes do `index.html`, senão o navegador do visitante pode
continuar com a versão antiga por até um dia.

## Pendência antes de divulgar

O `<head>` tem um bloco de comentário marcando a URL definitiva do site. Ela se
repete em `canonical`, `og:url` e `og:image`, e também no schema JSON-LD no fim
do arquivo. Se o endereço final não for `https://www.deloadfit.app/`, troque em
todos antes de divulgar o link.
