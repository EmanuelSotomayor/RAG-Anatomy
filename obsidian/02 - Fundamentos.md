---
tags:
  - rag
  - rag/fundamentos
aliases:
  - Fundamentos
  - Definiciones RAG
---
# Fundamentos

> [!info] Propósito
> Antes del pipeline: qué es exactamente RAG, qué no es, cómo se compara con las alternativas y qué errores conceptuales se repiten en todos los equipos.

## Definiciones precisas

> Conceptos que se usan como sinónimos y no lo son. Esta tabla es la que evitaría la mitad de las discusiones de arquitectura.

| Concepto | Definición precisa | Error común |
| --- | --- | --- |
| **Grounding** | Propiedad del sistema: la respuesta se genera condicionada a evidencia recuperada. | Confundirlo con "la respuesta es correcta". |
| **Faithfulness** | Grado en que cada claim de la respuesta está implicado por el contexto. | Creer que grounding garantiza faithfulness. |
| **Attribution** | Mapear cada claim a su fuente. | Confundirlo con citar el documento entero. |
| **Citation** | Referencia explícita y verificable a la fuente. | Citar un documento que no contiene la afirmación. |
| **Hallucination** | Claim no soportado por la evidencia. *Intrínseca* si contradice el contexto; *extrínseca* si agrega información no soportada. | Tratarla como un solo fenómeno. |
| **Similarity ≠ relevance ≠ answerability** | Parecido semántico / utilidad para la pregunta / capacidad de responderla con lo recuperado. | Asumir que cosine alto = chunk útil. |
| **Retrieval · ranking · reranking** | Recuperar candidatos / ordenarlos / reordenarlos con un modelo más caro. | Llamar "retrieval" a todo el pipeline. |
| **Chunk · passage · span** | Unidad indexada / unidad recuperada / fragmento mínimo dentro de un texto. | Usar "chunk" para todo. |
| **Parametric vs non-parametric memory** | Pesos del modelo vs índice externo. | Decir que RAG "memoriza". |
| **Context window vs memory** | Ventana de atención vs estado persistente entre turnos. | Asumir que más ventana = más memoria. |
| **Open-book vs closed-book QA** | Responder con evidencia externa vs solo con parámetros. | Usarlos como sinónimos de RAG. |
| **Dense · sparse · hybrid** | Similitud vectorial / coincidencia léxica / fusión de ambas. | Creer que dense siempre gana. |
| **Bi-encoder · cross-encoder · late interaction** | Encodea por separado / conjuntamente / por token con MaxSim. | Confundir costo con calidad. |
| **Semantic cache vs KV cache** | Cachear respuestas por similitud de query vs cachear estados de atención. | Mezclar optimizaciones distintas. |
| **Context rot vs lost in the middle** | Degradación general por contexto largo vs sesgo posicional específico. | Usarlos como sinónimos. |
| **Poisoning · contamination · leakage** | Envenenar el corpus / contaminar el eval set / filtrar datos de entrenamiento. | Tratarlos como lo mismo. |

> [!note]
> Regla dura: **grounding no es correctness**. Un sistema puede estar perfectamente grounded y responder algo irrelevante, o estar bien fundamentado y aun así elegir la fuente equivocada.

## RAG vs long context vs fine-tuning

> La pregunta ya no es solo '¿RAG o fine-tuning?'. Con ventanas de 1M+ tokens, '¿RAG o long context?' es igual de importante.

| Criterio | RAG | Long context | Fine-tuning |
| --- | --- | --- | --- |
| **Frescura** | Alta: actualizás el índice | Alta: pasás el texto | Baja: requiere reentrenar |
| **Costo por query** | Medio (retrieval + prompt corto) | Alto (tokens de entrada) | Bajo (pesos) |
| **Costo de actualizar** | Bajo | Cero | Alto |
| **Latencia** | Media | Alta con contextos enormes | Baja |
| **Procedencia** | Alta: citás fuentes | Alta si citás | Baja: el conocimiento es difuso |
| **ACL / multi-tenant** | Nativo (filtros por metadata) | Manual y frágil | No aplica |
| **Escala del corpus** | Millones de documentos | Limitada a la ventana | Limitada a los pesos |
| **Formato / estilo** | Por prompt | Por prompt | Excelente |
| **Razonamiento de dominio** | Limitado al modelo base | Limitado al modelo base | Mejorable |
| **Auditabilidad** | Alta | Alta | Baja |

