import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";

const CONFIG_URL = "https://github.com/qinyuanchun03/fast-webstack1/raw/refs/heads/main/config.yaml";
const CSS_URL = "https://github.com/qinyuanchun03/fast-webstack1/raw/refs/heads/main/static/style.css";

const resp = await fetch(CONFIG_URL);
const yamlText = await resp.text();
const config = parse(yamlText) as any;

function renderCards(sub) {
  return sub.links.map(link => `
    <div class="card">
      ${link.logo ? `<img class="logo" src="/${link.logo}" alt="logo" />` : ''}
      <a href="${link.url}" target="_blank">${link.title}</a>
      <div class="desc">${link.description || ''}</div>
    </div>
  `).join('');
}

function renderCategory(cat) {
  return `
  <section class="category-block">
    <h2>${cat.name}</h2>
    ${cat.subcategories.map(sub => `
      <div class="subcategory-block">
        <h3>${sub.name}</h3>
        <div class="cards">${renderCards(sub)}</div>
      </div>
    `).join('')}
  </section>
  `;
}

const allHtml = config.categories.map(renderCategory).join('\n');

const indexHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>高质量平台导航</title>
  <link rel="stylesheet" href="${CSS_URL}" />
</head>
<body>
  <header>
    <h1>高质量平台导航</h1>
  </header>
  <main>
    ${allHtml}
  </main>
  <footer>
    <small>Powered by Deno · 极简导航</small>
  </footer>
</body>
</html>
`;

console.log(indexHtml); 
