import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pages = ["index.html", "cursos.html", "laboratorios.html", "projetos.html", "contato.html"];
const required = [
  ...pages,
  "styles.css",
  "script.js",
  "README.md",
  "LICENSE",
  ".github/workflows/pages.yml",
  "assets/site-icon.svg",
  "assets/campus-tech.svg",
  "assets/vilhena.png"
];

for (const file of required) statSync(join(root, file));

const css = readFileSync(join(root, "styles.css"), "utf8");
const js = readFileSync(join(root, "script.js"), "utf8");

if (!css.includes("@media")) throw new Error("CSS responsivo ausente");
if (!css.includes("axis-board")) throw new Error("Eixos formativos sem estilo");
if (!css.includes("project-showcase")) throw new Error("Vitrine de projetos sem estilo");
if (!js.includes("localStorage")) throw new Error("Tema com localStorage ausente");
if (!js.includes("clipboard")) throw new Error("Botão de copiar endereço ausente");
if (!js.includes("data-course-toggle")) throw new Error("Cards expansíveis de cursos ausentes");

const forbidden = ["fetch(", "axios", "XMLHttpRequest", "WebSocket", "sendBeacon"];
for (const token of forbidden) {
  if (js.includes(token)) throw new Error(`Chamada externa proibida: ${token}`);
}

for (const page of pages) {
  const html = readFileSync(join(root, page), "utf8");
  for (const link of pages) {
    if (!html.includes(link)) throw new Error(`${page} não contém link para ${link}`);
  }
  if (!html.includes("Projeto demonstrativo não oficial")) {
    throw new Error(`${page} sem aviso de não oficialidade`);
  }
  if (!html.includes("styles.css") || !html.includes("script.js")) {
    throw new Error(`${page} sem CSS ou JS`);
  }
}

const index = readFileSync(join(root, "index.html"), "utf8");
const cursos = readFileSync(join(root, "cursos.html"), "utf8");
const laboratorios = readFileSync(join(root, "laboratorios.html"), "utf8");
const projetos = readFileSync(join(root, "projetos.html"), "utf8");
const contato = readFileSync(join(root, "contato.html"), "utf8");

for (const phrase of ["Manifesto EETEPA", "Eixos formativos", "Transparência da demo"]) {
  if (!index.includes(phrase)) throw new Error(`Home sem bloco obrigatório: ${phrase}`);
}
if (!cursos.includes("Trilhas de projeto por curso")) throw new Error("Cursos sem trilhas de projeto");
if (!laboratorios.includes("Ecossistema maker")) throw new Error("Laboratórios sem ecossistema maker");
if (!projetos.includes("Do protótipo ao GitHub")) throw new Error("Projetos sem fluxo de portfólio");
if (!contato.includes("Política de dados")) throw new Error("Contato sem política de dados");

const courseCount = (cursos.match(/<article class="course-card/g) || []).length;
if (courseCount !== 14) throw new Error(`Quantidade de cursos inválida: ${courseCount}`);
const projectCount = (projetos.match(/<article class="project-card-premium/g) || []).length;
if (projectCount !== 6) throw new Error(`Quantidade de projetos inválida: ${projectCount}`);

for (const course of [
  "Técnico em Administração",
  "Técnico em Rede de Computadores",
  "Técnico em Ciências de Dados",
  "Técnico em Sistemas de Energia Renováveis",
  "Técnico em Transações Imobiliárias"
]) {
  if (!cursos.includes(course)) throw new Error(`Curso ausente: ${course}`);
}

const publicTextFiles = required.filter((file) => !file.startsWith(".github/") && file !== "LICENSE" && !file.endsWith(".png") && !file.endsWith(".svg"));
const allText = publicTextFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
const sensitive = [
  /ppl-ai-file-upload/i,
  /amazonaws/i,
  /CPF/i,
  /processamento de sinais/i,
  /D:\\/i,
  /Users\\alber/i,
  /ementa dos cursos/i,
  /inctiamazonia/i,
  /labcity/i,
  /isaci/i,
  /Ã|Â|â˜|â€¢|Ã¡|Ã©|Ã§|Ã£|Ãµ/,
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];
for (const pattern of sensitive) {
  if (pattern.test(allText)) throw new Error(`Conteúdo sensível ou codificação inválida detectada: ${pattern}`);
}

console.log("smoke ok: site EETEPA Vilhena Alves validado");
