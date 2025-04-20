import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";
import yaml from "https://esm.sh/js-yaml@4.1.0";

const HTML_URL = "https://cdn.jsdelivr.net/gh/qinyuanchun03/fast-webstack1/index.html";
const CSS_URL = "https://cdn.jsdelivr.net/gh/qinyuanchun03/fast-webstack1/static/style.css";
const JS_URL  = "https://cdn.jsdelivr.net/gh/qinyuanchun03/fast-webstack1/static/script.js";
const CONFIG_URL = "https://cdn.jsdelivr.net/gh/qinyuanchun03/fast-webstack1/config.yaml";

function renderCards(sub: any) {
  return `<div class="cards">${sub.links.map((link: any) => `
    <div class="card">
      ${link.logo ? `<img class="logo" src="https://cdn.jsdelivr.net/gh/qinyuanchun03/fast-webstack1/images/favicons/${encodeURIComponent(link.logo)}" alt="logo" />` : ''}
      <a href="${link.url}" target="_blank">${link.title}</a>
      <div class="desc">${link.description || ''}</div>
    </div>
  `).join('')}</div>`;
}

function renderCategoryBlock(cat: any) {
  return `<div class="category-block">
    <h2>${cat.name}</h2>
    ${cat.subcategories.map((sub: any) => `
      <div class="subcategory-block">
        <h3>${sub.name}</h3>
        ${renderCards(sub)}
      </div>
    `).join('')}
  </div>`;
}

function renderCategoryList(config: any) {
  return config.categories.map(renderCategoryBlock).join('\n');
}

async function getConfig() {
  const resp = await fetch(CONFIG_URL);
  const yamlText = await resp.text();
  return parse(yamlText) as { categories: any[] };
}

function searchLinks(config: any, query: string) {
  const result: any[] = [];
  for (const cat of config.categories) {
    for (const sub of cat.subcategories) {
      for (const link of sub.links) {
        if (
          link.title.includes(query) ||
          (link.description && link.description.includes(query)) ||
          (link.url && link.url.includes(query))
        ) {
          result.push({
            ...link,
            category: cat.name,
            subcategory: sub.name,
          });
        }
      }
    }
  }
  return result;
}

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    // 1. 拉取 HTML 模板
    const htmlResp = await fetch(HTML_URL);
    let html = await htmlResp.text();

    // 2. 拉取并解析 YAML 配置
    const configResp = await fetch(CONFIG_URL);
    const yamlText = await configResp.text();
    const config = yaml.load(yamlText) as any;

    // 3. 生成分类区块 HTML
    const categoryListHtml = renderCategoryList(config);

    // 4. 注入 CSS、JS、分类区块内容
    html = html.replace(
      "</head>",
      `<link rel=\"stylesheet\" href=\"${CSS_URL}\" />\n</head>`
    );
    html = html.replace(
      "</body>",
      `<script src=\"${JS_URL}\"></script>\n</body>`
    );
    // 用正则替换整个 category-list 区块
    html = html.replace(/<section class=\"category-list\">[\s\S]*?<\/section>/, `<section class=\"category-list\">${categoryListHtml}</section>`);

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname === "/api") {
    const config = await getConfig();
    return new Response(JSON.stringify(config), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/search") {
    const config = await getConfig();
    const q = url.searchParams.get("q") || "";
    const result = searchLinks(config, q);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 其余路由交给 Deno Deploy 静态文件托管
  return new Response("Not found", { status: 404 });
}); 
