---
tags:
  - rag
  - rag/transversal
aliases:
  - Transversal
  - Producción RAG
---
# Transversal

> [!info] Propósito
> Las capas que atraviesan todo el pipeline: cómo se mide, cómo se ataca, cómo se gobierna, cómo se opera y cuánto cuesta. Sin esto, el RAG funciona en la demo y falla en el mundo real.

## Evaluación

> Medir por fase, no solo el end-to-end. Un score global no te dice dónde arreglar.

- **Offline** — Golden set etiquetado, métricas por componente, comparación entre versiones. Es el laboratorio.

- **Online** — Thumbs, tasa de abstención, deflexión de soporte, tiempo a respuesta, satisfacción. Es el campo.

- **Por componente** — Recall@k mide retrieval; faithfulness mide generación. Si mezclás todo, no sabés qué arreglar.

| Métrica | Qué mide | Requiere ground truth |
| --- | --- | --- |
| `Recall@k` | ¿El chunk correcto está en el top-k? | Sí |
| `Precision@k` | De los k, cuántos son relevantes. | Sí |
| `MRR` | Posición del primer relevante. | Sí |
| `nDCG` | Calidad del orden completo. | Sí |
| `Faithfulness` | Claims soportados por el contexto. | No (LLM-as-judge) |
| `Answer relevance` | ¿Responde lo preguntado? | No |
| `Context recall` | ¿Se recuperó todo lo necesario? | Sí |
| `Answer correctness` | ¿Coincide con la referencia? | Sí |

### Golden set

Preguntas reales con chunk y respuesta esperada. 50–200 casos bien elegidos superan a 10.000 sintéticos.

- **Clave**: Cubrir tipos de pregunta, no solo volumen.

### Queries sintéticas

Un LLM genera preguntas desde cada chunk para arrancar.

- **Riesgo**: Sesgo hacia lo que el chunk dice, no a lo que el usuario pregunta.

### Calibrar el juez

Comparar LLM-as-judge contra humanos en una muestra.

- **Riesgo**: Verbosidad, posición y autopreferencia.

### Contaminación

Asegurar que el eval set no esté en el corpus indexado.

- **Riesgo**: Métricas infladas y falsa confianza.

## Seguridad y threat model

> El contenido recuperado es input no confiable. Tratarlo como datos, nunca como instrucciones.

| Amenaza | Vector | Mitigación |
| --- | --- | --- |
| **Prompt injection directa** | El usuario escribe instrucciones para saltarse reglas. | Instruction hierarchy, filtros de entrada, allowlists de herramientas. |
| **Prompt injection indirecta** | Un documento recuperado trae "ignorá lo anterior". | Delimitar y marcar datos (spotlighting), sanitizar, no ejecutar instrucciones del contexto. |
| **Data poisoning** | Se insertan documentos falsos en el corpus. | Control de fuentes, firma/validación, detección de anomalías, revisión de ingesta. |
| **Cross-tenant leakage** | Un filtro de ACL mal aplicado devuelve documentos de otro cliente. | ACL en el payload, filtrado pre-retrieval, tests de aislamiento. |
| **PII exposure** | El contexto o la respuesta exponen datos personales. | Detección y redacción en ingesta y salida, minimización. |
| **Exfiltración** | La respuesta incluye links o datos para sacar información. | Filtros de salida, allowlist de dominios, revisión de citas. |
| **Embedding inversion** | Reconstruir texto aproximado desde embeddings. | No exponer vectores, control de acceso al índice. |
| **Tool abuse** | El agente usa una herramienta con parámetros maliciosos. | Permisos mínimos, sandbox, validación de argumentos. |
| **Denial of wallet** | Queries diseñadas para maximizar tokens y costo. | Rate limits, presupuestos, caching, límites de contexto. |
| **Supply chain** | Dependencias, modelos o datasets comprometidos. | Pinning, verificación de artefactos, SBOM. |

> [!note]
> Mapeo útil: **OWASP LLM Top 10**. Prompt injection (LLM01), insecure output handling (LLM02), training data poisoning (LLM03), model DoS (LLM04), supply chain (LLM05), sensitive information disclosure (LLM06), insecure plugin design (LLM07), excessive agency (LLM08), overreliance (LLM09) y model theft (LLM10).

## Gobernanza y ciclo de vida del dato

> RAG es, antes que nada, un problema de datos. La gobernanza no es burocracia: es lo que hace que el índice sea confiable.

### Procedencia y linaje

Cada chunk sabe de qué documento, versión y sección viene.

- **Por qué**: Auditoría y citas verificables.

### Retención

TTL por tipo de documento y borrado programado.

- **Riesgo**: Datos viejos que el índice sigue sirviendo.

### Derecho al olvido

Borrado en cascada: documento → chunks → vectores → cache.

- **Riesgo**: Borrar el original y dejar los embeddings.

### Licencias y consentimiento

Saber qué se puede indexar, citar y mostrar.

- **Riesgo**: Reproducir contenido sin derechos.

### Clasificación

Público, interno, confidencial, PII; cada nivel con su política.

- **Por qué**: ACL y enmascaramiento.

### Auditoría

Log de qué se recuperó, qué se respondió y con qué versión del índice.

- **Por qué**: Reproducibilidad y compliance.

## Observabilidad y operación

> Si no podés reconstruir por qué respondió eso, no podés mejorarlo.

- **Tracing** — Una traza por request: query original, reescrita, chunks recuperados, scores, prompt, respuesta y verificación.

