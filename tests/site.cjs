/* Testes do site Clareira Psicologia com Playwright.
   Como rodar, a partir da pasta do site:
     node tests/site.cjs
   O script sobe um servidor local (python3 -m http.server 8305), abre a página
   em três tamanhos de tela (1280x900, iPhone 13 e 320px), verifica erros de
   console, rolagem horizontal, textos cortados e as quatro funções, e salva
   capturas em tests/saida/. Com SHOTS_DIR definido, salva também as capturas
   de abertura em 1440x900 e no celular nessa pasta. */

const { chromium, devices } = require("playwright");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const PORTA = process.env.PORTA || 8305;
const RAIZ = path.resolve(__dirname, "..");
const URL = `http://127.0.0.1:${PORTA}/`;
const SAIDA = path.join(__dirname, "saida");
const SHOTS_DIR = process.env.SHOTS_DIR || "";
fs.mkdirSync(SAIDA, { recursive: true });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function sobeServidor() {
  const proc = spawn("python3", ["-m", "http.server", String(PORTA), "--bind", "127.0.0.1"], { cwd: RAIZ, stdio: "ignore" });
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(URL);
      if (r.ok) return proc;
    } catch (_) { /* ainda subindo */ }
    await espera(150);
  }
  proc.kill();
  throw new Error("Servidor não subiu na porta " + PORTA);
}

const VIEWPORTS = [
  { nome: "computador", opcoes: { viewport: { width: 1280, height: 900 } } },
  { nome: "iphone13", opcoes: { ...devices["iPhone 13"] } },
  { nome: "320px", opcoes: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
];

let falhas = 0;
function confere(cond, msg) {
  if (cond) console.log("  ok   " + msg);
  else { falhas++; console.log("  FALHA " + msg); }
}

async function medeOverflow(page) {
  return page.evaluate(() => {
    const larg = document.documentElement.clientWidth;
    const rolagem = document.documentElement.scrollWidth > larg + 1;
    const cortados = [];
    const vistos = document.querySelectorAll("h1,h2,h3,p,li,label,button,a,summary,dt,dd,span,legend");
    for (const el of vistos) {
      if (el.closest("[hidden]") || el.hidden) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || el.classList.contains("visualmente-oculto")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > larg + 1) cortados.push(el.tagName + ":" + (el.textContent || "").trim().slice(0, 40));
      if (cs.overflow !== "visible" && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== "ellipsis") {
        cortados.push("ovf " + el.tagName + ":" + (el.textContent || "").trim().slice(0, 40));
      }
    }
    return { rolagem, cortados: cortados.slice(0, 8), larg };
  });
}

async function testaFuncoes(page, nome, desk) {
  // 1. Modalidade + agenda
  await page.click('input[name="modalidade"][value="online"]', { force: true });
  const dias = page.locator(".dia:not([disabled])");
  confere((await dias.count()) > 0 || (await page.locator('[data-semana="1"]').isEnabled()), `${nome}: agenda desenhou dias`);
  if ((await dias.count()) === 0) { await page.click('[data-semana="1"]'); }
  await page.locator(".dia:not([disabled])").first().click();
  await page.locator(".horario").first().click();
  const resumo = await page.locator("[data-resumo-texto]").textContent();
  confere(/Pré-reserva simulada/.test(resumo) && /online/.test(resumo), `${nome}: horário escolhido gera resumo (${resumo.slice(0, 60)}...)`);
  await page.screenshot({ path: path.join(SAIDA, `${nome}-agenda.png`), fullPage: true, clip: await clipDe(page, "#atendimento") });
  await page.click("[data-levar]");
  await espera(400);
  confere((await page.inputValue("#f-modalidade")) === "online", `${nome}: "Levar para o contato" preencheu a modalidade`);
  confere((await page.inputValue("#f-horario")).length > 5, `${nome}: "Levar para o contato" preencheu o horário`);

  // 2. Primeira sessão em passos
  await page.click('[data-passo="2"]');
  confere((await page.textContent("[data-passo-etiqueta]")).includes("3 de 5"), `${nome}: passo 3 abre pelo clique`);
  await page.click("[data-passo-prox]");
  confere((await page.textContent("[data-passo-titulo]")).includes("perguntas"), `${nome}: botão Próximo avança`);
  await page.screenshot({ path: path.join(SAIDA, `${nome}-passos.png`), fullPage: true, clip: await clipDe(page, "#primeira-sessao") });

  // 3. Perguntas com busca
  await page.fill("[data-busca]", "sigilo");
  const visiveis = await page.locator("[data-faq-item]:not([hidden])").count();
  confere(visiveis >= 1 && visiveis < 10, `${nome}: busca "sigilo" filtra (${visiveis} visíveis)`);
  await page.screenshot({ path: path.join(SAIDA, `${nome}-perguntas.png`), fullPage: true, clip: await clipDe(page, "#perguntas") });
  await page.fill("[data-busca]", "xyzxyz");
  confere(!(await page.locator("[data-faq-vazio]").isHidden()), `${nome}: busca sem resultado mostra aviso`);
  await page.fill("[data-busca]", "");

  // 4. Formulário: erros e depois resumo
  await page.click('[data-form] button[type="submit"]');
  confere((await page.textContent("#e-nome")).length > 0, `${nome}: formulário vazio marca erro no nome`);
  confere((await page.textContent("#e-ciente")).length > 0, `${nome}: formulário vazio exige a caixa de ciência`);
  await page.fill("#f-nome", "Pessoa de Teste");
  await page.fill("#f-email", "pessoa@exemplo.com.br");
  await page.fill("#f-fone", "65900000000");
  await page.selectOption("#f-modalidade", "presencial");
  await page.fill("#f-msg", "Gostaria de conversar sobre ansiedade no trabalho.");
  await page.check("#f-ciente", { force: true });
  await page.click('[data-form] button[type="submit"]');
  await espera(600);
  const bilhete = await page.textContent("[data-bilhete-conteudo]");
  confere(!(await page.locator("[data-bilhete-conteudo]").isHidden()) && bilhete.includes("Pessoa de Teste") && bilhete.includes("(65) 90000-0000"), `${nome}: resumo do contato aparece com os dados`);
  await page.screenshot({ path: path.join(SAIDA, `${nome}-contato.png`), fullPage: true, clip: await clipDe(page, "#contato") });
}

