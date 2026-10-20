/* RAG Anatomy — app */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  view: "overview",
  theme:
    new URLSearchParams(location.search).get("theme") === "light"
      ? "light"
      : localStorage.getItem("rag-anatomy-theme") || "dark"
};

/* ---------- utilidades ---------- */

function points(list) {
  return list.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function strip(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function section(id, title, sub, body) {
  return `
    <section class="sec" id="${id}">
      <div class="sec-head">
        <h2>${title}</h2>
        ${sub ? `<p>${sub}</p>` : ""}
      </div>
      ${body}
    </section>`;
}

function chips(list) {
  return `<div class="chips">${list.map((x) => `<span class="chip">${x}</span>`).join("")}</div>`;
}

function readingOrder() {
  return ["overview", "fundamentos", ...PHASES.map((p) => p.id), "transversal", "decisiones", "lab"];
}

function readingItem(id) {
  if (id === "overview") return { id: "overview", name: "Visión general", accent: "#38bdf8" };
  return PHASES.find((p) => p.id === id) || PAGES.find((p) => p.id === id);
}

function readingPager(id) {
  const order = readingOrder();
  const i = order.indexOf(id);
  const prev = readingItem(order[i - 1] || "overview");
  const next = readingItem(order[i + 1] || "overview");

  return `
    <div class="pager">
      <button class="pager-btn" data-go="${prev.id}"><span>← Anterior</span><strong>${prev.name}</strong></button>
      <button class="pager-btn right" data-go="${next.id}"><span>Siguiente →</span><strong>${next.name}</strong></button>
    </div>`;
}

/* ---------- navegación ---------- */

function navButton(id) {
  if (id === "overview") {
    return `
      <button class="nav-item" data-view="overview">
        <span class="nav-num">◎</span>
        <span class="nav-text"><strong>Visión general</strong><small>Qué es y qué no es RAG</small></span>
      </button>`;
  }

  const item = readingItem(id);
  return `
    <button class="nav-item" data-view="${item.id}" style="--c:${item.accent}">
      <span class="nav-num">${item.num}</span>
      <span class="nav-text"><strong>${item.name}</strong><small>${item.kicker}</small></span>
    </button>`;
}

function buildNav() {
  const nav = $("#nav");
  nav.innerHTML = `
    <div class="nav-divider lead"><span>Empezar</span></div>
    ${navButton("overview")}
    ${navButton("fundamentos")}
    <div class="nav-divider"><span>Pipeline</span></div>
    ${PHASES.map((p) => navButton(p.id)).join("")}
    <div class="nav-divider"><span>Profundizar</span></div>
    ${["transversal", "decisiones", "lab"].map(navButton).join("")}
  `;

  $$(".nav-item", nav).forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });
}

/* ---------- diagrama isométrico ---------- */

const AX = Math.cos(Math.PI / 6);
const AY = Math.sin(Math.PI / 6);

function isoFaces(cx, cy, w, d, h) {
  const hw = w / 2;
  const hd = d / 2;
  const P = (x, y, z) => [cx + (x - y) * AX, cy + (x + y) * AY + (h - z)];
  return {
    top: [P(-hw, -hd, h), P(hw, -hd, h), P(hw, hd, h), P(-hw, hd, h)],
    left: [P(-hw, hd, h), P(hw, hd, h), P(hw, hd, 0), P(-hw, hd, 0)],
    right: [P(hw, -hd, h), P(hw, hd, h), P(hw, hd, 0), P(hw, -hd, 0)]
  };
}

function isoAnchors(cx, cy, w, d, h) {
  const hw = w / 2;
  const hd = d / 2;
  return {
    right: [cx + (hw + hd) * AX, cy + (hw - hd) * AY + h / 2],
    left: [cx - (hw + hd) * AX, cy + (-hw + hd) * AY + h / 2]
  };
}

