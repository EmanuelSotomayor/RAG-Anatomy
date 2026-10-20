/* RAG Anatomy — glosario de términos técnicos con tooltip al pasar el mouse */

const TERMS = {
  "corpus heterogéneo": "Conjunto de documentos de distintos formatos y calidades: PDFs, HTML, tickets, escaneos. Como una carpeta compartida donde conviven Word, mails y fotos.",
  "corpus": "El conjunto de documentos que el sistema puede consultar. Como la carpeta compartida del equipo.",
  "boilerplate": "Texto repetitivo que no aporta información: headers, footers, avisos legales. Como el pie de página que se repite en todas las páginas.",
  "embedder": "Modelo que convierte texto en vectores. Como traducir cada texto a coordenadas en un mapa de significados.",
  "embeddings": "Listas de números que representan el significado de un texto. Textos parecidos quedan cerca en ese espacio.",
  "embedding": "Lista de números que representa el significado de un texto. Como coordenadas: textos parecidos quedan cerca.",
  "vectores": "Listas de números que representan objetos o textos. El embedding es un vector de significado.",
  "vector": "Lista de números que representa un objeto. El embedding es un vector de significado.",
  "índices": "Estructuras que permiten buscar rápido sin recorrer todo. Como el índice de un libro.",
  "índice": "Estructura que permite buscar rápido sin recorrer todo. Como el índice de un libro.",
  "indexación": "Proceso de construir el índice: parsear, cortar, vectorizar y guardar los documentos.",
  "reindexado": "Volver a construir el índice con documentos nuevos o con otro modelo de embeddings.",
  "chunks": "Fragmentos de documento que se indexan y recuperan. Como cortar un libro en fichas.",
  "chunk": "Fragmento de documento que se indexa y recupera. Como cortar un libro en fichas.",
  "chunking": "Partir documentos en fragmentos indexables. La decisión define qué puede recuperar el sistema.",
  "dimensión": "Cantidad de coordenadas que ubican un punto. Un embedding de 1.536 números vive en un espacio de 1.536 dimensiones, aunque en código sea un arreglo 1D.",
  "matriz": "Arreglo bidimensional: filas y columnas. Un lote de 32 embeddings de 1.536 dimensiones forma una matriz de 32 × 1.536.",
  "tensor": "Arreglo de N ejes. Un tensor 3D puede representar un lote de secuencias de embeddings.",
  "producto punto": "Multiplicar coordenada por coordenada y sumar. Con vectores normalizados da el mismo resultado que la similitud del coseno.",
  "distancia euclidiana": "Distancia en línea recta entre dos puntos. Es Pitágoras generalizado a N dimensiones; 0 significa vectores idénticos.",
  "normalización": "Escalar un vector para que su longitud sea 1. Permite usar producto punto como si fuera similitud del coseno.",
  "encoder": "Modelo que lee texto y lo comprime en una representación vectorial. No genera texto nuevo como un decoder.",
  "payload": "Datos extra que acompañan un vector en la base: texto original, archivo, página, permisos. Sirven para filtrar y reconstruir el contexto.",
  "overlap": "Parte que se repite entre chunks consecutivos para no cortar una idea al medio.",
  "metadata": "Datos que describen un documento: fecha, autor, área, permisos. Sirven para filtrar y autorizar.",
  "metadatos": "Datos que describen un documento: fecha, autor, área, permisos. Sirven para filtrar y autorizar.",
  "parser": "Componente que extrae texto y estructura de un archivo (PDF, HTML, Word). Como abrir un sobre y sacar el contenido.",
  "OCR": "Reconocimiento óptico de caracteres: convierte una imagen escaneada en texto.",
  "layout-aware": "Chunking que respeta columnas, tablas y orden de lectura en vez de cortar por caracteres.",
  "AST": "Árbol de sintaxis del código. Permite cortar por función, clase o método en vez de por líneas.",
  "multimodal": "Sistema que trabaja con texto, imágenes, audio o video en conjunto.",
  "token": "Unidad mínima de texto que procesa el modelo: una palabra, parte de una palabra o un signo.",
  "tokens": "Unidades mínimas de texto que procesa el modelo: palabras, partes de palabras o signos.",
  "tokenizador": "Componente que parte el texto en tokens. Es el que define el largo real de un prompt.",
  "ventana de contexto": "Cantidad máxima de tokens que el modelo puede leer en una sola llamada.",
  "contexto": "Información que el modelo ve en una llamada: instrucciones, historial y documentos recuperados.",
  "prompts": "Textos de entrada que recibe el modelo.",
  "prompt": "Texto de entrada que recibe el modelo: instrucciones, pregunta y contexto.",
  "prompt engineering": "Diseñar las instrucciones y el formato del contexto para obtener mejores respuestas.",
  "inferencia": "El momento en que el modelo genera una respuesta, a diferencia del entrenamiento.",
  "latencia": "Tiempo que tarda una respuesta desde que se hace la consulta.",
  "throughput": "Cuántas consultas por segundo puede procesar el sistema.",
  "SLA": "Acuerdo de nivel de servicio: latencia y disponibilidad prometidas a los usuarios.",
  "cache": "Guardar resultados para no repetir trabajo. Como no volver a calcular lo que ya sabés.",
  "semantic cache": "Cachear respuestas por similitud de significado, no por texto exacto.",
  "KV cache": "Memoria interna del modelo para no recalcular tokens que ya procesó durante la generación.",

  "retrieval": "Recuperar los documentos o fragmentos más relevantes para una consulta.",
  "top-k": "Los k mejores resultados de una búsqueda. Es cuántos candidatos pasan a la siguiente etapa.",
  "ANN": "Búsqueda aproximada de vecinos: encuentra vectores parecidos sin comparar contra todos. Como buscar en un mapa por zona en vez de calle por calle.",
  "HNSW": "Un índice ANN basado en grafos. Es rápido y preciso, pero consume bastante memoria.",
  "IVF": "Índice ANN que agrupa vectores en clusters y busca solo en los más cercanos.",
  "BM25": "Búsqueda léxica clásica: puntúa por coincidencia de palabras, no por significado.",
  "dense": "Búsqueda por significado usando embeddings, en vez de coincidencia exacta de palabras.",
  "sparse": "Búsqueda por coincidencia de palabras, con vectores mayormente en cero.",
  "híbrido": "Combinar búsqueda densa y léxica para cubrir significado y términos exactos.",
  "rerankers": "Modelos que reordenan los candidatos recuperados. Más caros y más precisos.",
  "reranker": "Modelo que reordena los candidatos recuperados. Más caro y más preciso que el primer retrieval.",
  "reranking": "Reordenar los candidatos con un modelo más preciso antes de pasarlos al generador.",
  "cross-encoder": "Modelo que lee la consulta y el documento juntos para puntuar relevancia. Más preciso, más lento.",
  "bi-encoder": "Modelo que codifica consulta y documento por separado. Permite precalcular y buscar rápido.",
  "late interaction": "Técnica que compara vectores por token en vez de un solo vector por texto; más precisa y más cara.",
  "ColBERT": "Familia de modelos de late interaction: guarda un vector por token y compara con MaxSim.",
  "similitud coseno": "Medida de parecido entre vectores según el ángulo que forman. No mide relevancia por sí sola.",
  "cosine": "Medida de parecido entre vectores según el ángulo. Un valor alto indica cercanía semántica, no necesariamente utilidad.",
  "mean pooling": "Promediar los vectores de todos los tokens para obtener un solo vector del texto.",
  "semantic collapse": "Cuando un chunk grande mezcla tantos temas que su embedding promedia todo y pierde el detalle.",
  "query": "La consulta o pregunta del usuario que dispara la búsqueda.",
  "query rewriting": "Reformular la pregunta para buscar mejor: agregar contexto, sinónimos o descomponerla.",
  "HyDE": "Generar un documento hipotético con el modelo y usar ese texto para buscar, en vez de la pregunta cruda.",
  "parent-document": "Indexar fragmentos chicos para buscar, pero pasar al modelo el documento padre completo para responder.",
  "RAPTOR": "Resumir documentos en varios niveles para responder preguntas globales, no solo locales.",
  "GraphRAG": "RAG sobre un grafo de entidades y relaciones. Útil para preguntas que conectan varios documentos.",
  "knowledge graph": "Grafo de entidades y relaciones verificadas. Como un mapa de quién se relaciona con qué.",
  "entity": "Una cosa concreta del dominio: un cliente, un producto, un ticket, una persona.",
  "text-to-SQL": "Traducir una pregunta a SQL para consultar una base de datos. Ideal para filtros y agregaciones exactas.",
  "SQL": "Lenguaje para consultar bases de datos relacionales con filtros y agregaciones exactas.",
  "hard negatives": "Ejemplos parecidos a la respuesta correcta pero incorrectos. Se usan para entrenar un retriever más fino.",
  "contrastive": "Entrenamiento que acerca los pares correctos y aleja los incorrectos en el espacio vectorial.",

  "RAG": "Retrieval-Augmented Generation: buscar información y pasársela al modelo antes de responder. Como consultar la documentación en vez de contestar de memoria.",
  "LLM": "Large Language Model: modelo de lenguaje entrenado con enormes cantidades de texto para generar y razonar.",
  "grounding": "Que la respuesta se base en evidencia recuperada, no solo en la memoria interna del modelo.",
  "faithfulness": "Qué tan fiel es la respuesta al contexto: cada afirmación debe estar soportada por la evidencia.",
  "attribution": "Mapear cada afirmación de la respuesta a la fuente que la respalda.",
  "hallucination": "Cuando el modelo inventa información que no está soportada por la evidencia.",
  "alucinación": "Cuando el modelo inventa información que no está soportada por la evidencia.",
  "alucinaciones": "Afirmaciones inventadas por el modelo que no están soportadas por la evidencia.",
  "abstención": "Que el sistema diga \"no tengo información suficiente\" en vez de inventar una respuesta.",
  "citas": "Referencias explícitas a las fuentes usadas, para que el usuario pueda verificarlas.",
  "cita": "Referencia explícita a una fuente, para que la respuesta sea verificable.",
  "golden set": "Conjunto de preguntas con su fuente y respuesta correctas, usado para medir el sistema.",
  "ground truth": "La respuesta o fuente considerada correcta por un humano, contra la cual se compara el sistema.",
  "LLM-as-judge": "Usar otro modelo para evaluar respuestas. Es barato, pero tiene sesgos y hay que calibrarlo.",
  "RAGAS": "Framework de evaluación de RAG que mide fidelidad, relevancia y calidad del contexto.",
  "reference-free": "Métrica que no necesita una respuesta de referencia para calcularse; se apoya en el contexto o en otro modelo.",
  "Recall@k": "De todos los documentos relevantes, cuántos aparecen en el top-k. Mide si el bueno se escapó.",
  "MRR": "Mean Reciprocal Rank: premia que el primer resultado correcto aparezca lo más arriba posible.",
  "nDCG": "Métrica que evalúa la calidad del orden completo, premiando los resultados relevantes arriba.",
  "precision": "De los resultados devueltos, qué proporción es realmente relevante.",
  "lost in the middle": "Fenómeno por el cual el modelo presta menos atención al centro de contextos largos.",
  "context rot": "Degradación general de la calidad cuando el contexto crece demasiado, aunque entre en la ventana.",
  "long context": "Pasar muchos documentos directamente en el prompt en vez de recuperarlos con un índice.",
  "fine-tuning": "Reentrenar un modelo con ejemplos para cambiar su comportamiento, estilo o formato.",
  "parámetros": "Números internos que definen el comportamiento del modelo. Se ajustan durante el entrenamiento.",
  "parámetro": "Número interno que define el comportamiento del modelo. Se ajusta durante el entrenamiento.",
  "pesos del modelo": "Los parámetros aprendidos durante el entrenamiento. Cambiarlos es lo que hace el fine-tuning.",
  "parametric memory": "Conocimiento guardado en los pesos del modelo, no en una base externa.",
  "non-parametric memory": "Conocimiento guardado fuera del modelo, por ejemplo en un índice de documentos.",

  "ACL": "Access Control List: reglas de quién puede ver qué documento. Sin ACL, el retrieval puede filtrar datos de otro usuario.",
  "tenant": "Cliente o espacio aislado dentro de un mismo sistema. Los datos de un tenant no deben verse desde otro.",
  "PII": "Información personal identificable: nombre, DNI, email, teléfono, dirección.",
  "prompt injection": "Instrucción maliciosa escondida en un documento o input que intenta cambiar el comportamiento del modelo.",
  "poisoning": "Insertar documentos falsos o maliciosos en el corpus para contaminar las respuestas.",
  "exfiltración": "Sacar información del sistema por un canal no autorizado, por ejemplo a través de links o respuestas.",
  "OWASP": "Organización que publica listas de riesgos de seguridad; su LLM Top 10 es referencia para RAG.",
  "guardrail": "Barrera de seguridad que filtra entradas o salidas para evitar usos indebidos.",
  "rate limit": "Límite de consultas por usuario o por minuto para evitar abuso y costos descontrolados.",
  "denial of wallet": "Ataque que busca agotar el presupuesto haciendo consultas caras o masivas.",
  "supply chain": "Riesgos de dependencias, modelos o datasets de terceros que pueden venir comprometidos.",
  "drift": "Cambio gradual en los datos o en las preguntas que degrada el rendimiento con el tiempo.",
  "blue/green": "Tener dos versiones del sistema y cambiar el tráfico de una a otra para desplegar sin cortes.",
  "tracing": "Registrar el recorrido completo de una consulta: query, chunks, scores, prompt y respuesta.",
  "rollback": "Volver a una versión anterior del sistema cuando la nueva falla.",

  "agente": "Sistema que decide pasos y usa herramientas en un loop, en vez de seguir un pipeline fijo.",
  "agentes": "Sistemas que deciden pasos y usan herramientas en un loop, en vez de seguir un pipeline fijo.",
  "agentic": "Diseño con un orquestador que decide qué hacer, qué herramienta usar y cuándo parar.",
  "router": "Componente que decide qué fuente o herramienta usar para cada consulta.",
  "orquestación": "Coordinar los pasos y componentes del sistema: retrieval, tools, memoria y generación.",
  "multi-hop": "Pregunta que requiere varios pasos de búsqueda y razonamiento encadenados.",
  "stop condition": "Criterio explícito para cortar un loop de agente y evitar costos o respuestas infinitas.",
  "entity memory": "Guardar el estado de cada entidad (cliente, pedido, ticket) para no repetir contexto en cada turno.",
  "buffer": "Memoria que guarda los últimos turnos tal cual. Simple, pero crece rápido.",
  "summary memory": "Memoria que resume la conversación para comprimir el historial.",

  "Self-RAG": "Variante donde el modelo decide si necesita recuperar y evalúa si lo recuperado es útil.",
  "CRAG": "Variante que evalúa la calidad del retrieval y activa un fallback correctivo si es mala.",
  "DPR": "Dense Passage Retrieval: bi-encoder entrenado para recuperar pasajes relevantes.",
  "REALM": "Modelo que trata el retrieval como una variable latente y entrena el retriever junto al generador.",
  "FiD": "Fusion-in-Decoder: concatena varios pasajes en el decoder para responder con múltiples fuentes.",
  "SPLADE": "Búsqueda léxica neural que expande términos y sigue siendo eficiente con índices invertidos.",
  "BEIR": "Benchmark heterogéneo para comparar modelos de retrieval en distintos dominios.",
  "MTEB": "Benchmark masivo para comparar embeddings en tareas y idiomas.",
  "VLM": "Vision-Language Model: modelo que entiende imágenes y texto a la vez.",
  "CLIP": "Modelo que alinea imágenes y texto en un mismo espacio vectorial; sirve para buscar imágenes.",
  "ASR": "Automatic Speech Recognition: convertir audio en texto."
};