async function clipDe(page, sel) {
  // O topo fixo some da captura recortada (só na captura; o site não muda).
  await page.evaluate(() => { const t = document.querySelector(".topo"); if (t) t.style.position = "static"; });
  await page.locator(sel).scrollIntoViewIfNeeded();
  await espera(250);
  return page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { x: 0, y: Math.max(0, r.top + window.scrollY), width: document.documentElement.clientWidth, height: Math.min(r.height, 2400) };
  }, sel);
}

(async () => {
  const servidor = await sobeServidor();
  const browser = await chromium.launch();
  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n== ${vp.nome} ==`);
      const ctx = await browser.newContext(vp.opcoes);
      const page = await ctx.newPage();
      const erros = [];
      page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
      page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
      page.on("requestfailed", (r) => erros.push("request: " + r.url()));
      await page.goto(URL, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      if (vp.nome === "iphone13") {
        await page.click(".menu-botao");
        confere(await page.locator("#menu").isVisible(), `${vp.nome}: menu abre no celular`);
        await page.click("#menu a[href='#perguntas']");
        await espera(300);
        confere(!(await page.locator("#menu").isVisible()), `${vp.nome}: menu fecha ao escolher seção`);
        await page.evaluate(() => window.scrollTo(0, 0));
      }

      await page.screenshot({ path: path.join(SAIDA, `${vp.nome}-inteira.png`), fullPage: true });
      await testaFuncoes(page, vp.nome, vp.nome === "computador");

      const med = await medeOverflow(page);
      confere(!med.rolagem, `${vp.nome}: sem rolagem horizontal (largura ${med.larg})`);
      confere(med.cortados.length === 0, `${vp.nome}: sem textos cortados ${med.cortados.length ? JSON.stringify(med.cortados) : ""}`);
      confere(erros.length === 0, `${vp.nome}: sem erros de console ${erros.length ? JSON.stringify(erros) : ""}`);

      // 404
      await page.goto(URL + "404.html", { waitUntil: "networkidle" });
      confere((await page.textContent("h1")).includes("não existe"), `${vp.nome}: 404 carrega`);
      await ctx.close();
    }

    if (SHOTS_DIR) {
      fs.mkdirSync(SHOTS_DIR, { recursive: true });
      const c1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p1 = await c1.newPage();
      await p1.goto(URL, { waitUntil: "networkidle" });
      await p1.evaluate(() => document.fonts.ready);
      await espera(2500);
      await p1.screenshot({ path: path.join(SHOTS_DIR, "psicologia-desk.png") });
      await c1.close();
      const c2 = await browser.newContext({ ...devices["iPhone 13"] });
      const p2 = await c2.newPage();
      await p2.goto(URL, { waitUntil: "networkidle" });
      await p2.evaluate(() => document.fonts.ready);
      await espera(2500);
      await p2.screenshot({ path: path.join(SHOTS_DIR, "psicologia-cel.png") });
      await c2.close();
      console.log("\nCapturas de abertura em " + SHOTS_DIR);
    }
  } finally {
    await browser.close();
    servidor.kill();
  }
  console.log(falhas === 0 ? "\nTudo passou." : `\n${falhas} verificação(ões) falharam.`);
  process.exit(falhas === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