function buildDiagram() {
  const W = 1100;
  const H = 340;
  const cy = 138;
  const w = 150;
  const d = 72;
  const h = 86;
  const xs = [130, 390, 650, 910];

  let boxes = "";
  let connectors = "";

  PHASES.forEach((p, i) => {
    const cx = xs[i];
    const f = isoFaces(cx, cy, w, d, h);
    const t = p.isoTint;

    boxes += `
      <g class="iso-phase" data-phase="${p.id}" tabindex="0" role="button" aria-label="Ir a ${p.name}" style="--c:${p.accent}">
        <ellipse class="iso-shadow" cx="${cx}" cy="${cy + h + 10}" rx="${(w / 2 + d / 2) * AX * 0.82}" ry="15" />
        <g class="iso-box">
          <polygon class="face" points="${points(f.left)}" fill="${t.left}" />
          <polygon class="face" points="${points(f.right)}" fill="${t.right}" />
          <polygon class="face top" points="${points(f.top)}" fill="${t.top}" />
          <text class="iso-num" x="${cx}" y="${cy + 10}" text-anchor="middle">${p.num}</text>
        </g>
        <text class="iso-name" x="${cx}" y="${cy + h + 62}" text-anchor="middle">${p.name}</text>
        <text class="iso-kicker" x="${cx}" y="${cy + h + 84}" text-anchor="middle">${p.num.toString().padStart(2, "0")} · ${p.id}</text>
      </g>`;

    if (i < PHASES.length - 1) {
      const a = isoAnchors(cx, cy, w, d, h);
      const b = isoAnchors(xs[i + 1], cy, w, d, h);
      const x1 = a.right[0];
      const y1 = a.right[1];
      const x2 = b.left[0];
      const y2 = b.left[1];
      const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + 32).toFixed(1)} ${(y1 - 12).toFixed(1)}, ${(x2 - 32).toFixed(1)} ${(y2 + 12).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      connectors += `
        <path class="connector" d="${path}" marker-end="url(#arrow)" />
        <circle class="packet" r="3.2" fill="${p.accent}">
          <animateMotion dur="2.6s" begin="${i * 0.55}s" repeatCount="indefinite" path="${path}" />
        </circle>`;
    }
  });

  $("#diagram").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Pipeline RAG de cuatro fases">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(150,170,195,.7)" />
        </marker>
      </defs>
      ${connectors}
      ${boxes}
    </svg>
    <div class="diagram-hint">Click en una fase para abrir su anatomía</div>
  `;

  $$(".iso-phase", $("#diagram")).forEach((g) => {
    g.addEventListener("click", () => navigate(g.dataset.phase));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigate(g.dataset.phase);
      }
    });
  });
}

function updateDiagram() {
  $$(".iso-phase").forEach((g) => {
    g.classList.toggle("active", g.dataset.phase === state.view);
  });
}

/* ---------- overview ---------- */

function renderOverview() {
  return `
    <div class="hero">
      <div class="hero-kicker">ARQUITECTURA · GUÍA INTERACTIVA</div>
      <h1>${OVERVIEW.hero.title}</h1>
      <p class="hero-sub">${OVERVIEW.hero.subtitle}</p>
      <div class="hero-pills">${OVERVIEW.hero.pills.map((x) => `<span>${x}</span>`).join("")}</div>
    </div>

    ${section(
      "ov-definicion",
      "La definición, sin humo",
      "La misma idea en tres registros: frase corta, definición técnica y analogía simple. Después, las distinciones que evitan confusiones.",
      `<div class="definition">${OVERVIEW.definition}</div>
       <div class="def-grid">
         <div class="def-card">
           <span class="def-tag">A nivel técnico</span>
           <p>${OVERVIEW.definitionTechnical || OVERVIEW.definition}</p>
         </div>
         <div class="def-card simple">
           <span class="def-tag">En palabras simples</span>
           <p>${OVERVIEW.definitionSimple || "RAG es darle al LLM un buscador para que consulte nuestros documentos antes de responder."}</p>
         </div>
       </div>
       <div class="grid-3">
         ${OVERVIEW.notRag
           .map(
             (x) => `
           <div class="mini-card">
             <span class="mini-tag">${x.label}</span>
             <p>${x.text}</p>
           </div>`
           )
           .join("")}
       </div>`
    )}

    ${section(
      "ov-contratos",
      "Los 4 contratos",
      "Cada fase produce algo que la siguiente consume. Si respetás los contratos, podés cambiar una pieza sin reescribir el resto.",
      `<div class="table-wrap">
        <table>
          <thead><tr><th>Entrada</th><th>Fase</th><th>Salida</th></tr></thead>
          <tbody>
            ${OVERVIEW.contracts
              .map(
                (c) => `
              <tr>
                <td class="muted">${c.from}</td>
                <td><span class="phase-pill">${c.phase}</span></td>
                <td>${c.to}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    )}

    ${section(
      "ov-prioridad",
      "La regla del techo",
      "El sistema no puede responder mejor de lo que recupera. Orden de prioridades al optimizar:",
      `<ol class="priority">
        ${OVERVIEW.priority
          .map(
            (x) => `
          <li>
            <span class="priority-n">${x.n}</span>
            <div><strong>${x.label}</strong><p>${x.note}</p></div>
          </li>`
          )
          .join("")}
      </ol>
      <div class="callout">El techo real es <strong>min(calidad del retrieval, calidad del generación)</strong>. El retriever es el límite más frecuente, no el único.</div>`
    )}

    ${section(
      "ov-diagnostico",
      "Diagnóstico por fase",
      "Un score global no te dice dónde falla. Estas señales sí.",
      `<div class="table-wrap">
        <table>
          <thead><tr><th>Síntoma</th><th>Métrica</th><th>Dónde mirar</th></tr></thead>
          <tbody>
            ${OVERVIEW.diagnosis
              .map(
                (x) => `
              <tr>
                <td>${x.symptom}</td>
                <td><code>${x.metric}</code></td>
                <td class="muted">${x.where}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    )}

    ${section(
      "ov-variantes",
      "Variantes de RAG",
      "La misma arquitectura, distintos niveles de sofisticación. De un script lineal a un orquestador con loop.",
      `<div class="strategy-grid">
        ${OVERVIEW.variants
          .map(
            (v) => `
          <div class="strategy">
            <h3>${v.name}</h3>
            <p class="strategy-how">${v.detail}</p>
            <div class="strategy-row"><span>Dev</span>${v.dev}</div>
          </div>`
          )
          .join("")}
      </div>`
    )}

    ${section(
      "ov-limites",
      "Límites que no se negocian",
      "Lo que RAG no arregla, por más que cambies el modelo o el prompt.",
      `<div class="grid-3">
        ${OVERVIEW.limits
          .map(
            (l, i) => `
          <div class="mini-card">
            <span class="mini-tag">Límite ${i + 1}</span>
            <p>${l}</p>
          </div>`
          )
          .join("")}
      </div>`
    )}

    ${section(
      "ov-glosario",
      "Glosario para devs",
      "La misma idea, dos vocabularios.",
      `<div class="glossary">
        ${OVERVIEW.glossary
          .map(
            (g) => `
          <div class="gloss-item">
            <span class="gloss-term">${g.term}</span>
            <span class="gloss-dev">${g.dev}</span>
          </div>`
          )
          .join("")}
      </div>`
    )}

    <div class="cta">
      <div>
        <strong>Empezá por Fundamentos</strong>
        <p>Definiciones, comparativas y mitos: el marco conceptual antes de entrar al pipeline.</p>
      </div>
      <button class="btn primary" data-go="fundamentos">Abrir FUNDAMENTOS →</button>
    </div>

    <div class="cta" style="margin-top:14px">
      <div>
        <strong>Después del pipeline</strong>
        <p>Evaluación, seguridad, operación y criterios de decisión para llevar el sistema a producción.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-go="transversal">Transversal</button>
        <button class="btn" data-go="decisiones">Decisiones</button>
        <button class="btn" data-go="lab">LAB</button>
      </div>
    </div>
  `;
}

/* ---------- fase ---------- */

function renderPhase(p) {
  const navChips = [
    ["sec-" + p.id + "-contratos", "Contratos"],
    ["sec-" + p.id + "-contrato-detalle", "Salida en detalle"],
    ["sec-" + p.id + "-pasos", "Pasos"],
    ["sec-" + p.id + "-algoritmos", "Algoritmos"],
    ...(p.training ? [["sec-" + p.id + "-entrenamiento", "Entrenamiento"]] : []),
    ["sec-" + p.id + "-estrategias", "Estrategias"],
    ["sec-" + p.id + "-hyper", "Hiperparámetros"],
    ["sec-" + p.id + "-fallas", "Fallas"],
    ["sec-" + p.id + "-metricas", "Métricas"]
  ];

  return `
    <div class="phase-head" style="--c:${p.accent}">
      <div class="phase-eyebrow">FASE ${p.num} DE 4 · ${p.kicker}</div>
      <h1>${p.name}</h1>
      <p class="phase-tagline">${p.tagline}</p>
      <div class="phase-purpose">${p.purpose}</div>
      <div class="analogy"><span>Analogía dev</span><p>${p.analogy}</p></div>
    </div>

    <div class="subnav">
      ${navChips.map(([id, label]) => `<button class="subnav-chip" data-anchor="${id}">${label}</button>`).join("")}
    </div>

    ${section(
      "sec-" + p.id + "-contratos",
      "Contrato de entrada y salida",
      "Lo que esta fase recibe y lo que entrega a la siguiente.",
      `<div class="contracts">
        <div class="contract in">
          <span class="tag">ENTRADA</span>
          <h3>${p.input.title}</h3>
          <ul>${p.input.items.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
        <div class="contract-arrow">→</div>
        <div class="contract out">
          <span class="tag">SALIDA</span>
          <h3>${p.output.title}</h3>
          <ul>${p.output.items.map((x) => `<li>${x}</li>`).join("")}</ul>
        </div>
      </div>`
    )}

    ${p.contractDetail ? section(
      "sec-" + p.id + "-contrato-detalle",
      "Salida en detalle",
      p.contractDetail.intro,
      `<div class="artifact-grid">
        ${p.contractDetail.items
          .map(
            (a) => `
          <article class="artifact">
            <div class="artifact-head">
              <span class="artifact-tag">${a.tag}</span>
              <h3>${a.name}</h3>
            </div>
            <p class="artifact-what">${a.what}</p>
            <div class="artifact-row"><span>Función</span><p>${a.role}</p></div>
            <div class="artifact-row"><span>Conecta con</span><p>${a.connect}</p></div>
            <div class="artifact-dev"><span>Analogía dev</span>${a.dev}</div>
          </article>`
          )
          .join("")}
      </div>`
    ) : ""}

    ${section(
      "sec-" + p.id + "-pasos",
      "Qué pasa adentro, paso a paso",
      "El pipeline interno de la fase, con los algoritmos que intervienen en cada paso.",
      `<ol class="steps">
        ${p.steps
          .map(
            (s) => `
          <li class="step">
            <div class="step-num">${s.n}</div>
            <div class="step-body">
              <h3>${s.title}</h3>
              <p>${s.detail}</p>
              ${chips(s.algorithms)}
              ${s.tip ? `<div class="tip"><span>Tip</span>${s.tip}</div>` : ""}
            </div>
          </li>`
          )
          .join("")}
      </ol>`
    )}

    ${section(
      "sec-" + p.id + "-algoritmos",
      "Algoritmos",
      "Nombre, rol y qué resuelve cada uno.",
      `<div class="table-wrap">
        <table class="algo-table">
          <thead><tr><th>Algoritmo / herramienta</th><th>Rol</th><th>Qué hace</th></tr></thead>
          <tbody>
            ${p.algorithms
              .map(
                (a) => `
              <tr>
                <td><code>${a.name}</code></td>
                <td><span class="role">${a.role}</span></td>
                <td class="muted">${a.detail}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    )}

    ${p.training ? section(
      "sec-" + p.id + "-entrenamiento",
      "Cómo se entrena el retriever",
      "El detalle que separa un índice preentrenado de un retriever que aprende del dominio.",
      `<div class="definition">${p.training.intro}</div>
       <div class="strategy-grid" style="margin-top:16px">
         ${p.training.items
           .map(
             (t) => `
           <div class="strategy">
             <h3>${t.name}</h3>
             <p class="strategy-how">${t.how}</p>
             <div class="strategy-row"><span>Cuándo</span>${t.when}</div>
             <div class="strategy-row trade"><span>Tradeoff</span>${t.tradeoff}</div>
           </div>`
           )
           .join("")}
       </div>
       <div class="callout">${p.training.callout}</div>`
    ) : ""}

    ${section(
      "sec-" + p.id + "-estrategias",
      "Estrategias",
      "Cuándo elegir cada una y qué se gana o se pierde.",
      `<div class="strategy-grid">
        ${p.strategies
          .map(
            (s) => `
          <div class="strategy">
            <h3>${s.name}</h3>
            <p class="strategy-how">${s.how}</p>
            <div class="strategy-row"><span>Cuándo</span>${s.when}</div>
            <div class="strategy-row trade"><span>Tradeoff</span>${s.tradeoff}</div>
          </div>`
          )
          .join("")}
      </div>
      ${
        p.patterns
          ? `<h3 class="subhead">Patrones que desacoplan buscar de leer</h3>
             <div class="grid-3">
               ${p.patterns
                 .map(
                   (x) => `
                 <div class="mini-card">
                   <span class="mini-tag">${x.name}</span>
                   <p>${x.detail}</p>
                 </div>`
                 )
                 .join("")}
             </div>`
          : ""
      }`
    )}

    ${section(
      "sec-" + p.id + "-hyper",
      "Hiperparámetros",
      "Los diales que se tocan y qué mueve cada uno.",
      `<div class="table-wrap">
        <table>
          <thead><tr><th>Parámetro</th><th>Típico</th><th>Efecto</th></tr></thead>
          <tbody>
            ${p.hyperparams
              .map(
                (h) => `
              <tr>
                <td><code>${h.name}</code></td>
                <td><span class="typical">${h.typical}</span></td>
                <td class="muted">${h.effect}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`
    )}

    ${section(
      "sec-" + p.id + "-fallas",
      "Modos de falla",
      "Qué se rompe y cómo se ve desde afuera.",
      `<div class="failure-grid">
        ${p.failures
          .map(
            (f) => `
          <div class="failure">
            <span class="warn">!</span>
            <div><strong>${f.name}</strong><p>${f.detail}</p></div>
          </div>`
          )
          .join("")}
      </div>`
    )}

    ${section(
      "sec-" + p.id + "-metricas",
      "Métricas",
      "Cómo se mide esta fase, aislada del resto.",
      `<div class="metric-grid">
        ${p.metrics
          .map(
            (m) => `
          <div class="metric">
            <strong>${m.name}</strong>
            <p>${m.detail}</p>
          </div>`
          )
          .join("")}
      </div>`
    )}

    ${readingPager(p.id)}
  `;
}

/* ---------- páginas conceptuales ---------- */

function renderPage(p) {
  return `
    <div class="phase-head" style="--c:${p.accent}">
      <div class="phase-eyebrow">${p.group.toUpperCase()} · ${p.kicker}</div>
      <h1>${p.name}</h1>
      <p class="phase-tagline">${p.tagline}</p>
      <div class="phase-purpose">${p.purpose}</div>
    </div>

    <div class="subnav">
      ${p.sections.map((s) => `<button class="subnav-chip" data-anchor="sec-${p.id}-${s.id}">${s.title}</button>`).join("")}
    </div>

    ${p.sections.map((s) => section("sec-" + p.id + "-" + s.id, s.title, s.sub, s.html)).join("")}

    ${readingPager(p.id)}
  `;
}

/* ---------- render ---------- */

function render(opts = {}) {
  const { scrollTop = true } = opts;

  $$(".nav-item").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === state.view);
  });

  const navEl = $("#nav");
  const activeNav = $(".nav-item.active", navEl);
  if (activeNav && navEl.scrollWidth > navEl.clientWidth) {
    navEl.scrollTo({ left: Math.max(0, activeNav.offsetLeft - 16), behavior: "smooth" });
  }

  const content = $("#content");
  const stageTitle = $("#stage-title");
  const stageSub = $("#stage-sub");

  const phase = PHASES.find((x) => x.id === state.view);
  const page = PAGES.find((x) => x.id === state.view);

  if (state.view === "overview") {
    stageTitle.textContent = "El pipeline completo";
    stageSub.textContent = "Cuatro fases · contratos explícitos";
    content.innerHTML = renderOverview();
  } else if (phase) {
    stageTitle.textContent = phase.name;
    stageSub.textContent = phase.tagline;
    content.innerHTML = renderPhase(phase);
  } else if (page) {
    stageTitle.textContent = page.name;
    stageSub.textContent = page.tagline;
    content.innerHTML = renderPage(page);
  } else {
    state.view = "overview";
    stageTitle.textContent = "El pipeline completo";
    stageSub.textContent = "Cuatro fases · contratos explícitos";
    content.innerHTML = renderOverview();
  }

  content.style.setProperty("--c", phase ? phase.accent : page ? page.accent : "#38bdf8");
  annotateTerms(content);

  updateDiagram();
  bindContent();
  if (page && page.id === "lab" && typeof mountLab === "function") mountLab();

  if (scrollTop) window.scrollTo({ top: 0, behavior: "instant" });
}