- **Feedback loop** — Thumbs, correcciones y tickets alimentan el golden set. Sin loop, el sistema no aprende.

- **Drift** — Cambian los documentos, las preguntas y los modelos. Monitorear recall y abstención en el tiempo.

- **Reindexado** — Blue/green: construir el índice nuevo, validar, cambiar el tráfico, conservar el viejo para rollback.

- **Upgrade de embedding** — Cambiar de modelo suele cambiar dimensión y espacio: requiere reindexar todo, no solo recalcular queries.

- **Rollback** — Versionar índice, prompt, modelo y configuración. Poder volver en minutos, no en días.

> [!note]
> El error operativo más caro: **actualizar el embedder sin reindexar**. Las queries viven en un espacio y los documentos en otro; el recall se cae sin errores visibles.

## Costos y latencia

> Órdenes de magnitud para decidir, no benchmarks exactos. Medí en tu infraestructura.

| Etapa | Latencia típica | Costo relativo | Nota |
| --- | --- | --- | --- |
| Parsing / OCR | Offline / batch | Medio | Se paga una vez por documento. |
| Embedding de documentos | Offline / batch | Medio | Cachear por hash; no re-embeddear lo que no cambió. |
| Embedding de query | 10–50 ms | Bajo | Una por query (o por variante). |
| ANN (HNSW/IVF) | 1–10 ms | Bajo | Escala con N y con efSearch/nprobe. |
| BM25 | 1–5 ms | Bajo | Muy barato; ideal para híbrido. |
| Rerank (cross-encoder) | 20–200 ms | Medio | O(k) llamadas al modelo; k chico. |
| LLM | 300 ms–5 s | Alto | Domina el costo y la latencia. |
| Verificación de fidelidad | 100 ms–1 s | Medio | Opcional; se puede muestrear. |

- **Caching** — Cache semántico de respuestas, cache de embeddings y cache de retrieval para queries repetidas.

- **Compresión** — Menos tokens de contexto = menos costo y latencia. Comprimir con cuidado: se puede borrar el dato clave.

- **Ruteo** — No toda query necesita el modelo grande ni el rerank. Un router barato puede ahorrar mucho.

## RAG multimodal

> Un PDF no es texto: es layout. Tratarlo como texto plano pierde tablas, columnas y orden de lectura.

| Modalidad | Cómo se ingesta | Representación | Retrieval |
| --- | --- | --- | --- |
| **PDF con texto** | Parser + layout (PyMuPDF, Docling) | Chunks de texto + metadata de página/sección | Dense + sparse |
| **PDF escaneado** | OCR + layout analysis | Texto OCR + bounding boxes | Dense |
| **Tablas** | Parser de tablas (Camelot, Unstructured) | Filas como registros o Markdown | Dense + filtros por columna |
| **Imágenes y figuras** | Captioning con VLM + CLIP | Texto descriptivo + vector multimodal | CLIP / VLM |
| **Audio** | ASR (Whisper) | Transcripción con timestamps | Dense + rango temporal |
| **Video** | ASR + keyframes | Transcripción + captions por frame | Dense + filtro temporal |
| **Código** | AST (tree-sitter) | Funciones, clases y métodos | Dense + filtros por repo/lenguaje |

> [!note]
> La decisión clave es **qué representás**: el texto, la imagen, o una descripción de la imagen. Cada una recupera cosas distintas.

## Datos estructurados y grafos

> No todo se resuelve con embeddings. Si la pregunta es exacta, la respuesta también debería serlo.

### Text-to-SQL

Traducir la pregunta a SQL y ejecutarla sobre la base.

- **Cuándo**: Agregaciones, filtros exactos, métricas.

- **Riesgo**: SQL incorrecto o inseguro; validar y limitar permisos.

### Híbrido tabular + texto

La parte numérica va por SQL; la narrativa, por RAG.

- **Cuándo**: Reportes con contexto y cifras.

- **Riesgo**: Dos fuentes que se contradicen.

### GraphRAG

Extraer entidades y relaciones, y recuperar sobre el grafo.

- **Cuándo**: Multi-hop y relaciones entre entidades.

- **Riesgo**: Construcción y mantenimiento caros.

### Knowledge graph

Ontología con hechos verificados y consultas estructuradas.

- **Cuándo**: Dominio acotado y preciso.

- **Riesgo**: Curado manual y rigidez.

> [!note]
> Regla: si la pregunta se responde con un `GROUP BY`, no la mandes a un embedding.

## Memoria y orquestación

> RAG no vive en un solo turno. La memoria y el control flow son lo que separan un buscador de un asistente.

- **Buffer** — Últimos N turnos tal cual. Simple; crece rápido y se vuelve caro.

- **Summary** — Resumen incremental de la conversación. Comprime, pero puede perder detalle.

- **Long-term** — Hechos y preferencias persistentes en un store aparte, recuperables como cualquier documento.

- **Entity memory** — Estado por entidad (cliente, pedido, ticket) para no repetir contexto en cada turno.

- **Router** — Decide qué índice o herramienta usar: docs, tickets, SQL, web. Evita buscar en todos lados.

- **Plan + budget** — Descompone multi-hop, asigna tokens/latencia/costo y define una condición de corte.

> [!note]
> Sin **stop condition**, un agente multi-hop es un loop caro. Presupuesto y criterio de corte son parte del diseño, no un detalle de implementación.

---

← [[06 - Generation|Generation]] · [[08 - Decisiones|Decisiones]] →
