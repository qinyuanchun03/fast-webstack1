let allData = null;
let currentCategory = null;
let currentSubcategory = null;
let staticLinks = [];

function extractStaticLinks() {
  // 从已渲染的卡片中提取数据
  const cards = document.querySelectorAll('#cards .card');
  if (!cards.length) return [];
  return Array.from(cards).map(card => {
    const a = card.querySelector('a');
    const desc = card.querySelector('.desc');
    const cat = card.querySelector('.cat');
    const logo = card.querySelector('.logo');
    const [category, subcategory] = (cat?.textContent || '').split(' / ');
    return {
      title: a?.textContent || '',
      url: a?.href || '',
      description: desc?.textContent || '',
      logo: logo?.getAttribute('src')?.replace(/^\//, ''),
      category: category?.trim() || '',
      subcategory: subcategory?.trim() || ''
    };
  });
}

function getFilteredLinks() {
  let links = staticLinks.length ? staticLinks : [];
  const q = document.getElementById('search').value.trim().toLowerCase();
  if (!links.length) return [];
  return links.filter(link => {
    const match =
      link.title.toLowerCase().includes(q) ||
      (link.description && link.description.toLowerCase().includes(q)) ||
      (link.url && link.url.toLowerCase().includes(q)) ||
      (link.category && link.category.toLowerCase().includes(q)) ||
      (link.subcategory && link.subcategory.toLowerCase().includes(q));
    if (currentCategory && link.category !== currentCategory) return false;
    if (currentSubcategory && link.subcategory !== currentSubcategory) return false;
    return !q || match;
  });
}

function renderCards() {
  const cards = document.getElementById('cards');
  const links = getFilteredLinks();
  if (links.length === 0) {
    cards.innerHTML = '<div style="color:#aaa;text-align:center;width:100%;padding:2em 0;">无匹配结果</div>';
    return;
  }
  cards.innerHTML = '';
  links.forEach(link => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      ${link.logo ? `<img class="logo" src="/${link.logo}" alt="logo" />` : ''}
      <a href="${link.url}" target="_blank">${link.title}</a>
      <div class="desc">${link.description || ''}</div>
      <div class="cat">${link.category} / ${link.subcategory}</div>
    `;
    cards.appendChild(el);
  });
}

function renderCategoryNav(categories) {
  const nav = document.getElementById('category-nav');
  nav.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.textContent = '全部';
  allBtn.className = !currentCategory ? 'active' : '';
  allBtn.onclick = () => {
    currentCategory = null;
    currentSubcategory = null;
    renderCards();
    renderCategoryNav(categories);
  };
  nav.appendChild(allBtn);
  // 动态生成分类按钮
  const cats = Array.from(new Set(staticLinks.map(l => l.category)));
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = currentCategory === cat ? 'active' : '';
    btn.onclick = () => {
      currentCategory = cat;
      currentSubcategory = null;
      renderCards();
      renderCategoryNav(categories);
    };
    nav.appendChild(btn);
  });
}

document.getElementById('search').addEventListener('input', renderCards);

document.addEventListener('DOMContentLoaded', () => {
  staticLinks = extractStaticLinks();
  renderCategoryNav();
});

document.getElementById('category-nav').addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON' && currentCategory) {
    // 二级分类弹窗
    const cat = allData.categories.find(c => c.name === currentCategory);
    if (cat && cat.subcategories.length > 1) {
      const subBtns = cat.subcategories.map(sub =>
        `<button class="${currentSubcategory === sub.name ? 'active' : ''}" onclick="window.setSubcategory('${sub.name}')">${sub.name}</button>`
      ).join('');
      const popup = document.createElement('div');
      popup.style = 'position:fixed;top:70px;left:0;right:0;z-index:99;text-align:center;background:#fff;padding:1em 0;box-shadow:0 2px 12px #0002;';
      popup.innerHTML = `<div style="margin-bottom:1em;font-weight:bold;">选择子分类</div>${subBtns}<div><button onclick="window.closeSubcategory()">关闭</button></div>`;
      document.body.appendChild(popup);
      window.setSubcategory = (name) => {
        currentSubcategory = name;
        renderCards();
        document.body.removeChild(popup);
      };
      window.closeSubcategory = () => document.body.removeChild(popup);
    }
  }
});

async function fetchData() {
  const res = await fetch('/api');
  return res.json();
}

fetchData().then(data => {
  allData = data;
  renderCategoryNav(data.categories);
  renderCards();
}); 