function bindContent() {
  $$("[data-go]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.go));
  });

  $$(".subnav-chip").forEach((el) => {
    el.addEventListener("click", () => {
      const target = document.getElementById(el.dataset.anchor);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("flash");
      setTimeout(() => target.classList.remove("flash"), 1400);
    });
  });
}

function navigate(view, anchor, instant) {
  state.view = view;
  render({ scrollTop: !anchor });
  closeSearch();

  if (anchor) {
    requestAnimationFrame(() => {
      const el = document.getElementById(anchor);
      if (!el) return;
      el.scrollIntoView({ behavior: instant ? "instant" : "smooth", block: "start" });
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 1600);
    });
  }
}

/* ---------- búsqueda ---------- */

let SEARCH_INDEX = null;

function buildSearchIndex() {
  const idx = [];
  const add = (phaseId, phaseName, accent, sectionKey, anchor, title, text) => {
    idx.push({ phaseId, phaseName, accent, sectionKey, anchor, title, text });
  };

  // overview
  add("overview", "General", "#94a3b8", "definicion", "ov-definicion", "Definición de RAG", strip([OVERVIEW.definition, OVERVIEW.definitionTechnical, OVERVIEW.definitionSimple].join(" ")));
  OVERVIEW.notRag.forEach((x) => add("overview", "General", "#94a3b8", "definicion", "ov-definicion", x.label, x.text));
  OVERVIEW.contracts.forEach((x) => add("overview", "General", "#94a3b8", "contratos", "ov-contratos", x.phase, x.from + " → " + x.to));
  OVERVIEW.priority.forEach((x) => add("overview", "General", "#94a3b8", "prioridad", "ov-prioridad", x.label, x.note));
  OVERVIEW.diagnosis.forEach((x) => add("overview", "General", "#94a3b8", "diagnostico", "ov-diagnostico", x.symptom, x.metric + " · " + x.where));
  OVERVIEW.variants.forEach((x) => add("overview", "General", "#94a3b8", "variantes", "ov-variantes", x.name, x.detail + " · " + x.dev));
  OVERVIEW.limits.forEach((x, i) => add("overview", "General", "#94a3b8", "limites", "ov-limites", "Límite " + (i + 1), x));
  OVERVIEW.glossary.forEach((x) => add("overview", "General", "#94a3b8", "glosario", "ov-glosario", x.term, x.dev));

  PAGES.forEach((p) => {
    p.sections.forEach((s) => {
      add(p.id, p.name, p.accent, s.id, `sec-${p.id}-${s.id}`, s.title, strip(s.html).slice(0, 420));
    });
  });

  for (const p of PHASES) {
    const base = p.id;
    p.input.items.forEach((x) => add(base, p.name, p.accent, "contratos", `sec-${base}-contratos`, "Entrada · " + p.input.title, x));
    p.output.items.forEach((x) => add(base, p.name, p.accent, "contratos", `sec-${base}-contratos`, "Salida · " + p.output.title, x));
    if (p.contractDetail) {
      p.contractDetail.items.forEach((a) =>
        add(base, p.name, p.accent, "contrato", `sec-${base}-contrato-detalle`, a.name, [a.what, a.role, a.connect, a.dev].join(" · "))
      );
    }
    p.steps.forEach((s) => {
      add(base, p.name, p.accent, "pasos", `sec-${base}-pasos`, s.title, s.detail);
      s.algorithms.forEach((a) => add(base, p.name, p.accent, "pasos", `sec-${base}-pasos`, s.title + " · " + a, a));
      if (s.tip) add(base, p.name, p.accent, "pasos", `sec-${base}-pasos`, "Tip · " + s.title, s.tip);
    });
    p.algorithms.forEach((a) => add(base, p.name, p.accent, "algoritmos", `sec-${base}-algoritmos`, a.name, a.role + " · " + a.detail));
    if (p.training) {
      p.training.items.forEach((t) => add(base, p.name, p.accent, "entrenamiento", `sec-${base}-entrenamiento`, t.name, t.how + " · " + t.when + " · " + t.tradeoff));
    }
    p.strategies.forEach((s) => add(base, p.name, p.accent, "estrategias", `sec-${base}-estrategias`, s.name, s.how + " · " + s.when + " · " + s.tradeoff));
    if (p.patterns) p.patterns.forEach((x) => add(base, p.name, p.accent, "estrategias", `sec-${base}-estrategias`, x.name, x.detail));
    p.hyperparams.forEach((h) => add(base, p.name, p.accent, "hyper", `sec-${base}-hyper`, h.name, h.typical + " · " + h.effect));
    p.failures.forEach((f) => add(base, p.name, p.accent, "fallas", `sec-${base}-fallas`, f.name, f.detail));
    p.metrics.forEach((m) => add(base, p.name, p.accent, "metricas", `sec-${base}-metricas`, m.name, m.detail));
  }

  SEARCH_INDEX = idx;
}

