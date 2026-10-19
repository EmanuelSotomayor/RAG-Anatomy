/* RAG Anatomy — LAB: calculadora y simulador de fallas */

const LAB_PAGE = {
  id: "lab",
  group: "Conceptos",
  num: "L",
  name: "LAB",
  kicker: "Calculadora · Simulador · Fallas",
  tagline: "Movés los diales y ves el tradeoff.",
  accent: "#a3e635",
  purpose:
    "Un laboratorio para desarrollar intuición: cuánto cuesta y tarda una configuración, qué presión ejerce sobre la ventana de contexto y qué se rompe cuando falla cada pieza.",
  sections: [
    {
      id: "calculadora",
      title: "Calculadora de costo y latencia",
      sub: "Estimaciones de orden de magnitud, no un benchmark. Sirven para comparar configuraciones, no para prometer SLA.",
      html: `
        <div class="lab">
          <div class="lab-controls">
            <label class="lab-field">
              <span>Documentos</span>
              <input id="lab-docs" type="range" min="1" max="1000" value="100" />
              <output id="lab-docs-out">100k</output>
            </label>
            <label class="lab-field">
              <span>Chunks por documento</span>
              <input id="lab-chunks" type="range" min="5" max="100" value="20" />
              <output id="lab-chunks-out">20</output>
            </label>
            <label class="lab-field">
              <span>Candidatos k</span>
              <input id="lab-k" type="range" min="3" max="100" value="20" />
              <output id="lab-k-out">20</output>
            </label>
            <label class="lab-field">
              <span>Tokens de contexto</span>
              <input id="lab-ctx" type="range" min="500" max="32000" step="500" value="4000" />
              <output id="lab-ctx-out">4.000</output>
            </label>
            <label class="lab-field">
              <span>Consultas por día</span>
              <input id="lab-qday" type="range" min="100" max="100000" step="100" value="5000" />
              <output id="lab-qday-out">5.000</output>
            </label>
            <label class="lab-check">
              <input id="lab-rerank" type="checkbox" checked />
              <span>Reranker (cross-encoder)</span>
            </label>
          </div>

          <div class="lab-results">
            <div class="lab-grid">
              <div class="out"><span>Chunks totales</span><strong id="out-chunks">—</strong></div>
              <div class="out"><span>Memoria del índice</span><strong id="out-mem">—</strong></div>
              <div class="out"><span>Latencia estimada</span><strong id="out-lat">—</strong></div>
              <div class="out"><span>Costo por query</span><strong id="out-cost">—</strong></div>
              <div class="out"><span>Costo mensual</span><strong id="out-month">—</strong></div>
              <div class="out"><span>Costo de indexado</span><strong id="out-embed">—</strong></div>
            </div>

            <div class="lab-bar">
              <div class="lab-bar-head"><span>Presión sobre la ventana de contexto</span><em id="out-pressure">—</em></div>
              <div class="bar"><i id="out-bar"></i></div>
            </div>

            <div class="callout" id="out-note">Ajustá los diales para ver el tradeoff.</div>
            <div class="lab-note">Supuestos: embeddings de 768 dims en float32 con 1.5x de overhead, chunks de ~300 tokens, LLM a $3/1M input y $15/1M output, ventana de 128k. Cambiá los números si tu stack es distinto.</div>
          </div>
        </div>
      `
    },
    {
      id: "chunking",
      title: "Simulador de chunking",
      sub: "Chunk size y overlap no tienen un valor universal: mirá cómo cambian la cantidad de chunks, el desperdicio y el tradeoff precisión/contexto.",
      html: `
        <div class="lab">
          <div class="lab-controls">
            <label class="lab-field">
              <span>Tokens del documento</span>
              <input id="lab-dtokens" type="range" min="500" max="20000" step="500" value="6000" />
              <output id="lab-dtokens-out">6.000</output>
            </label>
            <label class="lab-field">
              <span>Tokens por chunk</span>
              <input id="lab-csize" type="range" min="100" max="1500" step="50" value="400" />
              <output id="lab-csize-out">400</output>
            </label>
            <label class="lab-field">
              <span>Overlap</span>
              <input id="lab-overlap" type="range" min="0" max="300" step="10" value="50" />
              <output id="lab-overlap-out">50</output>
            </label>
          </div>

          <div class="lab-results">
            <div class="lab-grid">
              <div class="out"><span>Chunks por documento</span><strong id="out-nchunks">—</strong></div>
              <div class="out"><span>Desperdicio por overlap</span><strong id="out-waste">—</strong></div>
              <div class="out"><span>Tokens indexados</span><strong id="out-indexed">—</strong></div>
            </div>

            <div class="lab-bar">
              <div class="lab-bar-head"><span>Precisión del match</span><em id="chunk-precision-val">—</em></div>
              <div class="bar"><i id="chunk-precision-bar"></i></div>
            </div>

            <div class="lab-bar">
              <div class="lab-bar-head"><span>Contexto por chunk</span><em id="chunk-context-val">—</em></div>
              <div class="bar"><i id="chunk-context-bar"></i></div>
            </div>

            <div class="callout" id="chunk-note">Ajustá los diales para ver el tradeoff.</div>
          </div>
        </div>
      `
    },
    {
      id: "fallas",
      title: "Inyector de fallas",
      sub: "Elegí una falla y mirá dónde se origina, cómo se detecta y cómo se arregla. Es el diagnóstico que harías en producción.",
      html: `
        <div class="fail-btns" id="fail-btns">
          <button class="fail-btn" data-fail="embedding">Embedding mismatch</button>
          <button class="fail-btn" data-fail="stale">Índice stale</button>
          <button class="fail-btn" data-fail="chunk">Chunk cortado</button>
          <button class="fail-btn" data-fail="acl">Fuga por ACL</button>
          <button class="fail-btn" data-fail="injection">Prompt injection</button>
          <button class="fail-btn" data-fail="middle">Lost in the middle</button>
          <button class="fail-btn" data-fail="k">k demasiado chico</button>
          <button class="fail-btn" data-fail="rerank">Sin reranker</button>
          <button class="fail-btn" data-fail="hallucination">Alucinación</button>
          <button class="fail-btn" data-fail="overflow">Context overflow</button>
        </div>
        <div class="fail-detail" id="fail-detail">
          <p class="muted">Elegí una falla para ver el diagnóstico.</p>
        </div>
      `
    }
  ]
};

