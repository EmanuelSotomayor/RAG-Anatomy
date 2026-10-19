/* RAG Anatomy — páginas conceptuales: Fundamentos, Transversal, Decisiones */

const PAGES = [
  {
    id: "fundamentos",
    group: "Conceptos",
    num: "F",
    name: "FUNDAMENTOS",
    kicker: "Definiciones · Taxonomía · Mitos",
    tagline: "Las distinciones que evitan construir sobre arena.",
    accent: "#f472b6",
    purpose:
      "Antes del pipeline: qué es exactamente RAG, qué no es, cómo se compara con las alternativas y qué errores conceptuales se repiten en todos los equipos.",
    sections: [
      {
        id: "definiciones",
        title: "Definiciones precisas",
        sub: "Conceptos que se usan como sinónimos y no lo son. Esta tabla es la que evitaría la mitad de las discusiones de arquitectura.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Concepto</th><th>Definición precisa</th><th>Error común</th></tr></thead>
              <tbody>
                <tr><td><strong>Grounding</strong></td><td>Propiedad del sistema: la respuesta se genera condicionada a evidencia recuperada.</td><td class="muted">Confundirlo con "la respuesta es correcta".</td></tr>
                <tr><td><strong>Faithfulness</strong></td><td>Grado en que cada claim de la respuesta está implicado por el contexto.</td><td class="muted">Creer que grounding garantiza faithfulness.</td></tr>
                <tr><td><strong>Attribution</strong></td><td>Mapear cada claim a su fuente.</td><td class="muted">Confundirlo con citar el documento entero.</td></tr>
                <tr><td><strong>Citation</strong></td><td>Referencia explícita y verificable a la fuente.</td><td class="muted">Citar un documento que no contiene la afirmación.</td></tr>
                <tr><td><strong>Hallucination</strong></td><td>Claim no soportado por la evidencia. <em>Intrínseca</em> si contradice el contexto; <em>extrínseca</em> si agrega información no soportada.</td><td class="muted">Tratarla como un solo fenómeno.</td></tr>
                <tr><td><strong>Similarity ≠ relevance ≠ answerability</strong></td><td>Parecido semántico / utilidad para la pregunta / capacidad de responderla con lo recuperado.</td><td class="muted">Asumir que cosine alto = chunk útil.</td></tr>
                <tr><td><strong>Retrieval · ranking · reranking</strong></td><td>Recuperar candidatos / ordenarlos / reordenarlos con un modelo más caro.</td><td class="muted">Llamar "retrieval" a todo el pipeline.</td></tr>
                <tr><td><strong>Chunk · passage · span</strong></td><td>Unidad indexada / unidad recuperada / fragmento mínimo dentro de un texto.</td><td class="muted">Usar "chunk" para todo.</td></tr>
                <tr><td><strong>Parametric vs non-parametric memory</strong></td><td>Pesos del modelo vs índice externo.</td><td class="muted">Decir que RAG "memoriza".</td></tr>
                <tr><td><strong>Context window vs memory</strong></td><td>Ventana de atención vs estado persistente entre turnos.</td><td class="muted">Asumir que más ventana = más memoria.</td></tr>
                <tr><td><strong>Open-book vs closed-book QA</strong></td><td>Responder con evidencia externa vs solo con parámetros.</td><td class="muted">Usarlos como sinónimos de RAG.</td></tr>
                <tr><td><strong>Dense · sparse · hybrid</strong></td><td>Similitud vectorial / coincidencia léxica / fusión de ambas.</td><td class="muted">Creer que dense siempre gana.</td></tr>
                <tr><td><strong>Bi-encoder · cross-encoder · late interaction</strong></td><td>Encodea por separado / conjuntamente / por token con MaxSim.</td><td class="muted">Confundir costo con calidad.</td></tr>
                <tr><td><strong>Semantic cache vs KV cache</strong></td><td>Cachear respuestas por similitud de query vs cachear estados de atención.</td><td class="muted">Mezclar optimizaciones distintas.</td></tr>
                <tr><td><strong>Context rot vs lost in the middle</strong></td><td>Degradación general por contexto largo vs sesgo posicional específico.</td><td class="muted">Usarlos como sinónimos.</td></tr>
                <tr><td><strong>Poisoning · contamination · leakage</strong></td><td>Envenenar el corpus / contaminar el eval set / filtrar datos de entrenamiento.</td><td class="muted">Tratarlos como lo mismo.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout">Regla dura: <strong>grounding no es correctness</strong>. Un sistema puede estar perfectamente grounded y responder algo irrelevante, o estar bien fundamentado y aun así elegir la fuente equivocada.</div>
        `
      },
      {
        id: "comparativa",
        title: "RAG vs long context vs fine-tuning",
        sub: "La pregunta ya no es solo '¿RAG o fine-tuning?'. Con ventanas de 1M+ tokens, '¿RAG o long context?' es igual de importante.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Criterio</th><th>RAG</th><th>Long context</th><th>Fine-tuning</th></tr></thead>
              <tbody>
                <tr><td><strong>Frescura</strong></td><td>Alta: actualizás el índice</td><td>Alta: pasás el texto</td><td>Baja: requiere reentrenar</td></tr>
                <tr><td><strong>Costo por query</strong></td><td>Medio (retrieval + prompt corto)</td><td>Alto (tokens de entrada)</td><td>Bajo (pesos)</td></tr>
                <tr><td><strong>Costo de actualizar</strong></td><td>Bajo</td><td>Cero</td><td>Alto</td></tr>
                <tr><td><strong>Latencia</strong></td><td>Media</td><td>Alta con contextos enormes</td><td>Baja</td></tr>
                <tr><td><strong>Procedencia</strong></td><td>Alta: citás fuentes</td><td>Alta si citás</td><td>Baja: el conocimiento es difuso</td></tr>
                <tr><td><strong>ACL / multi-tenant</strong></td><td>Nativo (filtros por metadata)</td><td>Manual y frágil</td><td>No aplica</td></tr>
                <tr><td><strong>Escala del corpus</strong></td><td>Millones de documentos</td><td>Limitada a la ventana</td><td>Limitada a los pesos</td></tr>
                <tr><td><strong>Formato / estilo</strong></td><td>Por prompt</td><td>Por prompt</td><td>Excelente</td></tr>
                <tr><td><strong>Razonamiento de dominio</strong></td><td>Limitado al modelo base</td><td>Limitado al modelo base</td><td>Mejorable</td></tr>
                <tr><td><strong>Auditabilidad</strong></td><td>Alta</td><td>Alta</td><td>Baja</td></tr>
              </tbody>
            </table>
          </div>
          <div class="grid-3" style="margin-top:16px">
            <div class="mini-card"><span class="mini-tag">Elegí RAG</span><p>Corpus grande, cambiante, con permisos por usuario y necesidad de citar.</p></div>
            <div class="mini-card"><span class="mini-tag">Elegí long context</span><p>Corpus chico y estático, o tareas que requieren razonar sobre todo el documento a la vez.</p></div>
            <div class="mini-card"><span class="mini-tag">Elegí fine-tuning</span><p>Necesitás estilo, formato, tono o razonamiento de dominio; no conocimiento factual fresco.</p></div>
          </div>
          <div class="callout">En la práctica casi nunca es "o". Lo común es <strong>fine-tuning para comportamiento + RAG para evidencia + long context para documentos puntuales</strong>.</div>
        `
      },
      {
        id: "taxonomia",
        title: "Taxonomía de la familia RAG",
        sub: "No es una arquitectura, es una familia. Cada nivel agrega control, costo y superficie de falla.",
        html: `
          <div class="strategy-grid">
            <div class="strategy"><h3>Naive RAG</h3><p class="strategy-how">Retrieve → read. Buscar, concatenar y responder.</p><div class="strategy-row"><span>Agrega</span>El baseline mínimo.</div><div class="strategy-row trade"><span>Costo</span>Bajo; techo bajo.</div></div>
            <div class="strategy"><h3>Advanced RAG</h3><p class="strategy-how">Pre-retrieval (rewrite, HyDE) + post-retrieval (rerank, compresión).</p><div class="strategy-row"><span>Agrega</span>Calidad de query y de contexto.</div><div class="strategy-row trade"><span>Costo</span>Medio; más piezas que medir.</div></div>
            <div class="strategy"><h3>Modular RAG</h3><p class="strategy-how">Componentes intercambiables: routing, memoria, tools, evaluadores.</p><div class="strategy-row"><span>Agrega</span>Flexibilidad de arquitectura.</div><div class="strategy-row trade"><span>Costo</span>Complejidad operativa.</div></div>
            <div class="strategy"><h3>Self-reflective RAG</h3><p class="strategy-how">Self-RAG, CRAG, Adaptive-RAG: decide si recuperar, evalúa y corrige.</p><div class="strategy-row"><span>Agrega</span>Control sobre la calidad del retrieval.</div><div class="strategy-row trade"><span>Costo</span>Latencia y loops.</div></div>
            <div class="strategy"><h3>GraphRAG</h3><p class="strategy-how">Recupera sobre un knowledge graph además de (o en vez de) vectores.</p><div class="strategy-row"><span>Agrega</span>Relaciones y multi-hop estructurado.</div><div class="strategy-row trade"><span>Costo</span>Construcción y mantenimiento del grafo.</div></div>
            <div class="strategy"><h3>Agentic RAG</h3><p class="strategy-how">Un orquestador con loop decide fuentes, encadena llamadas y reintenta.</p><div class="strategy-row"><span>Agrega</span>Multi-hop y uso de herramientas.</div><div class="strategy-row trade"><span>Costo</span>No determinista; difícil de evaluar.</div></div>
          </div>
        `
      },
      {
        id: "mitos",
        title: "Mitos y anti-patrones",
        sub: "Cada uno de estos cuesta semanas de debugging.",
        html: `
          <div class="failure-grid">
            <div class="failure"><span class="warn">!</span><div><strong>"RAG elimina las alucinaciones"</strong><p>Las mitiga condicionalmente. El modelo puede ignorar el contexto, contradecirlo o inventar sobre él.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Más contexto = mejor"</strong><p>Context rot y lost in the middle: más tokens puede empeorar la señal y subir el costo.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Un vector DB es un RAG"</strong><p>El vector store es una pieza. RAG es el pipeline completo, con ingestión, retrieval, aumento y generación.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"RAG es fine-tuning barato"</strong><p>Son mecanismos distintos: uno cambia evidencia en runtime, el otro cambia comportamiento en los pesos.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"El embedding entiende mi negocio"</strong><p>Entiende lenguaje general. Tu jerga, siglas y códigos internos necesitan evaluación y, a veces, fine-tuning del embedder.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Chunk más grande = más contexto = mejor"</strong><p>El mean pooling diluye el hecho puntual. Semantic collapse es real.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Top-k más alto = mejor"</strong><p>Más candidatos = más ruido, más latencia de rerank y más presión sobre el presupuesto de contexto.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Si el retrieval anda, el RAG anda"</strong><p>El generador puede alucinar, ignorar el contexto o citar mal. Hay que medir por fase.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"La similitud coseno es relevancia"</strong><p>Es un proxy. Un chunk topicalmente parecido puede no responder la pregunta.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"RAG es solo para texto"</strong><p>Tablas, imágenes, audio, video y código son casos de primera clase, con parsers y embeddings propios.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"Indexar una vez alcanza"</strong><p>Los documentos cambian, se borran y se versionan. Sin reindexado y borrado, el índice miente.</p></div></div>
            <div class="failure"><span class="warn">!</span><div><strong>"El LLM juzga bien sin calibrar"</strong><p>LLM-as-judge tiene sesgos de verbosidad, posición y autopreferencia. Se calibra contra humanos.</p></div></div>
          </div>
        `
      },
      {
        id: "madurez",
        title: "Modelo de madurez",
        sub: "No saltes de L1 a L4. Cada nivel resuelve el problema del anterior.",
        html: `
          <div class="levels">
            <div class="level"><span class="level-n">L0</span><div><strong>Prompt stuffing</strong><p>Todo el contexto relevante entra a mano en el prompt. Sirve para prototipar; no escala.</p><em>Señal: el prompt crece y el costo también.</em></div></div>
            <div class="level"><span class="level-n">L1</span><div><strong>Naive RAG</strong><p>Chunking fijo, un embedding, top-k, respuesta. Es el baseline honesto.</p><em>Señal: funciona en demos, falla en preguntas específicas.</em></div></div>
            <div class="level"><span class="level-n">L2</span><div><strong>Hybrid + rerank</strong><p>Denso + léxico, fusión y cross-encoder. El mayor salto de calidad por esfuerzo.</p><em>Señal: recall estable en producción.</em></div></div>
            <div class="level"><span class="level-n">L3</span><div><strong>Query understanding + evaluación</strong><p>Rewriting, routing, filtros, golden set, métricas por fase y feedback loop.</p><em>Señal: sabés por qué falla cada respuesta.</em></div></div>
            <div class="level"><span class="level-n">L4</span><div><strong>Agentic + governance</strong><p>Multi-hop controlado, evaluación continua, seguridad, linaje, reindexado y rollback.</p><em>Señal: el sistema se puede operar, auditar y mejorar sin heroísmos.</em></div></div>
          </div>
        `
      },
      {
        id: "papers",
        title: "Papers y benchmarks clave",
        sub: "Para profundizar sin perderse en blogs. Los nombres que vale la pena tener mapeados.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Trabajo</th><th>Aporte</th><th>Año</th></tr></thead>
              <tbody>
                <tr><td><code>Lewis et al. · RAG</code></td><td>Formulación original: retriever + generador, RAG-Sequence / RAG-Token.</td><td>2020</td></tr>
                <tr><td><code>Karpukhin et al. · DPR</code></td><td>Dense Passage Retrieval con bi-encoder y hard negatives.</td><td>2020</td></tr>
                <tr><td><code>Guu et al. · REALM</code></td><td>Retrieval como latent variable; índice asíncrono + EM.</td><td>2020</td></tr>
                <tr><td><code>Izacard &amp; Grave · FiD</code></td><td>Fusion-in-Decoder: concatenar pasajes en el decoder.</td><td>2021</td></tr>
                <tr><td><code>Khattab &amp; Zaharia · ColBERT</code></td><td>Late interaction; multi-vector por token con MaxSim.</td><td>2020</td></tr>
                <tr><td><code>Formal et al. · SPLADE</code></td><td>Léxico neural con expansión de términos.</td><td>2021</td></tr>
                <tr><td><code>Gao et al. · HyDE</code></td><td>Query expansion vía documento hipotético.</td><td>2022</td></tr>
                <tr><td><code>Asai et al. · Self-RAG</code></td><td>El modelo decide si recuperar y evalúa la utilidad.</td><td>2023</td></tr>
                <tr><td><code>Yan et al. · CRAG</code></td><td>Evaluador de retrieval con fallback correctivo.</td><td>2024</td></tr>
                <tr><td><code>Edge et al. · GraphRAG</code></td><td>Recuperación sobre grafos de conocimiento.</td><td>2024</td></tr>
                <tr><td><code>Liu et al. · Lost in the Middle</code></td><td>Sesgo posicional de los LLM con contextos largos.</td><td>2023</td></tr>
                <tr><td><code>Es et al. · RAGAS</code></td><td>Evaluación por componente con LLM-as-judge.</td><td>2023</td></tr>
                <tr><td><code>Thakur et al. · BEIR</code></td><td>Benchmark heterogéneo de retrieval zero-shot.</td><td>2021</td></tr>
                <tr><td><code>Muennighoff et al. · MTEB</code></td><td>Benchmark masivo de embeddings.</td><td>2022</td></tr>
              </tbody>
            </table>
          </div>
        `
      },
      {
        id: "formulas",
        title: "Fórmulas de evaluación",
        sub: "Las métricas que se usan para decidir, con su fórmula. Sin esto, 'mejoró el recall' es una opinión.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Métrica</th><th>Fórmula</th><th>Nota</th></tr></thead>
              <tbody>
                <tr><td><strong>Recall@k</strong></td><td><code>|relevantes ∩ top-k| / |relevantes|</code></td><td class="muted">¿Se escapó el bueno? Es la métrica reina del retrieval.</td></tr>
                <tr><td><strong>Precision@k</strong></td><td><code>|relevantes ∩ top-k| / k</code></td><td class="muted">¿Cuánto ruido entra?</td></tr>
                <tr><td><strong>MRR</strong></td><td><code>1/|Q| · Σ 1/rank_i</code></td><td class="muted">Castiga que el primer acierto esté abajo.</td></tr>
                <tr><td><strong>nDCG</strong></td><td><code>DCG / IDCG</code>, con <code>DCG = Σ (2^rel_i − 1) / log2(i+1)</code></td><td class="muted">Calidad del orden completo, no solo del top-1.</td></tr>
                <tr><td><strong>Faithfulness</strong></td><td><code>claims soportados / claims totales</code></td><td class="muted">Se descompone la respuesta en claims y se verifica cada uno.</td></tr>
                <tr><td><strong>Context precision</strong></td><td><code>Σ (precision@k · rel_k) / relevantes</code></td><td class="muted">Premia que los chunks útiles estén arriba.</td></tr>
                <tr><td><strong>Context recall</strong></td><td><code>claims de la referencia cubiertos / total</code></td><td class="muted">Requiere ground truth.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout">Cuidado con el <strong>LLM-as-judge</strong>: no es determinista y tiene sesgos de verbosidad, posición y autopreferencia. Calibrá contra humanos en una muestra antes de confiar en el número.</div>
        `
      }
    ]
  },

  {
    id: "transversal",
    group: "Conceptos",
    num: "T",
    name: "TRANSVERSAL",
    kicker: "Evaluación · Seguridad · Operación",
    tagline: "Lo que no es una fase, pero decide si el sistema sobrevive a producción.",
    accent: "#fb7185",
    purpose:
      "Las capas que atraviesan todo el pipeline: cómo se mide, cómo se ataca, cómo se gobierna, cómo se opera y cuánto cuesta. Sin esto, el RAG funciona en la demo y falla en el mundo real.",
    sections: [
      {
        id: "evaluacion",
        title: "Evaluación",
        sub: "Medir por fase, no solo el end-to-end. Un score global no te dice dónde arreglar.",
        html: `
          <div class="grid-3">
            <div class="mini-card"><span class="mini-tag">Offline</span><p>Golden set etiquetado, métricas por componente, comparación entre versiones. Es el laboratorio.</p></div>
            <div class="mini-card"><span class="mini-tag">Online</span><p>Thumbs, tasa de abstención, deflexión de soporte, tiempo a respuesta, satisfacción. Es el campo.</p></div>
            <div class="mini-card"><span class="mini-tag">Por componente</span><p>Recall@k mide retrieval; faithfulness mide generación. Si mezclás todo, no sabés qué arreglar.</p></div>
          </div>
          <div class="table-wrap" style="margin-top:16px">
            <table>
              <thead><tr><th>Métrica</th><th>Qué mide</th><th>Requiere ground truth</th></tr></thead>
              <tbody>
                <tr><td><code>Recall@k</code></td><td>¿El chunk correcto está en el top-k?</td><td>Sí</td></tr>
                <tr><td><code>Precision@k</code></td><td>De los k, cuántos son relevantes.</td><td>Sí</td></tr>
                <tr><td><code>MRR</code></td><td>Posición del primer relevante.</td><td>Sí</td></tr>
                <tr><td><code>nDCG</code></td><td>Calidad del orden completo.</td><td>Sí</td></tr>
                <tr><td><code>Faithfulness</code></td><td>Claims soportados por el contexto.</td><td>No (LLM-as-judge)</td></tr>
                <tr><td><code>Answer relevance</code></td><td>¿Responde lo preguntado?</td><td>No</td></tr>
                <tr><td><code>Context recall</code></td><td>¿Se recuperó todo lo necesario?</td><td>Sí</td></tr>
                <tr><td><code>Answer correctness</code></td><td>¿Coincide con la referencia?</td><td>Sí</td></tr>
              </tbody>
            </table>
          </div>
          <div class="strategy-grid" style="margin-top:16px">
            <div class="strategy"><h3>Golden set</h3><p class="strategy-how">Preguntas reales con chunk y respuesta esperada. 50–200 casos bien elegidos superan a 10.000 sintéticos.</p><div class="strategy-row"><span>Clave</span>Cubrir tipos de pregunta, no solo volumen.</div></div>
            <div class="strategy"><h3>Queries sintéticas</h3><p class="strategy-how">Un LLM genera preguntas desde cada chunk para arrancar.</p><div class="strategy-row trade"><span>Riesgo</span>Sesgo hacia lo que el chunk dice, no a lo que el usuario pregunta.</div></div>
            <div class="strategy"><h3>Calibrar el juez</h3><p class="strategy-how">Comparar LLM-as-judge contra humanos en una muestra.</p><div class="strategy-row trade"><span>Riesgo</span>Verbosidad, posición y autopreferencia.</div></div>
            <div class="strategy"><h3>Contaminación</h3><p class="strategy-how">Asegurar que el eval set no esté en el corpus indexado.</p><div class="strategy-row trade"><span>Riesgo</span>Métricas infladas y falsa confianza.</div></div>
          </div>
        `
      },
      {
        id: "seguridad",
        title: "Seguridad y threat model",
        sub: "El contenido recuperado es input no confiable. Tratarlo como datos, nunca como instrucciones.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Amenaza</th><th>Vector</th><th>Mitigación</th></tr></thead>
              <tbody>
                <tr><td><strong>Prompt injection directa</strong></td><td>El usuario escribe instrucciones para saltarse reglas.</td><td>Instruction hierarchy, filtros de entrada, allowlists de herramientas.</td></tr>
                <tr><td><strong>Prompt injection indirecta</strong></td><td>Un documento recuperado trae "ignorá lo anterior".</td><td>Delimitar y marcar datos (spotlighting), sanitizar, no ejecutar instrucciones del contexto.</td></tr>
                <tr><td><strong>Data poisoning</strong></td><td>Se insertan documentos falsos en el corpus.</td><td>Control de fuentes, firma/validación, detección de anomalías, revisión de ingesta.</td></tr>
                <tr><td><strong>Cross-tenant leakage</strong></td><td>Un filtro de ACL mal aplicado devuelve documentos de otro cliente.</td><td>ACL en el payload, filtrado pre-retrieval, tests de aislamiento.</td></tr>
                <tr><td><strong>PII exposure</strong></td><td>El contexto o la respuesta exponen datos personales.</td><td>Detección y redacción en ingesta y salida, minimización.</td></tr>
                <tr><td><strong>Exfiltración</strong></td><td>La respuesta incluye links o datos para sacar información.</td><td>Filtros de salida, allowlist de dominios, revisión de citas.</td></tr>
                <tr><td><strong>Embedding inversion</strong></td><td>Reconstruir texto aproximado desde embeddings.</td><td>No exponer vectores, control de acceso al índice.</td></tr>
                <tr><td><strong>Tool abuse</strong></td><td>El agente usa una herramienta con parámetros maliciosos.</td><td>Permisos mínimos, sandbox, validación de argumentos.</td></tr>
                <tr><td><strong>Denial of wallet</strong></td><td>Queries diseñadas para maximizar tokens y costo.</td><td>Rate limits, presupuestos, caching, límites de contexto.</td></tr>
                <tr><td><strong>Supply chain</strong></td><td>Dependencias, modelos o datasets comprometidos.</td><td>Pinning, verificación de artefactos, SBOM.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout">Mapeo útil: <strong>OWASP LLM Top 10</strong>. Prompt injection (LLM01), insecure output handling (LLM02), training data poisoning (LLM03), model DoS (LLM04), supply chain (LLM05), sensitive information disclosure (LLM06), insecure plugin design (LLM07), excessive agency (LLM08), overreliance (LLM09) y model theft (LLM10).</div>
        `
      },
      {
        id: "gobernanza",
        title: "Gobernanza y ciclo de vida del dato",
        sub: "RAG es, antes que nada, un problema de datos. La gobernanza no es burocracia: es lo que hace que el índice sea confiable.",
        html: `
          <div class="strategy-grid">
            <div class="strategy"><h3>Procedencia y linaje</h3><p class="strategy-how">Cada chunk sabe de qué documento, versión y sección viene.</p><div class="strategy-row"><span>Por qué</span>Auditoría y citas verificables.</div></div>
            <div class="strategy"><h3>Retención</h3><p class="strategy-how">TTL por tipo de documento y borrado programado.</p><div class="strategy-row trade"><span>Riesgo</span>Datos viejos que el índice sigue sirviendo.</div></div>
            <div class="strategy"><h3>Derecho al olvido</h3><p class="strategy-how">Borrado en cascada: documento → chunks → vectores → cache.</p><div class="strategy-row trade"><span>Riesgo</span>Borrar el original y dejar los embeddings.</div></div>
            <div class="strategy"><h3>Licencias y consentimiento</h3><p class="strategy-how">Saber qué se puede indexar, citar y mostrar.</p><div class="strategy-row trade"><span>Riesgo</span>Reproducir contenido sin derechos.</div></div>
            <div class="strategy"><h3>Clasificación</h3><p class="strategy-how">Público, interno, confidencial, PII; cada nivel con su política.</p><div class="strategy-row"><span>Por qué</span>ACL y enmascaramiento.</div></div>
            <div class="strategy"><h3>Auditoría</h3><p class="strategy-how">Log de qué se recuperó, qué se respondió y con qué versión del índice.</p><div class="strategy-row"><span>Por qué</span>Reproducibilidad y compliance.</div></div>
          </div>
        `
      },
      {
        id: "operacion",
        title: "Observabilidad y operación",
        sub: "Si no podés reconstruir por qué respondió eso, no podés mejorarlo.",
        html: `
          <div class="grid-3">
            <div class="mini-card"><span class="mini-tag">Tracing</span><p>Una traza por request: query original, reescrita, chunks recuperados, scores, prompt, respuesta y verificación.</p></div>
            <div class="mini-card"><span class="mini-tag">Feedback loop</span><p>Thumbs, correcciones y tickets alimentan el golden set. Sin loop, el sistema no aprende.</p></div>
            <div class="mini-card"><span class="mini-tag">Drift</span><p>Cambian los documentos, las preguntas y los modelos. Monitorear recall y abstención en el tiempo.</p></div>
            <div class="mini-card"><span class="mini-tag">Reindexado</span><p>Blue/green: construir el índice nuevo, validar, cambiar el tráfico, conservar el viejo para rollback.</p></div>
            <div class="mini-card"><span class="mini-tag">Upgrade de embedding</span><p>Cambiar de modelo suele cambiar dimensión y espacio: requiere reindexar todo, no solo recalcular queries.</p></div>
            <div class="mini-card"><span class="mini-tag">Rollback</span><p>Versionar índice, prompt, modelo y configuración. Poder volver en minutos, no en días.</p></div>
          </div>
          <div class="callout">El error operativo más caro: <strong>actualizar el embedder sin reindexar</strong>. Las queries viven en un espacio y los documentos en otro; el recall se cae sin errores visibles.</div>
        `
      },
      {
        id: "costos",
        title: "Costos y latencia",
        sub: "Órdenes de magnitud para decidir, no benchmarks exactos. Medí en tu infraestructura.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Etapa</th><th>Latencia típica</th><th>Costo relativo</th><th>Nota</th></tr></thead>
              <tbody>
                <tr><td>Parsing / OCR</td><td>Offline / batch</td><td>Medio</td><td>Se paga una vez por documento.</td></tr>
                <tr><td>Embedding de documentos</td><td>Offline / batch</td><td>Medio</td><td>Cachear por hash; no re-embeddear lo que no cambió.</td></tr>
                <tr><td>Embedding de query</td><td>10–50 ms</td><td>Bajo</td><td>Una por query (o por variante).</td></tr>
                <tr><td>ANN (HNSW/IVF)</td><td>1–10 ms</td><td>Bajo</td><td>Escala con N y con efSearch/nprobe.</td></tr>
                <tr><td>BM25</td><td>1–5 ms</td><td>Bajo</td><td>Muy barato; ideal para híbrido.</td></tr>
                <tr><td>Rerank (cross-encoder)</td><td>20–200 ms</td><td>Medio</td><td>O(k) llamadas al modelo; k chico.</td></tr>
                <tr><td>LLM</td><td>300 ms–5 s</td><td>Alto</td><td>Domina el costo y la latencia.</td></tr>
                <tr><td>Verificación de fidelidad</td><td>100 ms–1 s</td><td>Medio</td><td>Opcional; se puede muestrear.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="grid-3" style="margin-top:16px">
            <div class="mini-card"><span class="mini-tag">Caching</span><p>Cache semántico de respuestas, cache de embeddings y cache de retrieval para queries repetidas.</p></div>
            <div class="mini-card"><span class="mini-tag">Compresión</span><p>Menos tokens de contexto = menos costo y latencia. Comprimir con cuidado: se puede borrar el dato clave.</p></div>
            <div class="mini-card"><span class="mini-tag">Ruteo</span><p>No toda query necesita el modelo grande ni el rerank. Un router barato puede ahorrar mucho.</p></div>
          </div>
        `
      },
      {
        id: "multimodal",
        title: "RAG multimodal",
        sub: "Un PDF no es texto: es layout. Tratarlo como texto plano pierde tablas, columnas y orden de lectura.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Modalidad</th><th>Cómo se ingesta</th><th>Representación</th><th>Retrieval</th></tr></thead>
              <tbody>
                <tr><td><strong>PDF con texto</strong></td><td>Parser + layout (PyMuPDF, Docling)</td><td>Chunks de texto + metadata de página/sección</td><td>Dense + sparse</td></tr>
                <tr><td><strong>PDF escaneado</strong></td><td>OCR + layout analysis</td><td>Texto OCR + bounding boxes</td><td>Dense</td></tr>
                <tr><td><strong>Tablas</strong></td><td>Parser de tablas (Camelot, Unstructured)</td><td>Filas como registros o Markdown</td><td>Dense + filtros por columna</td></tr>
                <tr><td><strong>Imágenes y figuras</strong></td><td>Captioning con VLM + CLIP</td><td>Texto descriptivo + vector multimodal</td><td>CLIP / VLM</td></tr>
                <tr><td><strong>Audio</strong></td><td>ASR (Whisper)</td><td>Transcripción con timestamps</td><td>Dense + rango temporal</td></tr>
                <tr><td><strong>Video</strong></td><td>ASR + keyframes</td><td>Transcripción + captions por frame</td><td>Dense + filtro temporal</td></tr>
                <tr><td><strong>Código</strong></td><td>AST (tree-sitter)</td><td>Funciones, clases y métodos</td><td>Dense + filtros por repo/lenguaje</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout">La decisión clave es <strong>qué representás</strong>: el texto, la imagen, o una descripción de la imagen. Cada una recupera cosas distintas.</div>
        `
      },
      {
        id: "estructurados",
        title: "Datos estructurados y grafos",
        sub: "No todo se resuelve con embeddings. Si la pregunta es exacta, la respuesta también debería serlo.",
        html: `
          <div class="strategy-grid">
            <div class="strategy"><h3>Text-to-SQL</h3><p class="strategy-how">Traducir la pregunta a SQL y ejecutarla sobre la base.</p><div class="strategy-row"><span>Cuándo</span>Agregaciones, filtros exactos, métricas.</div><div class="strategy-row trade"><span>Riesgo</span>SQL incorrecto o inseguro; validar y limitar permisos.</div></div>
            <div class="strategy"><h3>Híbrido tabular + texto</h3><p class="strategy-how">La parte numérica va por SQL; la narrativa, por RAG.</p><div class="strategy-row"><span>Cuándo</span>Reportes con contexto y cifras.</div><div class="strategy-row trade"><span>Riesgo</span>Dos fuentes que se contradicen.</div></div>
            <div class="strategy"><h3>GraphRAG</h3><p class="strategy-how">Extraer entidades y relaciones, y recuperar sobre el grafo.</p><div class="strategy-row"><span>Cuándo</span>Multi-hop y relaciones entre entidades.</div><div class="strategy-row trade"><span>Riesgo</span>Construcción y mantenimiento caros.</div></div>
            <div class="strategy"><h3>Knowledge graph</h3><p class="strategy-how">Ontología con hechos verificados y consultas estructuradas.</p><div class="strategy-row"><span>Cuándo</span>Dominio acotado y preciso.</div><div class="strategy-row trade"><span>Riesgo</span>Curado manual y rigidez.</div></div>
          </div>
          <div class="callout">Regla: si la pregunta se responde con un <code>GROUP BY</code>, no la mandes a un embedding.</div>
        `
      },
      {
        id: "memoria",
        title: "Memoria y orquestación",
        sub: "RAG no vive en un solo turno. La memoria y el control flow son lo que separan un buscador de un asistente.",
        html: `
          <div class="grid-3">
            <div class="mini-card"><span class="mini-tag">Buffer</span><p>Últimos N turnos tal cual. Simple; crece rápido y se vuelve caro.</p></div>
            <div class="mini-card"><span class="mini-tag">Summary</span><p>Resumen incremental de la conversación. Comprime, pero puede perder detalle.</p></div>
            <div class="mini-card"><span class="mini-tag">Long-term</span><p>Hechos y preferencias persistentes en un store aparte, recuperables como cualquier documento.</p></div>
            <div class="mini-card"><span class="mini-tag">Entity memory</span><p>Estado por entidad (cliente, pedido, ticket) para no repetir contexto en cada turno.</p></div>
            <div class="mini-card"><span class="mini-tag">Router</span><p>Decide qué índice o herramienta usar: docs, tickets, SQL, web. Evita buscar en todos lados.</p></div>
            <div class="mini-card"><span class="mini-tag">Plan + budget</span><p>Descompone multi-hop, asigna tokens/latencia/costo y define una condición de corte.</p></div>
          </div>
          <div class="callout">Sin <strong>stop condition</strong>, un agente multi-hop es un loop caro. Presupuesto y criterio de corte son parte del diseño, no un detalle de implementación.</div>
        `
      }
    ]
  },

  {
    id: "decisiones",
    group: "Conceptos",
    num: "D",
    name: "DECISIONES",
    kicker: "Cuándo sí · Cuándo no · Cómo elegir",
    tagline: "Los criterios que evitan construir el RAG equivocado.",
    accent: "#22d3ee",
    purpose:
      "Playbooks de decisión: cuándo no usar RAG, cómo elegir chunking, qué comprar y qué construir, y un checklist para pasar de demo a producción.",
    sections: [
      {
        id: "cuando-no",
        title: "¿Cuándo NO usar RAG?",
        sub: "RAG no es la respuesta a todo. Estos casos suelen terminar en un sistema más simple y más confiable.",
        html: `
          <div class="failure-grid">
            <div class="failure"><span class="warn">×</span><div><strong>El corpus entra en el contexto</strong><p>Si son 20 páginas estáticas, pasarlas enteras es más simple y más preciso que indexar y recuperar. Usá long context.</p></div></div>
            <div class="failure"><span class="warn">×</span><div><strong>Reglas deterministas</strong><p>Si la respuesta se calcula con una regla o un lookup exacto, RAG agrega variabilidad innecesaria. Usá código.</p></div></div>
            <div class="failure"><span class="warn">×</span><div><strong>Datos estructurados con SQL exacto</strong><p>Para "¿cuánto vendimos en marzo?" no necesitás embeddings. Usá text-to-SQL o una API.</p></div></div>
            <div class="failure"><span class="warn">×</span><div><strong>Razonar sobre todo el corpus</strong><p>Si la tarea requiere agregar o comparar todos los documentos, el retrieval por chunks puede perder la visión global. Usá long context, map-reduce o GraphRAG.</p></div></div>
            <div class="failure"><span class="warn">×</span><div><strong>Latencia ultra baja</strong><p>Si necesitás milisegundos, un pipeline con embeddings + LLM no es el camino. Usá cache o reglas.</p></div></div>
            <div class="failure"><span class="warn">×</span><div><strong>Auditoría legal formal</strong><p>Si la respuesta debe seguir una norma verificable paso a paso, un LLM puede no ser la herramienta. Usá un sistema basado en reglas.</p></div></div>
          </div>
        `
      },
      {
        id: "chunking",
        title: "Árbol de decisión de chunking",
        sub: "No hay un chunk_size universal. Hay una decisión que depende de la estructura y del tipo de pregunta.",
        html: `
          <pre class="tree">¿Qué tipo de documento es?
├─ Código
│  └─ AST-aware (función / clase / método)
├─ PDF con tablas, columnas o gráficos
│  └─ Layout-aware (bloques + tablas)
├─ Markdown / HTML con secciones
│  └─ Estructural (headers y secciones)
└─ Texto libre sin estructura
   ├─ ¿Preguntas factuales puntuales?
   │  ├─ Sí → chunk chico + Parent-Document
   │  └─ No → semántico o recursivo
   └─ ¿Resumen / visión global?
      └─ chunk grande + jerárquico / RAPTOR

Después, siempre:
1. Medir Recall@k con un golden set.
2. Ajustar chunk_size y overlap.
3. Recién entonces tocar el embedder.</pre>
          <div class="callout">Regla: el chunking se decide <strong>midiendo</strong>, no adivinando. Y se mide en tokens del embedder, no del LLM.</div>
        `
      },
      {
        id: "build-buy",
        title: "Build vs buy",
        sub: "Qué conviene construir y qué conviene comprar. La respuesta cambia con el tamaño del equipo y el grado de diferenciación.",
        html: `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Componente</th><th>Open source</th><th>Managed</th><th>Cuándo construir</th></tr></thead>
              <tbody>
                <tr><td><strong>Vector store</strong></td><td>pgvector, Qdrant, Milvus, FAISS</td><td>Pinecone, Weaviate Cloud</td><td>Casi nunca; solo si hay requisitos extremos de escala o latencia.</td></tr>
                <tr><td><strong>Embeddings</strong></td><td>E5, BGE, GTE, Sentence-BERT</td><td>OpenAI, Cohere, Voyage</td><td>Si tu dominio tiene jerga muy específica y medís una mejora clara.</td></tr>
                <tr><td><strong>Reranker</strong></td><td>bge-reranker, monoT5</td><td>Cohere Rerank</td><td>Rara vez; el costo de entrenar uno propio es alto.</td></tr>
                <tr><td><strong>Orquestación</strong></td><td>LangChain, LlamaIndex, Haystack</td><td>Plataformas gestionadas</td><td>Si el pipeline es el core de tu producto y necesitás control total.</td></tr>
                <tr><td><strong>Evaluación</strong></td><td>RAGAS, DeepEval, TruLens</td><td>Observabilidad gestionada</td><td>El golden set y las métricas de tu dominio siempre son propios.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="callout">La diferenciación real casi nunca está en el vector store. Está en <strong>tus datos, tu chunking, tu evaluación y tu dominio</strong>.</div>
        `
      },
      {
        id: "checklist",
        title: "Checklist de producción",
        sub: "Si falta uno de estos, el sistema todavía es una demo.",
        html: `
          <ul class="checklist">
            <li>Golden set con preguntas reales y chunk/respuesta esperados.</li>
            <li>Métricas por fase: Recall@k, context relevance, faithfulness, answer relevance.</li>
            <li>ACL en el payload y filtrado pre-retrieval.</li>
            <li>Citas verificables y mapeadas a documento, sección y página.</li>
            <li>Abstención explícita cuando el contexto no alcanza.</li>
            <li>Tracing completo por request (query, chunks, scores, prompt, respuesta).</li>
            <li>Versionado de índice, prompt, modelo y configuración.</li>
            <li>Reindexado incremental y borrado en cascada.</li>
            <li>Mitigaciones de prompt injection y sanitización del contexto.</li>
            <li>Presupuesto de tokens, latencia y costo por query.</li>
            <li>Feedback loop que alimenta el golden set.</li>
            <li>Plan de rollback y upgrade de embedding model.</li>
          </ul>
        `
      }
    ]
  }
];