function doSearch(q) {
  const term = q.trim().toLowerCase();
  if (term.length < 2 || !SEARCH_INDEX) return [];

  const scored = SEARCH_INDEX.map((x) => {
    const title = x.title.toLowerCase();
    const text = x.text.toLowerCase();
    const phase = x.phaseName.toLowerCase();
    let score = 0;
    if (title.includes(term)) score += 5;
    if (phase.includes(term)) score += 3;
    if (text.includes(term)) score += 1;
    return { x, score };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map((s) => s.x);
}

function renderResults(list, q) {
  const box = $("#results");
  if (!q.trim() || q.trim().length < 2) {
    box.classList.remove("open");
    box.innerHTML = "";
    return;
  }
  if (!list.length) {
    box.innerHTML = `<div class="no-results">Sin resultados para «${esc(q)}»</div>`;
    box.classList.add("open");
    return;
  }
  box.innerHTML = list
    .map(
      (r) => `
    <button class="result" data-view="${r.phaseId}" data-anchor="${r.anchor}">
      <span class="r-phase" style="--c:${r.accent}">${r.phaseName}</span>
      <span class="r-title">${r.title}</span>
      <span class="r-snippet">${r.text.length > 110 ? r.text.slice(0, 110) + "…" : r.text}</span>
    </button>`
    )
    .join("");
  box.classList.add("open");

  $$(".result", box).forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.view, btn.dataset.anchor);
      $("#search").value = "";
    });
  });
}