PAGES.push(LAB_PAGE);

const LAB_FAILURES = {
  embedding: {
    name: "Embedding mismatch",
    phase: "Fase 1–2",
    symptom: "El retrieval devuelve resultados aparentemente aleatorios. No hay error, solo mala calidad.",
    metric: "Recall@k se desploma de un día para el otro.",
    fix: "Reindexar todo con el modelo nuevo y versionar embedder + índice juntos. Cambiar solo el query encoder nunca alcanza.",
    impact: 95
  },
  stale: {
    name: "Índice stale",
    phase: "Fase 1",
    symptom: "Responde con datos viejos o con documentos que ya se borraron.",
    metric: "Tasa de respuestas obsoletas; documentos eliminados que siguen apareciendo.",
    fix: "Reindexado incremental, TTL y borrado en cascada documento → chunks → vectores → cache.",
    impact: 80
  },
  chunk: {
    name: "Chunk cortado",
    phase: "Fase 1",
    symptom: "El chunk recuperado menciona el tema pero no contiene la respuesta completa.",
    metric: "Recall@k bajo en preguntas factuales; faithfulness baja.",
    fix: "Overlap, chunking estructural o parent-document: indexar el hijo y pasar el padre.",
    impact: 70
  },
  acl: {
    name: "Fuga por ACL",
    phase: "Fase 1–3",
    symptom: "El contexto incluye documentos de otro tenant o de otra área.",
    metric: "Tests de aislamiento; auditoría de accesos.",
    fix: "ACL en el payload, filtrado pre-retrieval y defensa en profundidad en la fase 3.",
    impact: 100
  },
  injection: {
    name: "Prompt injection indirecta",
    phase: "Fase 3",
    symptom: "El modelo obedece instrucciones escondidas en un documento recuperado.",
    metric: "Tasa de respuestas fuera de política; evals adversarios.",
    fix: "Spotlighting, jerarquía de instrucciones, delimitadores y sanitización del contexto.",
    impact: 90
  },
  middle: {
    name: "Lost in the middle",
    phase: "Fase 3",
    symptom: "El dato clave está en el contexto, pero el modelo lo ignora.",
    metric: "Faithfulness baja cuando crece el contexto.",
    fix: "Poner los mejores chunks en los extremos, reducir contexto y comprimir.",
    impact: 60
  },
  k: {
    name: "k demasiado chico",
    phase: "Fase 2",
    symptom: "El chunk correcto nunca aparece: no está en el top-k.",
    metric: "Recall@k bajo con Precision@k alto.",
    fix: "Subir k, agregar híbrido y rerank. Medir el costo extra.",
    impact: 75
  },
  rerank: {
    name: "Sin reranker",
    phase: "Fase 2",
    symptom: "Buen recall, mal orden: el mejor chunk queda abajo y el contexto se llena de ruido.",
    metric: "MRR y nDCG bajos aunque Recall@k sea aceptable.",
    fix: "Cross-encoder sobre el top-k, con k moderado para controlar latencia.",
    impact: 65
  },
  hallucination: {
    name: "Alucinación pese al contexto",
    phase: "Fase 4",
    symptom: "El modelo inventa un dato aunque la fuente esté disponible.",
    metric: "Faithfulness baja; claims no soportados.",
    fix: "Baja temperatura, citas obligatorias, verificación por claim y abstención explícita.",
    impact: 85
  },
  overflow: {
    name: "Context overflow",
    phase: "Fase 3",
    symptom: "El prompt se trunca y se pierde justo el final, donde estaba la respuesta.",
    metric: "Respuestas incompletas; tokens truncados.",
    fix: "Presupuesto real con el tokenizador del LLM, selección por score y compresión.",
    impact: 55
  }
};

