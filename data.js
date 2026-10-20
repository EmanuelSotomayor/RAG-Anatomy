/* RAG Anatomy — contenido de las 4 fases */

const PHASES = [
  {
    id: "chunking",
    num: 1,
    name: "CHUNKING",
    kicker: "Ingesta · Chunking · Embeddings · Indexación",
    tagline: "De documentos crudos a un índice consultable.",
    accent: "#f59e0b",
    isoTint: { top: "#fbbf24", left: "#d97706", right: "#b45309" },
    purpose:
      "También llamada Indexing: convertir un corpus heterogéneo en una estructura consultable: chunks con significado, vectores comparables y metadata que permita filtrar y autorizar.",
    analogy:
      "Es un ETL + indexing. Parseás fuentes, normalizás, particionás en registros y construís un índice, igual que preparar una tabla para consultas rápidas.",
    input: {
      title: "Documentos crudos",
      items: [
        "PDF, HTML, Markdown, DOCX, PPTX",
        "Filas de base de datos, tickets, transcripciones",
        "Código fuente e imágenes escaneadas",
        "Cada fuente con su parser y su ruido"
      ]
    },
    output: {
      title: "Índice consultable",
      items: [
        "Índice vectorial ANN (HNSW / IVF / PQ)",
        "Índice léxico BM25 / SPLADE (opcional)",
        "Chunk store: texto + metadata + parent_id",
        "Configuración versionada (embedder, chunk_size, overlap)"
      ]
    },
    contractDetail: {
      intro:
        "La salida no es un solo objeto: es un paquete de artefactos que trabajan juntos. Cada uno resuelve una parte distinta de la búsqueda y tiene un consumidor concreto en RETRIEVAL.",
      items: [
        {
          name: "Índice vectorial",
          tag: "ANN · HNSW · IVF · PQ",
          what:
            "Guarda un vector por chunk y permite responder rápido «¿qué chunks se parecen a este vector?». No compara contra todos: usa una estructura aproximada para encontrar vecinos cercanos.",
          role:
            "Es el motor de la búsqueda semántica. RETRIEVAL convierte la query en un vector y le pide los vecinos más cercanos.",
          connect:
            "Sin este índice, RETRIEVAL tendría que recorrer todos los chunks en cada pregunta. HNSW usa un grafo, IVF agrupa en clusters y PQ comprime los vectores para ahorrar memoria.",
          dev:
            "Como un mapa organizado por zonas: llegás a la zona correcta sin revisar calle por calle."
        },
        {
          name: "Índice léxico",
          tag: "BM25 · SPLADE",
          what:
            "Indexa palabras y términos exactos. Encuentra coincidencias literales que la búsqueda semántica puede pasar por alto.",
          role:
            "Se consulta en paralelo al índice vectorial (búsqueda híbrida). Es clave para nombres propios, códigos, siglas y números.",
          connect:
            "RETRIEVAL fusiona ambos rankings antes del reranking. BM25 es el clásico; SPLADE es léxico neural con expansión de términos.",
          dev:
            "Como el índice alfabético de un libro: si sabés la palabra exacta, es el camino más directo."
        },
        {
          name: "Chunk store",
          tag: "texto + metadata + parent_id",
          what:
            "Es la base donde vive el contenido real de cada chunk: el texto, sus datos y el vínculo con su documento padre.",
          role:
            "El índice devuelve IDs y scores; el chunk store resuelve el texto que se inserta en el prompt. La metadata permite filtrar por tenant, ACL o fecha; parent_id permite traer el contexto completo.",
          connect:
            "AUGMENTED consume el texto y la metadata para construir el prompt y el citations_map.",
          dev:
            "Como la ficha completa de un registro: el índice te da el ID y el store te da el contenido."
        },
        {
          name: "Configuración versionada",
          tag: "embedder · chunk_size · overlap",
          what:
            "Es el «cómo se construyó»: qué modelo convirtió texto en vectores, con qué tamaño de chunk y cuánto solapamiento entre fragmentos.",
          role:
            "Hace reproducible el índice. Si cambia el embedder, los vectores nuevos y viejos no son comparables: hay que reindexar todo.",
          connect:
            "RETRIEVAL debe usar el mismo embedder para la query; la auditoría necesita saber qué versión produjo cada respuesta.",
          dev:
            "Como el lockfile de dependencias: sin la versión exacta, el build no es reproducible."
        }
      ]
    },
    steps: [
      {
        n: "01",
        title: "Extracción / parsing",
        detail:
          "Convertir cada fuente a texto plano y estructura. PDFs nativos con PyMuPDF o pdfplumber; escaneados con OCR (Tesseract, PaddleOCR, docTR) más layout analysis (LayoutLM, Docling). HTML con Trafilatura o Readability; Office con Unstructured o Tika; código con tree-sitter.",
        algorithms: [
          "OCR · Tesseract / PaddleOCR / docTR",
          "Layout · LayoutLM / Detectron2 / Docling",
          "HTML · Trafilatura / Readability",
          "Código · tree-sitter (AST)"
        ],
        tip:
          "El layout analysis decide si una tabla se lee como tabla o como sopa de texto."
      },
      {
        n: "02",
        title: "Limpieza y deduplicación",
        detail:
          "Normalizar Unicode, whitespace, guiones de corte y headers/footers repetidos. Sacar boilerplate (menús, navegación, footers). Deduplicar exacto por hash y near-duplicate por MinHash + LSH o SimHash.",
        algorithms: [
          "SHA-256 · duplicado exacto",
          "MinHash + LSH · near-duplicate",
          "SimHash · similitud de documentos"
        ],
        tip:
          "Un mismo contrato versionado diez veces contamina el top-k y desperdicia presupuesto de contexto."
      },
      {
        n: "03",
        title: "Enriquecimiento de metadata",
        detail:
          "Cada chunk arrastra doc_id, chunk_id, source, title, section, page, date, author, version, language, hash y ACL/permisos. No es decoración: habilita filtros y seguridad multi-tenant.",
        algorithms: [
          "Extracción de secciones por parser estructural",
          "Propagación de ACL desde la fuente",
          "Hash por chunk · indexado incremental"
        ],
        tip:
          "Sin ACL en el payload, un RAG multi-tenant filtra documentos entre clientes. Es el bug más caro de esta fase."
      },
      {
        n: "04",
        title: "Chunking",
        detail:
          "Partir el texto en unidades que quepan en el embedder, contengan un hecho completo y sean discriminables. La estrategia depende de la estructura del documento y del tipo de pregunta.",
        algorithms: [
          "Fixed-size · split cada N tokens",
          "Recursive · separadores jerárquicos",
          "Semantic · breakpoints por similitud",
          "Structural / AST · headers y código",
          "Late chunking · cortar vectores, no texto"
        ],
        tip:
          "Medí el tamaño en tokens del embedder, no del LLM: si te pasás de max_seq_length, el texto se trunca en silencio."
      },
      {
        n: "05",
        title: "Vectorización",
        detail:
          "Convertir cada chunk en un vector denso con un bi-encoder. Normalizar L2, usar el prefijo correcto (query/passage), respetar max_seq_length y cachear por hash para no re-embeddear lo que no cambió.",
        algorithms: [
          "Sentence-BERT",
          "E5 / BGE / GTE",
          "Voyage / Cohere Embed",
          "OpenAI text-embedding-3",
          "Matryoshka · dimensiones truncables"
        ],
        tip:
          "Un prefijo query/passage equivocado degrada el recall sin dar ningún error. Es una falla silenciosa."
      },
      {
        n: "06",
        title: "Indexación",
        detail:
          "Guardar vectores, payload y opcionalmente un índice léxico. Elegir estructura ANN según escala, latencia, RAM y necesidad de filtros. Sostener actualizaciones incrementales sin reindexar todo.",
        algorithms: [
          "Flat · exacto, O(N)",
          "IVF · k-means, nlist / nprobe",
          "HNSW · grafo, M / efConstruction / efSearch",
          "PQ / IVF-PQ · compresión",
          "BM25 / SPLADE · léxico",
          "ScaNN / DiskANN · escala"
        ],
        tip:
          "Reindexar todo es carísimo. Necesitás upsert/delete por doc_id y una política de staleness."
      }
    ],
    algorithms: [
      { name: "PyMuPDF · pdfplumber", role: "Parser PDF", detail: "Extrae texto y coordenadas; es la base del chunking layout-aware." },
      { name: "Tesseract · PaddleOCR", role: "OCR", detail: "Texto desde imágenes. La calidad depende del preprocesado y del layout." },
      { name: "LayoutLM · Docling", role: "Layout analysis", detail: "Detecta bloques, tablas y columnas antes de segmentar." },
      { name: "MinHash + LSH", role: "Dedupe near-duplicate", detail: "Encuentra casi-duplicados sin comparar todo contra todo." },
      { name: "Recursive splitter", role: "Chunking base", detail: "Corta por separadores jerárquicos hasta el tamaño objetivo." },
      { name: "spaCy · pySBD", role: "Sentence boundary", detail: "Detecta oraciones para no cortar a mitad de frase." },
      { name: "Semantic chunker", role: "Chunking semántico", detail: "Corta donde cae la similitud entre oraciones consecutivas." },
      { name: "Bi-encoder (E5/BGE/GTE)", role: "Embeddings", detail: "Convierte texto en vectores comparables por coseno o producto interno." },
      { name: "HNSW", role: "ANN · grafo", detail: "Buen recall y latencia; consume mucha RAM." },
      { name: "IVF-PQ", role: "ANN · comprimido", detail: "Menos RAM; el recall se ajusta con nprobe." },
      { name: "BM25", role: "Léxico", detail: "Full-text exacto; complementa al denso en búsquedas híbridas." },
      { name: "SPLADE", role: "Léxico neural", detail: "Expansión de términos con pesos dispersos." }
    ],
    strategies: [
      { name: "Fixed-size", how: "N tokens fijos con overlap.", when: "Baseline, texto homogéneo.", tradeoff: "Simple y parejo; corta ideas al medio." },
      { name: "Recursivo", how: "Baja por párrafo → oración → palabra.", when: "Default razonable.", tradeoff: "Respeta bastante estructura sin parsear." },
      { name: "Estructural", how: "Respeta headers, secciones, listas y tablas.", when: "Docs técnicos, wikis, manuales.", tradeoff: "Requiere parser; excelente coherencia." },
      { name: "Por oraciones", how: "Agrupa oraciones detectadas por NLP.", when: "Alta precisión factual.", tradeoff: "Necesita un sentence splitter robusto." },
      { name: "Semántico", how: "Corta en caídas de similitud entre oraciones.", when: "Texto sin estructura.", tradeoff: "Costo de embeddings; umbral sensible." },
      { name: "Layout-aware", how: "Usa coordenadas y bloques del PDF.", when: "PDFs complejos, tablas.", tradeoff: "Depende del parser; muy buen resultado." },
      { name: "AST-aware", how: "Corta por función, clase o método.", when: "Código fuente.", tradeoff: "Unidades sintácticamente completas." },
      { name: "Proposicional", how: "Un LLM descompone en proposiciones atómicas.", when: "Máxima precisión en QA factual.", tradeoff: "Caro y lento." },
      { name: "Late chunking", how: "Embeddea el documento y luego corta los vectores.", when: "Mitigar semantic collapse.", tradeoff: "Requiere embedder de contexto largo." },
      { name: "Agentic", how: "Un agente decide los límites.", when: "Experimental.", tradeoff: "Flexible; no determinista." }
    ],
    patterns: [
      { name: "Parent-Document / Small-to-Big", detail: "Indexás el hijo chico para buscar preciso y recuperás el padre completo para el LLM. Como guardar la PK y hacer JOIN con la fila entera." },
      { name: "Sentence-Window", detail: "Indexás la oración y expandís ±N oraciones al momento de armar el contexto." },
      { name: "Contextual Retrieval", detail: "Un LLM antepone a cada chunk 1–2 frases de contexto antes de indexarlo. Mejora el recall de forma medible." }
    ],
    hyperparams: [
      { name: "chunk_size", typical: "200–500 tokens", effect: "Punto de partida, no una regla: se ajusta midiendo Recall@k. Más chico = match preciso; más grande = más contexto y más dilución." },
      { name: "overlap", typical: "10–20%", effect: "Evita cortar un hecho al medio; gasta storage." },
      { name: "min_chunk_size", typical: "50–100 tokens", effect: "Descarta fragmentos basura." },
      { name: "max_seq_length", typical: "según embedder", effect: "Si el chunk lo excede, se trunca en silencio." },
      { name: "dimensions", typical: "384–3072", effect: "Más dimensiones = más señal y más costo/RAM." },
      { name: "métrica", typical: "coseno / IP", effect: "Con vectores L2-normalizados son equivalentes." },
      { name: "nlist / nprobe", typical: "4√N / 8–32", effect: "Más nprobe = más recall y más latencia." },
      { name: "M / efConstruction / efSearch", typical: "16–64 / 100–400 / 50–200", effect: "Calidad del grafo HNSW contra RAM y latencia." }
    ],
    failures: [
      { name: "OCR basura", detail: "El texto entra mal y ningún embedding lo rescata." },
      { name: "Corte a mitad de hecho", detail: "El chunk no contiene la respuesta completa." },
      { name: "Semantic collapse", detail: "Chunk grande: el promedio diluye el dato puntual." },
      { name: "Truncación silenciosa", detail: "Chunk mayor que max_seq_length; se pierde el final sin error." },
      { name: "Domain gap", detail: "El embedder no entiende tu jerga ni tus siglas." },
      { name: "Duplicados", detail: "Diez versiones del mismo documento copan el top-k." },
      { name: "ACL ausente", detail: "Fuga de documentos entre tenants." },
      { name: "Índice stale", detail: "El documento cambió y el índice no." }
    ],
    metrics: [
      { name: "Recall@k offline", detail: "¿El chunk correcto está en el top-k? Se mide sobre un set etiquetado." },
      { name: "Cobertura por documento", detail: "¿Quedó alguna sección sin indexar?" },
      { name: "Tasa de duplicados", detail: "Porcentaje de chunks near-duplicate en el índice." },
      { name: "Tokens truncados", detail: "Chunks que exceden max_seq_length del embedder." }
    ]
  },

  {
    id: "retrieval",
    num: 2,
    name: "RETRIEVAL",
    kicker: "Query · Candidate generation · Reranking",
    tagline: "De una pregunta a un ranking corto y preciso.",
    accent: "#38bdf8",
    isoTint: { top: "#7dd3fc", left: "#0ea5e9", right: "#0369a1" },
    purpose:
      "Dada una pregunta, producir un ranking corto y preciso de chunks relevantes, priorizando no perder el bueno antes que descartar el malo.",
    analogy:
      "Es el SELECT de la pregunta: primero un filtro amplio y barato (recall), después un ORDER BY caro y preciso (reranking).",
    input: {
      title: "Query del usuario",
      items: [
        "Texto de la pregunta",
        "Historial de conversación (opcional)",
        "tenant_id / ACL y filtros",
        "Idioma y preferencias"
      ]
    },
    output: {
      title: "Top-n chunks",
      items: [
        "Texto del chunk (y del padre si aplica)",
        "Score y posición en el ranking",
        "Metadata y procedencia",
        "Trazabilidad para auditar"
      ]
    },
    contractDetail: {
      intro:
        "La salida es un ranking, no una lista de textos sueltos. Cada campo existe para que AUGMENTED decida qué entra al prompt y para que puedas auditar por qué.",
      items: [
        {
          name: "Texto del chunk",
          tag: "chunk · parent",
          what:
            "El contenido que se va a insertar en el prompt. Si se usa parent-document, se incluye también el texto del padre para dar más contexto.",
          role:
            "Es la materia prima de la respuesta: sin texto no hay nada que aumentar.",
          connect:
            "AUGMENTED lo formatea y lo recorta según el presupuesto de tokens.",
          dev:
            "Como el resultado de un SELECT: primero traés la fila y después decidís qué columnas mostrar."
        },
        {
          name: "Score y posición",
          tag: "score · rank",
          what:
            "El número con el que el retriever ordenó cada candidato y su posición final después del reranking.",
          role:
            "Permite decidir qué chunks entran, cuáles se descartan y en qué orden. Un score alto no garantiza que el chunk responda la pregunta.",
          connect:
            "AUGMENTED usa el orden para poner lo mejor al principio y al final del contexto, donde el modelo presta más atención.",
          dev:
            "Como el ORDER BY de una consulta: el orden cambia lo que el usuario ve primero."
        },
        {
          name: "Metadata y procedencia",
          tag: "doc_id · página · ACL",
          what:
            "Los datos que identifican de dónde salió el chunk: documento, sección, página, tenant y permisos.",
          role:
            "Permite filtrar antes de buscar, citar después y auditar siempre. Sin metadata no hay citas verificables ni aislamiento entre clientes.",
          connect:
            "AUGMENTED construye el citations_map y GENERATION lo usa para citar.",
          dev:
            "Como la foreign key y el audit log: sin ellos no podés reconstruir el origen."
        },
        {
          name: "Trazabilidad",
          tag: "trace · candidatos · filtros",
          what:
            "El registro de qué query se buscó, con qué filtros, qué candidatos aparecieron y con qué scores.",
          role:
            "Sirve para depurar: si la respuesta falla, podés ver si el problema fue la query, el filtro, el índice o el ranking.",
          connect:
            "AUGMENTED y GENERATION agregan sus propias trazas para cerrar el recorrido completo.",
          dev:
            "Como los logs estructurados de un request: sin trazas, debuggeás a ciegas."
        }
      ]
    },
    steps: [
      {
        n: "01",
        title: "Preprocesamiento de query",
        detail:
          "Normalizar (lowercase, Unicode), detectar idioma, corregir ortografía y extraer entidades o filtros (fechas, producto, tenant) para el WHERE.",
        algorithms: [
          "Normalización Unicode",
          "Language detection",
          "NER / extracción de filtros",
          "Spell correction"
        ],
        tip: "Un filtro mal extraído puede vaciar el top-k aunque el índice esté perfecto."
      },
      {
        n: "02",
        title: "Transformación de query (pre-retrieval)",
        detail:
          "Reescribir la query usando el historial, expandir sinónimos y siglas, generar variantes, descomponer preguntas multi-hop o enrutar a otro índice. Acá se separa un RAG avanzado de uno naive.",
        algorithms: [
          "Query rewriting · LLM",
          "Query expansion · sinónimos / PRF",
          "HyDE · documento hipotético",
          "Multi-query · N variantes",
          "Decomposition · sub-preguntas",
          "Step-back · pregunta general primero",
          "Routing · elegir índice o herramienta"
        ],
        tip:
          "«¿Y eso cuánto sale?» no es una query: sin rewriting contra el historial, el retrieval no tiene chance."
      },
      {
        n: "03",
        title: "Encoding de la query",
        detail:
          "Embeddear la query con el mismo modelo de la fase 1 y el prefijo correcto (query: ...). Un mismatch de prefijo es una causa clásica de recall bajo.",
        algorithms: [
          "Bi-encoder · mismo modelo que el índice",
          "Prefijo query / passage",
          "Normalización L2"
        ],
        tip: "El prefijo no es opcional: E5 y BGE fueron entrenados con él."
      },
      {
        n: "04",
        title: "Candidate generation (stage 1)",
        detail:
          "Traer muchos candidatos (k = 50–200) con búsqueda densa, léxica o híbrida. Es la etapa orientada a recall: mejor traer de más que perder el correcto.",
        algorithms: [
          "Dense · HNSW / IVF / PQ",
          "Sparse · BM25 / SPLADE",
          "Hybrid · RRF o score fusion",
          "Filtered ANN · metadata filtering",
          "ColBERT · MaxSim multi-vector"
        ],
        tip:
          "Filtrar después del ANN puede dejar el top-k vacío o irrelevante. El filtered ANN es un problema no trivial."
      },
      {
        n: "05",
        title: "Reranking (stage 2)",
        detail:
          "Reordenar el top-K con un modelo que ve query y documento juntos. Es más caro (O(k)) pero mucho más preciso. Salida típica: top 3–10.",
        algorithms: [
          "Cross-encoder · BERT / RoBERTa",
          "monoT5 · bge-reranker",
          "Cohere Rerank",
          "Listwise / LLM reranker"
        ],
        tip:
          "Patrón clásico de IR: recall barato a escala, precisión cara sobre pocos."
      },
      {
        n: "06",
        title: "Post-procesamiento del contexto",
        detail:
          "Deduplicar, diversificar con MMR, comprimir, cortar por umbral y expandir al padre o a las oraciones vecinas. Lo que sale de acá entra directo a la fase 3.",
        algorithms: [
          "Deduplicación por hash",
          "MMR · diversidad",
          "Compresión extractiva",
          "LLMLingua · poda por perplejidad",
          "Score threshold",
          "Small-to-big / sentence window"
        ],
        tip:
          "Si nada supera el umbral, es mejor devolver «no encontré» que pasar ruido al generador."
      },
      {
        n: "07",
        title: "Iteración (opcional)",
        detail:
          "En preguntas multi-hop o cuando la confianza es baja, el sistema puede volver a recuperar: FLARE, Self-RAG, CRAG o un bucle agéntico tipo ReAct.",
        algorithms: [
          "FLARE · recuperar si baja la confianza",
          "Self-RAG · decidir si recuperar",
          "CRAG · evaluar y hacer fallback",
          "Agentic multi-hop · ReAct"
        ],
        tip: "Iterar sin criterio de corte es una forma cara de loop infinito."
      }
    ],
    algorithms: [
      { name: "HNSW / IVF", role: "ANN · candidate generation", detail: "Búsqueda aproximada sobre vectores; recall ajustable por efSearch / nprobe." },
      { name: "BM25", role: "Léxico", detail: "Score por frecuencia e IDF; excelente para siglas, códigos y nombres propios." },
      { name: "RRF (Reciprocal Rank Fusion)", role: "Fusión híbrida", detail: "Combina rankings con 1/(k + rank); no requiere calibrar escalas." },
      { name: "Cross-encoder", role: "Reranking", detail: "Puntúa query y documento juntos; preciso pero O(k)." },
      { name: "MMR", role: "Diversidad", detail: "Penaliza chunks parecidos entre sí; evita cinco copias del mismo párrafo." },
      { name: "HyDE", role: "Query transform", detail: "Genera una respuesta hipotética y embeddea eso como query." },
      { name: "Query decomposition", role: "Multi-hop", detail: "Parte la pregunta en sub-preguntas resolubles por separado." },
      { name: "ColBERT", role: "Multi-vector", detail: "Un vector por token con MaxSim; punto medio entre bi-encoder y cross-encoder." },
      { name: "Self-RAG / CRAG", role: "Evaluación y fallback", detail: "Deciden si recuperar o corrigen el retrieval cuando la calidad es baja." }
    ],
    strategies: [
      { name: "Dense", how: "Similitud coseno sobre embeddings.", when: "Lenguaje natural, paráfrasis.", tradeoff: "Semántica fuerte; flojo con códigos y siglas." },
      { name: "Sparse", how: "BM25 o SPLADE sobre términos.", when: "Nombres propios, códigos, jerga exacta.", tradeoff: "Exacto; no entiende sinónimos." },
      { name: "Hybrid", how: "Denso + léxico fusionados con RRF.", when: "Producción general.", tradeoff: "Mejor recall; más infraestructura." },
      { name: "Multi-vector", how: "ColBERT con MaxSim.", when: "Máxima precisión.", tradeoff: "Mucho más storage y cómputo." },
      { name: "Hierarchical", how: "Documento → sección → chunk.", when: "Documentos largos y estructurados.", tradeoff: "Varias etapas; más latencia." },
      { name: "Two-stage", how: "ANN top-100 → cross-encoder top-5.", when: "Default de calidad.", tradeoff: "El estándar; cuesta el rerank." }
    ],
    hyperparams: [
      { name: "k (candidatos)", typical: "50–200", effect: "Más k = más recall y más costo de rerank." },
      { name: "efSearch", typical: "50–200", effect: "Más alto = más recall en HNSW y más latencia." },
      { name: "nprobe", typical: "8–32", effect: "Más clusters visitados = más recall en IVF." },
      { name: "RRF k", typical: "60", effect: "Suaviza la fusión de rankings." },
      { name: "MMR lambda", typical: "0.5–0.7", effect: "Más alto = más relevancia; más bajo = más diversidad." },
      { name: "rerank top-n", typical: "3–10", effect: "Cuántos chunks pasan a la fase 3." },
      { name: "score threshold", typical: "depende del modelo", effect: "Corta ruido; calibrar con datos reales." }
    ],
    failures: [
      { name: "Vocabulary mismatch", detail: "La pregunta usa palabras que no aparecen en el documento." },
      { name: "Domain gap", detail: "El embedder no representa tu dominio." },
      { name: "Error de aproximación ANN", detail: "efSearch o nprobe demasiado bajos." },
      { name: "Filter-induced recall loss", detail: "El filtro de metadata deja fuera el chunk correcto." },
      { name: "k demasiado chico", detail: "El bueno no entra al top-k." },
      { name: "Sesgo léxico o semántico", detail: "Un solo canal domina la fusión." },
      { name: "Query ambigua", detail: "Sin rewriting ni historial, se busca otra cosa." },
      { name: "Similitud ≠ relevancia", detail: "Un chunk topicalmente parecido puede no responder la pregunta." },
      { name: "Índice stale", detail: "Se busca en una versión vieja del corpus." }
    ],
    metrics: [
      { name: "Recall@k", detail: "¿El chunk correcto está entre los k primeros?" },
      { name: "Precision@k", detail: "De los k recuperados, cuántos son relevantes." },
      { name: "MRR", detail: "Posición del primer resultado relevante." },
      { name: "nDCG", detail: "Calidad del orden completo del ranking." },
      { name: "Hit rate", detail: "Porcentaje de queries con al menos un acierto." }
    ],
    training: {
      intro:
        "El retriever naive usa embeddings preentrenados que no saben nada de tu dominio. El retriever diferenciable se entrena con pares query-documento y, en el paper original de RAG, con el gradiente que viene del generador.",
      items: [
        { name: "Bi-encoder dual", how: "Dos encoders: uno para query y otro para documento.", when: "Default de producción.", tradeoff: "Documentos precomputados; la query se encodea al vuelo." },
        { name: "InfoNCE / contraste", how: "Softmax sobre un positivo y muchos negativos.", when: "Entrenamiento base.", tradeoff: "Batch grande = más negativos = mejor contraste." },
        { name: "In-batch negatives", how: "Los positivos de otras queries del batch sirven de negativos.", when: "Siempre.", tradeoff: "Gratis y efectivo; puede haber falsos negativos." },
        { name: "Hard negatives", how: "Negativos parecidos pero incorrectos, extraídos con BM25 o con el retriever.", when: "Cuando el recall se estanca.", tradeoff: "Es lo que más mueve la aguja; riesgo de sesgo." },
        { name: "RAG-Sequence", how: "Un documento para toda la respuesta; se marginaliza sobre el top-k.", when: "Respuestas cortas y coherentes.", tradeoff: "Gradiente fluye del generador al retriever." },
        { name: "RAG-Token", how: "Marginalización por token: cada token puede usar un documento distinto.", when: "Respuestas largas y multi-fuente.", tradeoff: "Más flexible; más costo." },
        { name: "REALM", how: "Índice asíncrono + Expectation-Maximization.", when: "Entrenamiento a gran escala.", tradeoff: "Complejo de implementar." },
        { name: "Destilación cross-encoder", how: "Un cross-encoder puntúa pares y el bi-encoder aprende de esas scores.", when: "Embedders modernos.", tradeoff: "Muy buena calidad; pipeline de training más largo." }
      ],
      callout:
        "La idea central del paper: el retriever no aprende a traer lo más parecido, aprende a traer lo que hace que el generador acierte."
    }
  },

  {
    id: "augmented",
    num: 3,
    name: "AUGMENTED",
    kicker: "Presupuesto · Orden · Formato · Defensa",
    tagline: "De chunks recuperados a un prompt óptimo.",
    accent: "#a78bfa",
    isoTint: { top: "#c4b5fd", left: "#8b5cf6", right: "#6d28d9" },
    purpose:
      "Convertir (query, chunks) en un prompt óptimo para el LLM: asignar presupuesto de tokens, ordenar, formatear y defenderse de input malicioso.",
    analogy:
      "Es armar los argumentos de la función y validar el contrato: no concatenás strings, asignás un presupuesto y defendés el input.",
    input: {
      title: "Query + chunks",
      items: [
        "Query (eventualmente reescrita)",
        "Top-n chunks con score y metadata",
        "Historial de conversación",
        "Configuración de citas y presupuesto"
      ]
    },
    output: {
      title: "Prompt final",
      items: [
        "messages: system + user",
        "citations_map: doc_id → fuente",
        "token_count y presupuesto usado",
        "trace: chunks usados y descartados"
      ]
    },
    contractDetail: {
      intro:
        "La salida es el input exacto del LLM. No es «un prompt» genérico: es un contrato con rol, evidencia, presupuesto y un mapa de citas.",
      items: [
        {
          name: "messages",
          tag: "system · user",
          what:
            "La estructura de mensajes que recibe el modelo. system define rol, reglas y formato; user lleva la pregunta y el contexto recuperado.",
          role:
            "Separa instrucciones de evidencia. Es la base del instruction hierarchy y de la defensa contra prompt injection.",
          connect:
            "GENERATION lo consume tal cual; no vuelve a armar el contexto.",
          dev:
            "Como separar configuración de argumentos en una función: no mezclás flags con datos."
        },
        {
          name: "citations_map",
          tag: "doc_id → fuente",
          what:
            "Un mapa que conecta cada fragmento insertado con su documento, página y quote original.",
          role:
            "Permite que la respuesta cite fuentes verificables y que puedas rastrear cada afirmación.",
          connect:
            "GENERATION lo usa para emitir citations y marcar grounded.",
          dev:
            "Como una tabla de referencias: cada dato apunta a su origen."
        },
        {
          name: "Token count y presupuesto",
          tag: "tokens · budget",
          what:
            "Cuántos tokens ocupa el prompt final y cuánto del presupuesto asignado se usó.",
          role:
            "Controla costo, latencia y truncamiento. Si te pasás, el modelo corta el final o falla.",
          connect:
            "GENERATION hereda ese presupuesto; si falta espacio, se recortan chunks antes de llamar al modelo.",
          dev:
            "Como el límite de payload de una API: si lo superás, el request se rechaza o se corta."
        },
        {
          name: "Trace de contexto",
          tag: "usados · descartados",
          what:
            "El registro de qué chunks entraron, cuáles quedaron afuera y por qué: score, presupuesto, deduplicación o filtro.",
          role:
            "Explica la decisión de contexto y permite mejorar retrieval y augmentation con evidencia.",
          connect:
            "GENERATION lo adjunta al trace final para auditoría.",
          dev:
            "Como el diff de un build: sabés qué entró y qué se descartó."
        }
      ]
    },
    steps: [
      {
        n: "01",
        title: "Selección y presupuesto de tokens",
        detail:
          "Calcular el budget: ventana del modelo menos prompt de sistema, salida esperada y margen. Contar con el tokenizador del LLM (tiktoken), no con el del embedder. Seleccionar los mejores chunks que entren.",
        algorithms: [
          "tiktoken · conteo de tokens",
          "Greedy por score",
          "Knapsack con costos heterogéneos",
          "MMR · selección diversa"
        ],
        tip: "El tokenizador del embedder y el del LLM no coinciden. Contar con el equivocado te hace overflow."
      },
      {
        n: "02",
        title: "Ordenamiento",
        detail:
          "Los LLM atienden más al inicio y al final del contexto (lost in the middle). Poner los mejores chunks en los extremos, agrupar por fuente y respetar el orden lógico dentro de cada documento.",
        algorithms: [
          "Best-first en extremos",
          "Agrupación por documento",
          "Orden narrativo / por sección"
        ],
        tip: "Meter el mejor chunk en el medio es regalarlo."
      },
      {
        n: "03",
        title: "Formateo del contexto",
        detail:
          "Delimitar cada documento con tags claros y numerados, inyectar metadata útil (título, sección, fecha) y marcar el contenido como datos, no como instrucciones.",
        algorithms: [
          "Tags XML / delimitadores",
          "Numeración para citas",
          "Metadata inline",
          "Spotlighting / datamarking"
        ],
        tip: "Un delimitador claro también ayuda al modelo a citar correctamente."
      },
      {
        n: "04",
        title: "Construcción del prompt (4 capas)",
        detail:
          "System prompt con rol y reglas duras; contexto; mensaje del usuario; instrucciones de formato. Las reglas críticas: responder solo con el contexto, decir «no tengo esa información» si no está, y citar el doc_id.",
        algorithms: [
          "System prompt · rol y restricciones",
          "Few-shot examples",
          "JSON schema / formato de salida",
          "Citation instructions"
        ],
        tip: "Una instrucción de abstención explícita reduce alucinaciones más que cualquier temperatura baja."
      },
      {
        n: "05",
        title: "Compresión",
        detail:
          "Reducir tokens sin perder la señal: poda extractiva de oraciones, resumen abstractivo con un modelo chico, o LLMLingua por perplejidad.",
        algorithms: [
          "Compresión extractiva · similitud / NLI",
          "Resumen abstractivo",
          "LLMLingua / LongLLMLingua"
        ],
        tip: "Comprimir de más borra justo el detalle que hacía falta. Medí faithfulness después."
      },
      {
        n: "06",
        title: "Guardrails",
        detail:
          "Jerarquía de instrucciones (system > user > datos), sanitización del contenido recuperado, redacción de PII y enforcement de ACL como defensa en profundidad.",
        algorithms: [
          "Instruction hierarchy",
          "Detección de prompt injection",
          "PII redaction",
          "ACL enforcement"
        ],
        tip: "Un documento puede traer «ignorá lo anterior». El contenido recuperado es input no confiable."
      }
    ],
    algorithms: [
      { name: "tiktoken", role: "Token counting", detail: "Cuenta tokens con el tokenizador real del modelo; base del budgeting." },
      { name: "MMR / knapsack", role: "Selección de contexto", detail: "Elige chunks diversos o maximiza utilidad bajo un presupuesto." },
      { name: "LLMLingua", role: "Compresión", detail: "Poda tokens por perplejidad; compresión agresiva con pérdida controlada." },
      { name: "Spotlighting", role: "Defensa", detail: "Marca el contenido recuperado como datos, no como instrucciones." },
      { name: "Instruction hierarchy", role: "Defensa", detail: "Define prioridad entre system, user y contenido recuperado." },
      { name: "JSON schema", role: "Formato", detail: "Fuerza una salida parseable y validable." },
      { name: "NLI / similarity", role: "Compresión extractiva", detail: "Selecciona las oraciones que realmente sostienen la respuesta." }
    ],
    strategies: [
      { name: "Best-at-edges", how: "Mejores chunks al inicio y al final.", when: "Contextos largos.", tradeoff: "Mitiga lost in the middle sin costo." },
      { name: "Group-by-source", how: "Agrupa chunks del mismo documento.", when: "Múltiples documentos.", tradeoff: "Mejor coherencia; puede desplazar el mejor chunk." },
      { name: "Quote-first", how: "Pedir citas textuales antes de responder.", when: "Alta exigencia de fidelidad.", tradeoff: "Más tokens y latencia." },
      { name: "Abstention rule", how: "Instrucción explícita de decir «no sé».", when: "Siempre.", tradeoff: "Puede abstenerse de más si el contexto es pobre." },
      { name: "Compression", how: "Poda o resumen del contexto.", when: "Ventanas chicas o costo alto.", tradeoff: "Riesgo de borrar el dato clave." },
      { name: "Spotlighting", how: "Delimitar y marcar datos.", when: "Input externo no confiable.", tradeoff: "No es infalible; suma tokens." }
    ],
    hyperparams: [
      { name: "token budget", typical: "40–70% de la ventana", effect: "Más contexto = más señal, pero también más ruido y costo." },
      { name: "top-n al prompt", typical: "3–10", effect: "Cuántos chunks entran realmente." },
      { name: "orden", typical: "best-at-edges", effect: "Mitiga el sesgo posicional del modelo." },
      { name: "compression ratio", typical: "2–5x", effect: "Más compresión = menos costo y más riesgo de pérdida." },
      { name: "citation mode", typical: "inline / quote", effect: "Trazabilidad y verificabilidad." },
      { name: "abstention", typical: "explícita", effect: "Reduce alucinaciones; calibra el umbral." }
    ],
    failures: [
      { name: "Context overflow", detail: "El prompt no entra en la ventana y se trunca." },
      { name: "Lost in the middle", detail: "El dato clave queda en el medio y el modelo lo ignora." },
      { name: "Redundancia", detail: "Cinco chunks dicen lo mismo y gastan presupuesto." },
      { name: "Contexto contradictorio", detail: "Dos fuentes dicen cosas distintas y el modelo elige mal." },
      { name: "Prompt injection indirecta", detail: "Un documento trae instrucciones maliciosas." },
      { name: "Conflicto de instrucciones", detail: "El contenido compite con el system prompt." },
      { name: "Citas mal mapeadas", detail: "El doc_id citado no contiene la afirmación." },
      { name: "Fuga por ACL", detail: "Un chunk no autorizado llega al prompt." }
    ],
    metrics: [
      { name: "Context relevance", detail: "¿El contexto ensamblado sirve para responder?" },
      { name: "Context precision", detail: "¿Los chunks útiles están arriba en el contexto?" },
      { name: "Token efficiency", detail: "Tokens útiles contra tokens totales del prompt." },
      { name: "Discard rate", detail: "Cuánto del top-n se descarta por presupuesto." }
    ]
  },

  {
    id: "generation",
    num: 4,
    name: "GENERATION",
    kicker: "Decoding · Citas · Verificación · Abstención",
    tagline: "De un prompt a una respuesta fiel y trazable.",
    accent: "#34d399",
    isoTint: { top: "#6ee7b7", left: "#10b981", right: "#047857" },
    purpose:
      "Producir una respuesta fiel al contexto, con citas y trazabilidad, y validarla antes de devolverla.",
    analogy:
      "Es el return tipado con validación: el contrato dice que solo podés devolver datos del contexto, y hay un test que lo verifica antes de responder.",
    input: {
      title: "Prompt final",
      items: [
        "messages: system + user",
        "citations_map y metadata",
        "trace de chunks usados",
        "Configuración de decoding"
      ]
    },
    output: {
      title: "Respuesta validada",
      items: [
        "answer",
        "citations con doc_id, página y quote",
        "grounded: true / false",
        "confidence y trace completo"
      ]
    },
    contractDetail: {
      intro:
        "La salida no es solo texto: es una respuesta con evidencia, un veredicto de grounding y la traza para auditarla. Si falta cualquiera de esos campos, el contrato se rompe.",
      items: [
        {
          name: "Answer",
          tag: "texto final",
          what:
            "La respuesta en lenguaje natural que ve el usuario.",
          role:
            "Es el objetivo del pipeline, pero no alcanza por sí sola: necesita citas y verificación.",
          connect:
            "Se devuelve al usuario o a la aplicación que la consuma.",
          dev:
            "Como el return de una función: el valor que sale del sistema."
        },
        {
          name: "Citations",
          tag: "doc_id · página · quote",
          what:
            "Las fuentes exactas que respaldan cada afirmación, con el fragmento textual que la soporta.",
          role:
            "Hacen verificable la respuesta y permiten al usuario abrir la fuente.",
          connect:
            "Se construyen desde el citations_map de AUGMENTED y se validan contra los chunks usados.",
          dev:
            "Como los tests que respaldan un cambio: sin evidencia, no hay confianza."
        },
        {
          name: "Grounded",
          tag: "true / false",
          what:
            "Un veredicto sobre si la respuesta está soportada por el contexto recuperado.",
          role:
            "Si es false, el sistema debería abstenerse, reparar o marcar la respuesta como no confiable.",
          connect:
            "Alimenta la decisión de abstención y las métricas de faithfulness.",
          dev:
            "Como el resultado de una validación: pass/fail antes de devolver."
        },
        {
          name: "Confidence y trace",
          tag: "confidence · trace",
          what:
            "Un indicador de confianza y el recorrido completo: query, chunks, prompt, respuesta y verificación.",
          role:
            "Permite monitorear, auditar y reproducir por qué el sistema respondió eso.",
          connect:
            "Cierra el contrato y alimenta observabilidad, feedback y evaluación.",
          dev:
            "Como el request ID y los logs: sin eso no podés investigar un incidente."
        }
      ]
    },
    steps: [
      {
        n: "01",
        title: "Inferencia y decoding",
        detail:
          "El modelo decoder-only genera la respuesta condicionada al contexto. Para tareas factuales conviene baja temperatura; para formato estricto, constrained decoding.",
        algorithms: [
          "Transformer decoder",
          "Greedy / beam search",
          "Sampling · temperature, top-p, top-k, min-p",
          "Repetition penalty",
          "Constrained decoding · GBNF / regex / JSON schema"
        ],
        tip: "Temperatura alta en RAG factual es una fábrica de variaciones creativas de la verdad."
      },
      {
        n: "02",
        title: "Atribución y citas",
        detail:
          "Pedir citas inline o quotes y mapearlas a los chunks. La atribución post-hoc alinea cada afirmación con su fuente a nivel de oración.",
        algorithms: [
          "Inline citation [doc_id]",
          "Quote extraction",
          "Sentence-level attribution",
          "Citation verification"
        ],
        tip: "Una cita que no contiene la afirmación es peor que no citar: da falsa confianza."
      },
      {
        n: "03",
        title: "Verificación de fidelidad",
        detail:
          "Antes de devolver, chequear que cada afirmación esté implicada por el contexto. Se puede hacer con un modelo NLI, con un LLM juez, o con ambos.",
        algorithms: [
          "NLI · DeBERTa-MNLI",
          "LLM-as-a-judge · claim decomposition",
          "RAGAS faithfulness",
          "Schema validation"
        ],
        tip: "Descomponer en claims y verificar uno por uno es más robusto que pedir «¿es fiel?» de una."
      },
      {
        n: "04",
        title: "Repair / abstención",
        detail:
          "Si la fidelidad es baja, regenerar con instrucción más estricta, podar la afirmación no soportada, o abstenerse. Abstenerse bien es una feature, no un fallo.",
        algorithms: [
          "Repair loop con umbral",
          "Claim pruning",
          "Abstención explícita",
          "Re-retrieval · CRAG / Self-RAG"
        ],
        tip: "Un «no tengo esa información» correcto vale más que una respuesta inventada."
      },
      {
        n: "05",
        title: "Ensamblado final",
        detail:
          "Devolver respuesta, citas, flag de grounded, confianza y trace. El trace permite auditar, evaluar y depurar el sistema después.",
        algorithms: [
          "Response assembly",
          "Confidence scoring",
          "Trace logging",
          "PII / toxicity filters"
        ],
        tip: "Sin trace no podés diagnosticar por fase; solo ves el resultado final."
      }
    ],
    algorithms: [
      { name: "Transformer decoder", role: "Generación", detail: "Modelo autorregresivo; el contexto entra en la ventana de atención." },
      { name: "Greedy / beam", role: "Decoding determinista", detail: "Reproducible; bueno para datos factuales." },
      { name: "Top-p / top-k / min-p", role: "Sampling", detail: "Controla diversidad; en RAG factual conviene bajo." },
      { name: "Constrained decoding", role: "Formato", detail: "Gramática o schema garantiza salida parseable." },
      { name: "DeBERTa-MNLI", role: "Verificación NLI", detail: "Chequea si el contexto implica cada afirmación." },
      { name: "LLM-as-a-judge", role: "Verificación", detail: "Descompone en claims y evalúa fidelidad y relevancia." },
      { name: "RAGAS", role: "Evaluación", detail: "Faithfulness, answer relevance, context precision y recall." },
      { name: "CRAG / Self-RAG", role: "Repair loop", detail: "Disparan re-retrieval o abstención según la calidad." }
    ],
    strategies: [
      { name: "Low temperature", how: "Temperatura cercana a 0.", when: "Datos factuales.", tradeoff: "Menos variedad; más repetitivo." },
      { name: "Quote-then-answer", how: "Primero extrae citas, después responde.", when: "Alta exigencia de fidelidad.", tradeoff: "Más tokens y latencia." },
      { name: "Schema-constrained", how: "Salida JSON validada.", when: "Integración con sistemas.", tradeoff: "Rígido; puede forzar formato sobre contenido." },
      { name: "Self-check", how: "Verificar claims contra el contexto.", when: "Producción.", tradeoff: "Costo extra por respuesta." },
      { name: "Abstention", how: "No responder si no hay soporte.", when: "Siempre.", tradeoff: "Calibrar el umbral para no abstenerte de más." },
      { name: "Repair loop", how: "Regenerar o podar claims no soportados.", when: "Faithfulness baja.", tradeoff: "Latencia y costo." }
    ],
    hyperparams: [
      { name: "temperature", typical: "0–0.2", effect: "Baja = determinismo y fidelidad; alta = creatividad." },
      { name: "top_p", typical: "0.9–1.0", effect: "Recorta la cola de probabilidad." },
      { name: "max_tokens", typical: "según caso", effect: "Limita costo y latencia." },
      { name: "citation mode", typical: "inline", effect: "Trazabilidad por afirmación." },
      { name: "faithfulness threshold", typical: "0.8–0.9", effect: "Dispara repair o abstención." },
      { name: "repair attempts", typical: "1–2", effect: "Más intentos = más costo; rendimientos decrecientes." }
    ],
    failures: [
      { name: "Alucinación pese al contexto", detail: "El modelo inventa aunque el dato esté disponible." },
      { name: "Prior sobre contexto", detail: "Impone conocimiento viejo y contradice la fuente." },
      { name: "Sobre-resumen", detail: "Pierde el detalle exacto que se preguntaba." },
      { name: "Cita incorrecta", detail: "El doc_id citado no contiene la afirmación." },
      { name: "Chunks contradictorios", detail: "Dos fuentes discrepan y el modelo elige mal." },
      { name: "Degradación en contexto largo", detail: "La señal se diluye y baja la calidad." },
      { name: "Obediencia a injection", detail: "Sigue instrucciones embebidas en un documento." },
      { name: "Abstención mal calibrada", detail: "Se abstiene cuando sí sabía, o responde cuando no." }
    ],
    metrics: [
      { name: "Faithfulness", detail: "¿La respuesta se sostiene en el contexto? Claim por claim." },
      { name: "Answer relevance", detail: "¿Responde lo que se preguntó?" },
      { name: "Answer correctness", detail: "¿Coincide con la respuesta de referencia?" },
      { name: "Citation accuracy", detail: "¿La cita contiene realmente la afirmación?" },
      { name: "Abstention correctness", detail: "¿Se abstiene cuando corresponde y solo entonces?" },
      { name: "Alcance de RAGAS", detail: "Faithfulness y answer relevance son reference-free; context recall y answer correctness requieren ground truth." }
    ]
  }
];

