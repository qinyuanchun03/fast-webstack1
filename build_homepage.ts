import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";

const CONFIG_URL = "https://github.com/qinyuanchun03/fast-webstack1/raw/refs/heads/main/config.yaml";
const OUTPUT_INDEX = "./index.html";

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
  <link rel="stylesheet" href="/static/style.css" />
  <style>
    body { font-family: 'Segoe UI', 'PingFang SC', Arial, sans-serif; margin: 0; background: #f7f8fa; color: #222; }
    header { text-align: center; padding: 2em 1em 1em 1em; background: #fff; box-shadow: 0 2px 8px #0001; }
    header h1 { margin: 0 0 1em 0; font-size: 2em; font-weight: 600; letter-spacing: 2px; }
    main { max-width: 1200px; margin: 0 auto; padding: 2em 1em 1em 1em; }
    .category-block { margin-bottom: 2.5em; background: #fff; border-radius: 14px; box-shadow: 0 2px 12px #0001; padding: 1.5em 1.2em; }
    .category-block h2 { margin: 0 0 1em 0; font-size: 1.5em; color: #0077cc; border-left: 4px solid #0077cc; padding-left: 0.5em; }
    .subcategory-block { margin-bottom: 1.5em; }
    .subcategory-block h3 { margin: 0 0 0.7em 0; font-size: 1.15em; color: #444; font-weight: 500; }
    .cards { display: flex; flex-wrap: wrap; gap: 1.2em; }
    .card { background: #f7f8fa; border-radius: 10px; box-shadow: 0 2px 8px #0001; padding: 1em 0.9em 0.8em 0.9em; width: 250px; min-height: 100px; display: flex; flex-direction: column; gap: 0.4em; transition: box-shadow .2s, transform .2s; }
    .card:hover { box-shadow: 0 6px 24px #0077cc22; transform: translateY(-2px) scale(1.02); }
    .card a { text-decoration: none; color: #0077cc; font-weight: 600; font-size: 1.08em; margin-bottom: 0.2em; }
    .card .desc { color: #555; font-size: 0.97em; margin-bottom: 0.2em; }
    .card .logo { width: 22px; height: 22px; vertical-align: middle; margin-right: 0.5em; border-radius: 4px; background: #fff; }
    @media (max-width: 900px) { main { padding: 1em 0.2em; } .cards { justify-content: center; } .card { width: 95vw; max-width: 350px; } }
    @media (max-width: 600px) { header { padding: 1.2em 0.5em 0.5em 0.5em; } .category-block { padding: 1em 0.5em; } .cards { gap: 1em; } .card { padding: 1em 0.7em; } }
  </style>
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

await Deno.writeTextFile(OUTPUT_INDEX, indexHtml);

console.log("静态首页已生成:", OUTPUT_INDEX); 