const TERM_KEYS = Object.keys(TERMS).sort((a, b) => b.length - a.length);
const TERM_LOOKUP = new Map(TERM_KEYS.map((k) => [k.toLowerCase(), k]));

function escapeTerm(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TERM_RE = new RegExp(
  "(?<![\\p{L}\\p{N}_])(?:" + TERM_KEYS.map(escapeTerm).join("|") + ")(?![\\p{L}\\p{N}_])",
  "giu"
);

let termTipEl = null;

function annotateTerms(root) {
  if (!root) return;

  const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (
        parent.closest(
          "script,style,code,pre,kbd,a,button,input,textarea,select,option,.term,.no-terms"
        )
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const text = node.nodeValue;
    TERM_RE.lastIndex = 0;

    let match;
    let last = 0;
    let changed = false;
    const frag = document.createDocumentFragment();

    while ((match = TERM_RE.exec(text))) {
      const raw = match[0];
      const key = TERM_LOOKUP.get(raw.toLowerCase());
      if (!key || seen.has(key)) continue;

      if (match.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, match.index)));
      }

      const span = document.createElement("span");
      span.className = "term";
      span.tabIndex = 0;
      span.setAttribute("role", "note");
      span.setAttribute("aria-describedby", "term-tip");
      span.dataset.def = TERMS[key];
      span.textContent = raw;

      frag.appendChild(span);
      seen.add(key);
      last = match.index + raw.length;
      changed = true;
    }

    if (changed) {
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    }
  }
}

function initTermTips() {
  termTipEl = document.getElementById("term-tip");
  if (!termTipEl) return;

  const hide = () => termTipEl.classList.remove("show");

  const show = (el) => {
    const def = el.dataset.def;
    if (!def) return;

    termTipEl.textContent = def;
    termTipEl.classList.add("show");

    const r = el.getBoundingClientRect();
    const tw = termTipEl.offsetWidth;
    const th = termTipEl.offsetHeight;

    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tw - 12));

    let top = r.top - th - 10;
    if (top < 12) top = r.bottom + 10;

    termTipEl.style.left = left + "px";
    termTipEl.style.top = top + "px";
  };

  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(".term");
    if (el) show(el);
  });

  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest(".term");
    if (el && !el.contains(e.relatedTarget)) hide();
  });

  document.addEventListener("focusin", (e) => {
    const el = e.target.closest(".term");
    if (el) show(el);
  });

  document.addEventListener("focusout", (e) => {
    if (e.target.closest(".term")) hide();
  });

  document.addEventListener("scroll", hide, true);
  window.addEventListener("resize", hide);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest(".term");
    if (el) {
      show(el);
      return;
    }
    hide();
  });
}