const OVERVIEW = {
  hero: {
    title: "RAG, de punta a punta",
    subtitle:
      "Una arquitectura que desacopla el conocimiento del modelo. No reentrena: recupera, aumenta y genera con la fuente delante.",
    pills: ["4 fases", "3 capas conceptuales", "4 contratos de datos", "1 regla: el retrieval es el techo"]
  },
  definition:
    "RAG (Retrieval-Augmented Generation) es un pipeline que, sin tocar los pesos del modelo, recupera fragmentos relevantes de una base de conocimiento externa y los inyecta en el contexto del LLM para que genere una respuesta fundamentada en esa información.",
  definitionTechnical:
    "El <strong>Retrieval Augmented Generation (RAG)</strong> es una <strong>arquitectura</strong> que, sin re-entrenar el <strong>modelo</strong>, permite recuperar <strong>información relevante</strong> de una <strong>base de conocimiento externa</strong> (memoria <strong>no paramétrica</strong>) y la inyecta en el contexto del <strong>LLM</strong> para que genere una respuesta fundamentada en esa información.",
  definitionSimple:
    "<strong>RAG</strong> es darle al <strong>LLM</strong> un <strong>buscador</strong> para que consulte nuestros <strong>documentos</strong> antes de responder.",
  notRag: [
    { label: "Fine-tuning", text: "Recompila el binario: modifica los pesos y el comportamiento. No es una vía confiable para inyectar conocimiento factual." },
    { label: "RAG", text: "Consulta la DB en runtime: el RAG estándar no toca los pesos. La familia RAG incluye variantes que entrenan retriever y/o generador." },
    { label: "Agente", text: "Un RAG no es necesariamente un agente. El pipeline es lineal; el bucle agéntico es una variante." }
  ],
  contracts: [
    { from: "Documentos crudos", phase: "1 · CHUNKING", to: "Índice vectorial + sparse + chunk store + metadata" },
    { from: "Query", phase: "2 · RETRIEVAL", to: "Top-n chunks ordenados + scores + procedencia" },
    { from: "Query + chunks", phase: "3 · AUGMENTED", to: "messages + citations_map + trace" },
    { from: "Prompt final", phase: "4 · GENERATION", to: "Respuesta + citas + grounded + confidence" }
  ],
  priority: [
    { n: "1", label: "Retrieval + chunking", note: "Mueve más la aguja: si el buen chunk no entra al top-k, el generador no lo puede inventar." },
    { n: "2", label: "Reranking", note: "Segundo mayor impacto por esfuerzo." },
    { n: "3", label: "Prompt / augmentation", note: "Tercero. Orden, presupuesto y formato." },
    { n: "4", label: "Modelo generador", note: "Último. Cambiar de LLM rara vez arregla un retrieval roto." }
  ],
  diagnosis: [
    { symptom: "No encuentra el dato", metric: "Recall@k bajo", where: "Fase 1–2 · chunking / retrieval" },
    { symptom: "Encuentra ruido", metric: "Precision@k baja", where: "Fase 2 · filtros y reranking" },
    { symptom: "El contexto no sirve", metric: "Context relevance baja", where: "Fase 3 · selección y orden" },
    { symptom: "Inventa pese al contexto", metric: "Faithfulness baja", where: "Fase 4 · grounding y decoding" },
    { symptom: "Responde otra cosa", metric: "Answer relevance baja", where: "Fase 3–4 · prompt y modelo" }
  ],
  glossary: [
    { term: "Fine-tuning", dev: "Recompilar el binario" },
    { term: "RAG", dev: "Consultar la DB en runtime" },
    { term: "Chunking", dev: "ETL que parte en registros" },
    { term: "Embedding", dev: "Featurizar texto a vectores" },
    { term: "Vector store", dev: "DB con índice semántico" },
    { term: "Retrieval", dev: "SELECT ... LIMIT k (dense + grep)" },
    { term: "Reranker", dev: "ORDER BY score más fino" },
    { term: "Augmentation", dev: "Pasar parámetros al prompt" },
    { term: "Grounding", dev: "Contrato de salida: solo datos de la fuente" },
    { term: "RAGAS", dev: "Suite de tests con LLM-as-judge" },
    { term: "Agentic RAG", dev: "Orquestador con loop y retries" },
    { term: "Índice stale", dev: "Cache inválida" }
  ],
  variants: [
    { name: "Naive RAG", dev: "Script lineal", detail: "Retrieve → read. El pipeline vanilla: buscar, concatenar, responder." },
    { name: "Advanced RAG", dev: "Pipeline con etapas", detail: "Pre-retrieval (rewrite, HyDE) y post-retrieval (rerank, compresión)." },
    { name: "Modular RAG", dev: "Microservicios / plugins", detail: "Componentes intercambiables: routing, memoria, tools, evaluadores." },
    { name: "Self-RAG · CRAG · Adaptive", dev: "Retries con validación", detail: "El sistema decide si recuperar, evalúa lo recuperado y corrige o hace fallback." },
    { name: "GraphRAG", dev: "Grafo de conocimiento", detail: "Recupera sobre un knowledge graph en vez de (o además de) vectores." },
    { name: "Agentic RAG", dev: "Orquestador con loop", detail: "ReAct multi-hop: decide a qué fuente pegar, encadena llamadas y reintenta." }
  ],
  limits: [
    "El techo del sistema es el retriever: si el chunk correcto no entra al top-k, el generador no lo puede inventar.",
    "El domain gap del embedder define la semántica de la búsqueda; si no entiende tu jerga, el recall cae.",
    "El chunking es un hiperparámetro crítico y de efectos no triviales; se decide midiendo, no adivinando.",
    "RAG no elimina las alucinaciones: las mitiga condicionalmente y las desplaza hacia errores de fidelidad."
  ]
};