- **Elegí RAG** — Corpus grande, cambiante, con permisos por usuario y necesidad de citar.

- **Elegí long context** — Corpus chico y estático, o tareas que requieren razonar sobre todo el documento a la vez.

- **Elegí fine-tuning** — Necesitás estilo, formato, tono o razonamiento de dominio; no conocimiento factual fresco.

> [!note]
> En la práctica casi nunca es "o". Lo común es **fine-tuning para comportamiento + RAG para evidencia + long context para documentos puntuales**.

## Taxonomía de la familia RAG

> No es una arquitectura, es una familia. Cada nivel agrega control, costo y superficie de falla.

### Naive RAG

Retrieve → read. Buscar, concatenar y responder.

- **Agrega**: El baseline mínimo.

- **Costo**: Bajo; techo bajo.

### Advanced RAG

Pre-retrieval (rewrite, HyDE) + post-retrieval (rerank, compresión).

- **Agrega**: Calidad de query y de contexto.

- **Costo**: Medio; más piezas que medir.

### Modular RAG

Componentes intercambiables: routing, memoria, tools, evaluadores.

- **Agrega**: Flexibilidad de arquitectura.

- **Costo**: Complejidad operativa.

### Self-reflective RAG

Self-RAG, CRAG, Adaptive-RAG: decide si recuperar, evalúa y corrige.

- **Agrega**: Control sobre la calidad del retrieval.

- **Costo**: Latencia y loops.

### GraphRAG

Recupera sobre un knowledge graph además de (o en vez de) vectores.

- **Agrega**: Relaciones y multi-hop estructurado.

- **Costo**: Construcción y mantenimiento del grafo.

### Agentic RAG

Un orquestador con loop decide fuentes, encadena llamadas y reintenta.

- **Agrega**: Multi-hop y uso de herramientas.

- **Costo**: No determinista; difícil de evaluar.

## Mitos y anti-patrones

> Cada uno de estos cuesta semanas de debugging.

- **"RAG elimina las alucinaciones"** — Las mitiga condicionalmente. El modelo puede ignorar el contexto, contradecirlo o inventar sobre él.

- **"Más contexto = mejor"** — Context rot y lost in the middle: más tokens puede empeorar la señal y subir el costo.

- **"Un vector DB es un RAG"** — El vector store es una pieza. RAG es el pipeline completo, con ingestión, retrieval, aumento y generación.

- **"RAG es fine-tuning barato"** — Son mecanismos distintos: uno cambia evidencia en runtime, el otro cambia comportamiento en los pesos.

- **"El embedding entiende mi negocio"** — Entiende lenguaje general. Tu jerga, siglas y códigos internos necesitan evaluación y, a veces, fine-tuning del embedder.

- **"Chunk más grande = más contexto = mejor"** — El mean pooling diluye el hecho puntual. Semantic collapse es real.

- **"Top-k más alto = mejor"** — Más candidatos = más ruido, más latencia de rerank y más presión sobre el presupuesto de contexto.

- **"Si el retrieval anda, el RAG anda"** — El generador puede alucinar, ignorar el contexto o citar mal. Hay que medir por fase.

- **"La similitud coseno es relevancia"** — Es un proxy. Un chunk topicalmente parecido puede no responder la pregunta.

- **"RAG es solo para texto"** — Tablas, imágenes, audio, video y código son casos de primera clase, con parsers y embeddings propios.

- **"Indexar una vez alcanza"** — Los documentos cambian, se borran y se versionan. Sin reindexado y borrado, el índice miente.

- **"El LLM juzga bien sin calibrar"** — LLM-as-judge tiene sesgos de verbosidad, posición y autopreferencia. Se calibra contra humanos.

## Modelo de madurez

> No saltes de L1 a L4. Cada nivel resuelve el problema del anterior.

### L0 · **Prompt stuffing**

Todo el contexto relevante entra a mano en el prompt. Sirve para prototipar; no escala.

**Señal: el prompt crece y el costo también.**

### L1 · **Naive RAG**

