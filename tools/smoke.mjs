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

const publicTextFiles = required.filter((file) => !file.startsWith(".github/") && file !== "LICENSE" && !file.endsWith(".png") && !file.endsWith(".svg"));
const allText = publicTextFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
const cursos = readFileSync(join(root, "cursos.html"), "utf8");
const courseCount = (cursos.match(/<article class="course-card/g) || []).length;
if (courseCount !== 14) throw new Error(`Quantidade de cursos inválida: ${courseCount}`);
for (const course of [
  "Técnico em Administração",
  "Técnico em Rede de Computadores",
  "Técnico em Ciências de Dados",
  "Técnico em Sistemas de Energia Renováveis",
  "Técnico em Transações Imobiliárias"
]) {
  if (!cursos.includes(course)) throw new Error(`Curso ausente: ${course}`);
}

const sensitive = [
  /ppl-ai-file-upload/i,
  /amazonaws/i,
  /CPF/i,
  /processamento de sinais/i,
  /D:\\/i,
  /Users\\alber/i,
  /Ã|Â|â˜|â€¢|Ã¡|Ã©|Ã§|Ã£|Ãµ/,
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];
for (const pattern of sensitive) {
  if (pattern.test(allText)) throw new Error(`Conteúdo sensível ou codificação inválida detectada: ${pattern}`);
}

console.log("smoke ok: site EETEPA Vilhena Alves validado");
