import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { parse } from "https://deno.land/std@0.203.0/yaml/mod.ts";

const CONFIG_URL = "https://github.com/qinyuanchun03/fast-webstack/raw/refs/heads/main/deno-webstack/config.yaml";

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