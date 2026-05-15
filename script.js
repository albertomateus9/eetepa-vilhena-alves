const root = document.documentElement;
const body = document.body;
const menuButton = document.querySelector("[data-menu-button]");
const navLinks = document.querySelector("[data-nav-links]");
const themeButton = document.querySelector("[data-theme-toggle]");
const storageKey = "eetepa-vilhena-theme";

function currentPage() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  return path === "" ? "index.html" : path;
}

function setTheme(theme) {
  body.dataset.theme = theme;
  root.dataset.theme = theme;
  localStorage.setItem(storageKey, theme);
  if (themeButton) {
    themeButton.textContent = theme === "light" ? "Modo escuro" : "Alto contraste";
  }
}

function setupTheme() {
  const saved = localStorage.getItem(storageKey);
  setTheme(saved || "dark");
  themeButton?.addEventListener("click", () => {
    setTheme(body.dataset.theme === "light" ? "dark" : "light");
  });
}

function setupNavigation() {
  const page = currentPage();
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === page || (page === "index.html" && href === "./"));
  });
  menuButton?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

function updateVisibleCounter(selector, countSelector) {
  if (!countSelector) return;
  const counter = document.querySelector(countSelector);
  if (!counter) return;
  const visible = [...document.querySelectorAll(selector)].filter((item) => !item.classList.contains("hidden")).length;
  counter.textContent = visible.toLocaleString("pt-BR");
}

function setupFilters() {
  document.querySelectorAll("[data-filter-group]").forEach((group) => {
    const buttons = group.querySelectorAll("[data-filter]");
    const targetSelector = group.dataset.filterGroup;
    const countSelector = group.dataset.filterCount;
    const items = document.querySelectorAll(targetSelector);
    updateVisibleCounter(targetSelector, countSelector);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        buttons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        items.forEach((item) => {
          const tags = (item.dataset.tags || "").split(" ");
          item.classList.toggle("hidden", filter !== "todos" && !tags.includes(filter));
        });
        updateVisibleCounter(targetSelector, countSelector);
      });
    });
  });
}

function setupAccordions() {
  document.querySelectorAll("[data-accordion]").forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", () => {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    });
  });
}

function setupCourseCards() {
  document.querySelectorAll("[data-course-toggle]").forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", () => {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "Ocultar ementa" : "Ver ementa resumida";
    });
  });
}

function setupContactForm() {
  const form = document.querySelector("[data-local-form]");
  const status = document.querySelector("[data-form-status]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("nome") || "visitante";
    status.hidden = false;
    status.textContent = `Mensagem demonstrativa registrada localmente para ${name}. Nenhum dado foi enviado para servidor.`;
    form.reset();
  });
}

function setupCopyAddress() {
  const button = document.querySelector("[data-copy-address]");
  const address = document.querySelector("[data-address]");
  button?.addEventListener("click", async () => {
    const text = address?.textContent?.trim() || "";
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Endereço copiado";
    } catch {
      button.textContent = "Copie pelo texto";
    }
    window.setTimeout(() => {
      button.textContent = "Copiar endereço";
    }, 2200);
  });
}

function setupCounters() {
  document.querySelectorAll("[data-count]").forEach((item) => {
    const target = Number(item.dataset.count);
    if (!Number.isFinite(target)) return;
    let value = 0;
    const step = Math.max(1, Math.ceil(target / 38));
    const timer = window.setInterval(() => {
      value = Math.min(target, value + step);
      item.textContent = value.toLocaleString("pt-BR");
      if (value >= target) window.clearInterval(timer);
    }, 28);
  });
}

setupTheme();
setupNavigation();
setupFilters();
setupAccordions();
setupCourseCards();
setupContactForm();
setupCopyAddress();
setupCounters();
