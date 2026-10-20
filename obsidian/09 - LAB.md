---
tags:
  - rag
  - rag/lab
  - rag/evaluacion
aliases:
  - LAB
  - Calculadora RAG
  - Inyector de fallas
---
# LAB

> [!info] Propósito
> Un laboratorio para desarrollar intuición: cuánto cuesta y tarda una configuración, qué presión ejerce sobre la ventana de contexto y qué se rompe cuando falla cada pieza.

## Calculadora de costo y latencia

### Entradas

- Documentos totales.
- Chunks por documento.
- Candidatos `k`.
- Tokens de contexto.
- Consultas por día.
- Reranker activado o desactivado.

### Salidas

- Chunks totales.
- Memoria estimada del índice.
- Latencia estimada por query.
- Costo por query.
- Costo mensual.
- Costo de indexado.
- Presión sobre la ventana de contexto.

### Supuestos

- Embeddings de 768 dimensiones en `float32` con 1.5x de overhead.
- Chunks de ~300 tokens.
- LLM a $3 por 1M de tokens de entrada y $15 por 1M de salida.
- Ventana de contexto de 128k tokens.

> [!warning] Importante
> Son estimaciones de orden de magnitud para comparar configuraciones, no un benchmark ni una promesa de SLA.

## Simulador de chunking

Variables:

- Tokens del documento.
- Tokens por chunk.
- Overlap.

Fórmulas:

```text
chunks = ceil((tokens_documento - overlap) / (chunk_size - overlap))
desperdicio = (chunks - 1) * overlap / tokens_documento
tokens_indexados = chunks * chunk_size
```

Interpretación:

- Chunks más chicos: más precisión de match, pero riesgo de hechos incompletos.
- Chunks más grandes: más contexto por fragmento, pero el embedding se diluye.
- Overlap alto: duplica contenido y agranda el índice sin agregar señal.

## Inyector de fallas

| Falla | Fase | Síntoma | Métrica | Fix | Impacto |
| --- | --- | --- | --- | --- | --- |
| Embedding mismatch | Fase 1–2 | El retrieval devuelve resultados aparentemente aleatorios. No hay error, solo mala calidad. | Recall@k se desploma de un día para el otro. | Reindexar todo con el modelo nuevo y versionar embedder + índice juntos. Cambiar solo el query encoder nunca alcanza. | 95% |
| Índice stale | Fase 1 | Responde con datos viejos o con documentos que ya se borraron. | Tasa de respuestas obsoletas; documentos eliminados que siguen apareciendo. | Reindexado incremental, TTL y borrado en cascada documento → chunks → vectores → cache. | 80% |
| Chunk cortado | Fase 1 | El chunk recuperado menciona el tema pero no contiene la respuesta completa. | Recall@k bajo en preguntas factuales; faithfulness baja. | Overlap, chunking estructural o parent-document: indexar el hijo y pasar el padre. | 70% |
| Fuga por ACL | Fase 1–3 | El contexto incluye documentos de otro tenant o de otra área. | Tests de aislamiento; auditoría de accesos. | ACL en el payload, filtrado pre-retrieval y defensa en profundidad en la fase 3. | 100% |
| Prompt injection indirecta | Fase 3 | El modelo obedece instrucciones escondidas en un documento recuperado. | Tasa de respuestas fuera de política; evals adversarios. | Spotlighting, jerarquía de instrucciones, delimitadores y sanitización del contexto. | 90% |
| Lost in the middle | Fase 3 | El dato clave está en el contexto, pero el modelo lo ignora. | Faithfulness baja cuando crece el contexto. | Poner los mejores chunks en los extremos, reducir contexto y comprimir. | 60% |
| k demasiado chico | Fase 2 | El chunk correcto nunca aparece: no está en el top-k. | Recall@k bajo con Precision@k alto. | Subir k, agregar híbrido y rerank. Medir el costo extra. | 75% |
| Sin reranker | Fase 2 | Buen recall, mal orden: el mejor chunk queda abajo y el contexto se llena de ruido. | MRR y nDCG bajos aunque Recall@k sea aceptable. | Cross-encoder sobre el top-k, con k moderado para controlar latencia. | 65% |
| Alucinación pese al contexto | Fase 4 | El modelo inventa un dato aunque la fuente esté disponible. | Faithfulness baja; claims no soportados. | Baja temperatura, citas obligatorias, verificación por claim y abstención explícita. | 85% |
| Context overflow | Fase 3 | El prompt se trunca y se pierde justo el final, donde estaba la respuesta. | Respuestas incompletas; tokens truncados. | Presupuesto real con el tokenizador del LLM, selección por score y compresión. | 55% |

---

← [[08 - Decisiones|Decisiones]]
