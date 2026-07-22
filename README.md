# deLoad.fit — Landing Page

Site gerado pelo [Eleventy](https://www.11ty.dev/) a partir de um template
(`src/index.njk`) e de arquivos de dado (`src/_data/*.yml`). Editar os `.yml`
diretamente ou pelo painel em `/admin` dá exatamente o mesmo resultado — o
painel só evita que quem edita precise ver YAML ou HTML.

## Como o conteúdo edita a página sem tocar em código

```
Alguém edita em /admin → salva → vira commit no Git
                                        ↓
                    Netlify roda "npm run build" (Eleventy, ~1s)
                                        ↓
              Sai HTML estático pronto em _site/, com o texto já dentro
                                        ↓
             Google e WhatsApp veem HTML puro — SEO nunca é afetado
```

## Estrutura

```
src/index.njk               o template da página inteira
src/_data/*.yml              todo o conteúdo editável (ver tabela abaixo)
src/admin/config.yml         define os campos que aparecem em /admin
src/admin/index.html         carrega o Decap CMS (versão fixada — não usar @latest)
src/assets/                  css, js, imagens, fontes, marca — copiados sem alteração
.eleventy.js                 configuração do build (filtros, extensão .yml, etc.)
netlify.toml                 comando de build, diretório publicado, cache
_site/                       saída do build — gerada, nunca editar à mão
```

## O que é editável em `/admin` — e o que não é

| Arquivo | Cobre |
|---|---|
| `hero.yml` | Título principal (H1), subtítulo, botões do topo |
| `ciclo.yml` | Dobra 2 — título, texto, telas do carrossel (imagem + texto de cada uma) |
| `contraste.yml` | Dobra 3 — comparativo Antes / deLoad.fit, ícone de cada linha |
| `diferenciais.yml` | Dobra 4 — títulos e números dos 5 cards de inteligência clínica |
| `app.yml` | Dobra 5 — mesmo formato da dobra 2 |
| `garantia.yml` | Dobra 6 |
| `planos.yml` | Dobra 7 — nome, preço mensal/anual e recursos de cada plano |
| `duvidas.yml` | Dobra 8 — perguntas e respostas do FAQ |
| `ctafinal.yml` | Dobra 9 |
| `footer.yml` | Texto de marca e linha de copyright do rodapé |

Ficam **fora do CMS** de propósito, porque não são texto de marketing:

- **Links de navegação** (nav, rodapé): presos a âncoras (`#planos`) e a
  atributos `data-link`/`data-cta` que o JavaScript lê. Editar o texto sem
  entender o link por trás quebra o clique.
- **Eixos do gráfico radar** (dobra 4): a posição de cada palavra é calculada
  para o desenho do hexágono — mudar o texto sem mudar a posição desalinha.
- **`seo.yml`**: title, meta description, Open Graph, dados da empresa para o
  schema. Fica em dado (para reaproveitar no HTML e no JSON-LD), mas não em
  `config.yml` — errar aqui derruba o SEO ou a prévia de compartilhamento.

Preço nos planos: o texto "Cobrado R$X uma vez no ano · você economiza R$Y"
é **calculado no build** a partir do mensal e do anual. Não existe campo para
editar esse texto — ele nunca fica com um preço novo e uma conta antiga.

Cards de carrossel (dobras 2 e 5): a quantidade é livre, adicionar ou remover
funciona sem tocar em HTML/CSS/JS — o contador (`01 / 05`) se recalcula sozinho.

## Configuração pendente no Netlify (só precisa ser feita uma vez)

O CMS não funciona só com os arquivos do repositório. No painel do site:

1. **Identity** → Enable Identity
2. Em **Identity → Registration**, escolher **Invite only** (senão qualquer
   pessoa se cadastra e edita o site)
3. **Identity → Services → Git Gateway** → Enable
4. Convidar o cliente em **Identity → Invite users**

Sem isso, `/admin` carrega mas trava na tela de login.

## Rodando localmente

```bash
npm install
npm run build   # gera _site/ uma vez
npm run serve   # ou: builda e serve com recarregamento automático
```

## Ao trocar CSS ou JS manualmente

O template referencia esses dois arquivos com `?v=N`. Editando-os, **suba o
número** em `src/index.njk`, senão o navegador do visitante pode continuar
com a versão antiga por até um dia (ver política de cache no `netlify.toml`).

## Endereço do site

`src/_data/seo.yml` tem um campo `site_url` que alimenta o canonical, o Open
Graph e as URLs do schema JSON-LD — hoje é `https://deloadfit.netlify.app/`,
o domínio que o Netlify gerou. Trocando para um domínio próprio no futuro,
atualize só ali (e o mesmo valor em `src/admin/config.yml`); o template
propaga sozinho para o resto da página.
