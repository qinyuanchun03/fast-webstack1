import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";

const CONFIG_URL = "https://github.com/qinyuanchun03/fast-webstack1/raw/refs/heads/main/config.yaml";
const INDEX_TEMPLATE = "./static/index.html";
const OUTPUT_INDEX = "./index.html";

const resp = await fetch(CONFIG_URL);
const yamlText = await resp.text();
const config = parse(yamlText) as any;

function renderCards(config: any) {
  let html = "";
  for (const cat of config.categories) {
    for (const sub of cat.subcategories) {
      for (const link of sub.links) {
        html += `
<div class="card">
  ${link.logo ? `<img class="logo" src="/${link.logo}" alt="logo" />` : ""}
  <a href="${link.url}" target="_blank">${link.title}</a>
  <div class="desc">${link.description || ""}</div>
  <div class="cat">${cat.name} / ${sub.name}</div>
</div>
`;
      }
    }
  }
  return html;
}

const cardsHtml = renderCards(config);

let indexHtml = await Deno.readTextFile(INDEX_TEMPLATE);
indexHtml = indexHtml.replace(
  '<div id="cards"></div>',
  `<div id="cards">\n${cardsHtml}\n</div>`
);

await Deno.writeTextFile(OUTPUT_INDEX, indexHtml);

console.log("静态首页已生成:", OUTPUT_INDEX); 