function mountLab() {
  const byId = (id) => document.getElementById(id);
  const docs = byId("lab-docs");
  if (!docs) return;

  const chunks = byId("lab-chunks");
  const kEl = byId("lab-k");
  const ctx = byId("lab-ctx");
  const qday = byId("lab-qday");
  const rerank = byId("lab-rerank");

  const nf = new Intl.NumberFormat("es-AR");

  const money = (x) => {
    if (x >= 1000) return "$" + (x / 1000).toFixed(1) + "k";
    if (x >= 1) return "$" + x.toFixed(2);
    return "$" + x.toFixed(4);
  };

  const update = () => {
    const d = +docs.value * 1000;
    const cpd = +chunks.value;
    const k = +kEl.value;
    const contextTokens = +ctx.value;
    const queriesDay = +qday.value;
    const useRerank = rerank.checked;

    byId("lab-docs-out").textContent = nf.format(d / 1000) + "k";
    byId("lab-chunks-out").textContent = nf.format(cpd);
    byId("lab-k-out").textContent = nf.format(k);
    byId("lab-ctx-out").textContent = nf.format(contextTokens);
    byId("lab-qday-out").textContent = nf.format(queriesDay);

    const totalChunks = d * cpd;
    const dim = 768;
    const memGB = (totalChunks * dim * 4 * 1.5) / 1e9;
    const embedTokens = totalChunks * 300;
    const embedCost = (embedTokens / 1e6) * 0.02;

    const latency =
      20 + // embedding query
      3 + k * 0.05 + // ANN
      2 + // BM25
      (useRerank ? 40 + k * 2 : 0) + // cross-encoder
      (600 + contextTokens * 0.03) + // LLM
      250; // verificación

    const costQuery =
      (contextTokens / 1e6) * 3 +
      (300 / 1e6) * 15 +
      (useRerank ? k * 0.000002 : 0) +
      0.0005;

    const costMonth = costQuery * queriesDay * 30;
    const pressure = Math.min(100, (contextTokens / 128000) * 100);

    byId("out-chunks").textContent = nf.format(totalChunks);
    byId("out-mem").textContent = memGB >= 1 ? memGB.toFixed(2) + " GB" : (memGB * 1000).toFixed(0) + " MB";
    byId("out-lat").textContent = (latency / 1000).toFixed(2) + " s";
    byId("out-cost").textContent = money(costQuery);
    byId("out-month").textContent = money(costMonth);
    byId("out-embed").textContent = money(embedCost);

    const bar = byId("out-bar");
    bar.style.width = pressure.toFixed(1) + "%";
    bar.style.background =
      pressure > 75 ? "#f87171" : pressure > 45 ? "#f59e0b" : "#34d399";
    byId("out-pressure").textContent = pressure.toFixed(1) + "%";

    const note = byId("out-note");
    if (pressure > 75) {
      note.textContent = "Contexto muy alto: más costo, más latencia y riesgo de lost in the middle. Comprimí o reducí k.";
    } else if (!useRerank && k > 30) {
      note.textContent = "k alto sin reranker: mucho ruido en el contexto. El reranker suele ser la mejor inversión acá.";
    } else if (useRerank && k < 8) {
      note.textContent = "k bajo con reranker: estás pagando el rerank sobre muy pocos candidatos. Subí k para aprovecharlo.";
    } else {
      note.textContent = "Configuración equilibrada. El costo dominante suele ser el LLM, no el retrieval.";
    }
  };

  [docs, chunks, kEl, ctx, qday, rerank].forEach((el) => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  update();

  const dtokens = byId("lab-dtokens");
  const csize = byId("lab-csize");
  const overlap = byId("lab-overlap");

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  const updateChunking = () => {
    const dt = +dtokens.value;
    const cs = +csize.value;
    const ov = Math.min(+overlap.value, Math.max(0, cs - 10));

    byId("lab-dtokens-out").textContent = nf.format(dt);
    byId("lab-csize-out").textContent = nf.format(cs);
    byId("lab-overlap-out").textContent = nf.format(+overlap.value);

    const effective = Math.max(10, cs - ov);
    const n = Math.max(1, Math.ceil((dt - ov) / effective));
    const waste = n > 1 ? ((n - 1) * ov) / dt : 0;
    const indexed = n * cs;

    byId("out-nchunks").textContent = nf.format(n);
    byId("out-waste").textContent = (waste * 100).toFixed(1) + "%";
    byId("out-indexed").textContent = nf.format(indexed);

    const precision = clamp(100 - ((cs - 100) / 1400) * 100, 5, 100);
    const context = clamp(((cs - 100) / 1400) * 100, 0, 100);

    const pBar = byId("chunk-precision-bar");
    const cBar = byId("chunk-context-bar");
    pBar.style.width = precision.toFixed(0) + "%";
    cBar.style.width = context.toFixed(0) + "%";
    pBar.style.background = precision > 60 ? "#34d399" : precision > 30 ? "#f59e0b" : "#f87171";
    cBar.style.background = context > 60 ? "#34d399" : context > 30 ? "#f59e0b" : "#f87171";
    byId("chunk-precision-val").textContent = precision.toFixed(0) + "%";
    byId("chunk-context-val").textContent = context.toFixed(0) + "%";

    const note = byId("chunk-note");
    if (ov >= cs / 2) {
      note.textContent = "Overlap demasiado alto: duplicás mucho contenido y el índice crece sin agregar señal.";
    } else if (cs < 200) {
      note.textContent = "Chunks muy chicos: alta precisión, pero riesgo de hechos incompletos.";
    } else if (cs > 1000) {
      note.textContent = "Chunks muy grandes: más contexto, pero el embedding se diluye.";
    } else {
      note.textContent = "Rango razonable. Confirmá con Recall@k en tu golden set: el número óptimo depende del corpus.";
    }
  };

  [dtokens, csize, overlap].forEach((el) => {
    el.addEventListener("input", updateChunking);
    el.addEventListener("change", updateChunking);
  });

  updateChunking();

  const detail = byId("fail-detail");
  const buttons = Array.from(document.querySelectorAll(".fail-btn"));

  const showFailure = (id) => {
    const f = LAB_FAILURES[id];
    if (!f) return;

    buttons.forEach((b) => b.classList.toggle("active", b.dataset.fail === id));

    detail.innerHTML = `
      <div class="fail-head">
        <span class="fail-phase">${f.phase}</span>
        <strong>${f.name}</strong>
      </div>
      <div class="fail-rows">
        <div><span>Síntoma</span><p>${f.symptom}</p></div>
        <div><span>Métrica que lo detecta</span><p>${f.metric}</p></div>
        <div><span>Fix</span><p>${f.fix}</p></div>
      </div>
      <div class="fail-impact">
        <span>Impacto</span>
        <div class="bar"><i style="width:${f.impact}%;background:${f.impact > 80 ? "#f87171" : f.impact > 60 ? "#f59e0b" : "#34d399"}"></i></div>
        <em>${f.impact}%</em>
      </div>
    `;
  };

  buttons.forEach((b) => {
    b.addEventListener("click", () => showFailure(b.dataset.fail));
  });

  showFailure("embedding");
}