function closeSearch() {
  const box = $("#results");
  box.classList.remove("open");
  box.innerHTML = "";
}

/* ---------- tema ---------- */

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  $("#theme").textContent = state.theme === "dark" ? "◐" : "◑";
  $("#theme").setAttribute("title", state.theme === "dark" ? "Cambiar a claro" : "Cambiar a oscuro");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("rag-anatomy-theme", state.theme);
  applyTheme();
}

/* ---------- init ---------- */

function init() {
  applyTheme();
  buildNav();
  buildDiagram();
  buildSearchIndex();
  initTermTips();

  const search = $("#search");
  search.addEventListener("input", () => renderResults(doSearch(search.value), search.value));
  search.addEventListener("focus", () => {
    if (search.value.trim().length >= 2) renderResults(doSearch(search.value), search.value);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) closeSearch();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSearch();
      search.blur();
    }
    if (e.key === "/" && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
    if (document.activeElement === search) return;
    if (e.key === "0" || e.key.toLowerCase() === "h") navigate("overview");
    const k = e.key.toLowerCase();
    if (k === "f") navigate("fundamentos");
    if (k === "t") navigate("transversal");
    if (k === "d") navigate("decisiones");
    if (k === "l") navigate("lab");
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) navigate(PHASES[n - 1].id);
  });

  $("#theme").addEventListener("click", toggleTheme);
  render();

  // deep link por hash: #retrieval o #retrieval/estrategias
  const hash = location.hash.replace("#", "");
  if (hash.includes("/")) {
    const [ph, sec] = hash.split("/");
    if (ph === "general" || ph === "overview") navigate("overview", "ov-" + sec, true);
    else if (PHASES.some((p) => p.id === ph)) navigate(ph, "sec-" + ph + "-" + sec, true);
    else if (PAGES.some((p) => p.id === ph)) navigate(ph, "sec-" + ph + "-" + sec, true);
  } else if (PHASES.some((p) => p.id === hash) || PAGES.some((p) => p.id === hash)) {
    navigate(hash);
  }
}

init();