Chunking fijo, un embedding, top-k, respuesta. Es el baseline honesto.

**Señal: funciona en demos, falla en preguntas específicas.**

### L2 · **Hybrid + rerank**

Denso + léxico, fusión y cross-encoder. El mayor salto de calidad por esfuerzo.

**Señal: recall estable en producción.**

### L3 · **Query understanding + evaluación**

Rewriting, routing, filtros, golden set, métricas por fase y feedback loop.

**Señal: sabés por qué falla cada respuesta.**

### L4 · **Agentic + governance**

Multi-hop controlado, evaluación continua, seguridad, linaje, reindexado y rollback.

**Señal: el sistema se puede operar, auditar y mejorar sin heroísmos.**

## Papers y benchmarks clave

> Para profundizar sin perderse en blogs. Los nombres que vale la pena tener mapeados.

| Trabajo | Aporte | Año |
| --- | --- | --- |
| `Lewis et al. · RAG` | Formulación original: retriever + generador, RAG-Sequence / RAG-Token. | 2020 |
| `Karpukhin et al. · DPR` | Dense Passage Retrieval con bi-encoder y hard negatives. | 2020 |
| `Guu et al. · REALM` | Retrieval como latent variable; índice asíncrono + EM. | 2020 |
| `Izacard & Grave · FiD` | Fusion-in-Decoder: concatenar pasajes en el decoder. | 2021 |
| `Khattab & Zaharia · ColBERT` | Late interaction; multi-vector por token con MaxSim. | 2020 |
| `Formal et al. · SPLADE` | Léxico neural con expansión de términos. | 2021 |
| `Gao et al. · HyDE` | Query expansion vía documento hipotético. | 2022 |
| `Asai et al. · Self-RAG` | El modelo decide si recuperar y evalúa la utilidad. | 2023 |
| `Yan et al. · CRAG` | Evaluador de retrieval con fallback correctivo. | 2024 |
| `Edge et al. · GraphRAG` | Recuperación sobre grafos de conocimiento. | 2024 |
| `Liu et al. · Lost in the Middle` | Sesgo posicional de los LLM con contextos largos. | 2023 |
| `Es et al. · RAGAS` | Evaluación por componente con LLM-as-judge. | 2023 |
| `Thakur et al. · BEIR` | Benchmark heterogéneo de retrieval zero-shot. | 2021 |
| `Muennighoff et al. · MTEB` | Benchmark masivo de embeddings. | 2022 |

## Fórmulas de evaluación

> Las métricas que se usan para decidir, con su fórmula. Sin esto, 'mejoró el recall' es una opinión.

| Métrica | Fórmula | Nota |
| --- | --- | --- |
| **Recall@k** | $\frac{\lvert R \cap \text{top-}k\rvert}{\lvert R\rvert}$ | ¿Se escapó el bueno? Es la métrica reina del retrieval. |
| **Precision@k** | $\frac{\lvert R \cap \text{top-}k\rvert}{k}$ | ¿Cuánto ruido entra? |
| **MRR** | $\frac{1}{\lvert Q\rvert}\sum_{i=1}^{\lvert Q\rvert}\frac{1}{\text{rank}_i}$ | Castiga que el primer acierto esté abajo. |
| **nDCG** | $\frac{DCG}{IDCG}$, con $DCG = \sum_{i=1}^{n}\frac{2^{rel_i}-1}{\log_2(i+1)}$ | Calidad del orden completo, no solo del top-1. |
| **Faithfulness** | $\frac{\text{claims soportados}}{\text{claims totales}}$ | Se descompone la respuesta en claims y se verifica cada uno. |
| **Context precision** | $\frac{\sum_k (\text{precision@}k \cdot rel_k)}{\lvert\text{relevantes}\rvert}$ | Premia que los chunks útiles estén arriba. |
| **Context recall** | $\frac{\text{claims de la referencia cubiertos}}{\text{total}}$ | Requiere ground truth. |

> [!note]
> Cuidado con el **LLM-as-judge**: no es determinista y tiene sesgos de verbosidad, posición y autopreferencia. Calibrá contra humanos en una muestra antes de confiar en el número.

---

← [[01 - Visión general|Visión general]] · [[03 - Chunking|Chunking]] →
