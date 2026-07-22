const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  // Eleventy só lê .json/.js como dado por padrão — sem isto, os arquivos
  // em src/_data/*.yml (o que o CMS edita) são ignorados em silêncio, sem
  // erro nenhum, e cada {% for %} que depende deles sai vazio.
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // assets e o painel /admin vão para a saída sem passar pelo template engine.
  // O ignore explícito importa: .html é um formato de template válido para o
  // Eleventy, então sem isto ele tentaria interpretar admin/index.html como
  // Nunjucks (hoje inofensivo, mas só por não ter chaves duplas por coincidência).
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");

  // "6.2" -> "6,2" — só os números que o cliente edita usam vírgula na tela;
  // o schema JSON-LD precisa do ponto original, então filtra só na exibição.
  eleventyConfig.addFilter("pt", (num) => String(num).replace(".", ","));

  // preço mensal e anual (mesmo valor que o cliente edita) -> total cobrado
  // no ano e quanto ele economiza. Calculado aqui para nunca dessincronizar
  // do texto "Cobrado R$X · você economiza R$Y" que ficaria errado se
  // alguém editasse o preço sem lembrar de atualizar esse texto também.
  eleventyConfig.addFilter("brl", (num) =>
    Number(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  // 1 -> "01" — numeração dos cards do carrossel (Passo 01, 02...)
  eleventyConfig.addFilter("pad2", (num) => String(num).padStart(2, "0"));

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
