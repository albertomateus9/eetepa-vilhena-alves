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
  "assets/campus-tech.svg"
];

for (const file of required) statSync(join(root, file));

const css = readFileSync(join(root, "styles.css"), "utf8");
const js = readFileSync(join(root, "script.js"), "utf8");

if (!css.includes("@media")) throw new Error("CSS responsivo ausente");
if (!js.includes("localStorage")) throw new Error("Tema com localStorage ausente");
if (!js.includes("clipboard")) throw new Error("Botão de copiar endereço ausente");

const forbidden = ["axios", "XMLHttpRequest", "WebSocket", "sendBeacon"];
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

const publicFiles = required.filter((file) => !file.startsWith(".github/") && file !== "LICENSE");
const allText = publicFiles.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
const sensitive = [
  /ppl-ai-file-upload/i,
  /amazonaws/i,
  /CPF/i,
  /processamento de sinais/i,
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];
for (const pattern of sensitive) {
  if (pattern.test(allText)) throw new Error(`Conteúdo sensível detectado: ${pattern}`);
}

console.log("smoke ok: site EETEPA Vilhena Alves validado");
