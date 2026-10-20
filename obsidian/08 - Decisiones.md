---
tags:
  - rag
  - rag/decisiones
aliases:
  - Decisiones
  - Cuándo usar RAG
---
# Decisiones

> [!info] Propósito
> Playbooks de decisión: cuándo no usar RAG, cómo elegir chunking, qué comprar y qué construir, y un checklist para pasar de demo a producción.

## ¿Cuándo NO usar RAG?

> RAG no es la respuesta a todo. Estos casos suelen terminar en un sistema más simple y más confiable.

- **El corpus entra en el contexto** — Si son 20 páginas estáticas, pasarlas enteras es más simple y más preciso que indexar y recuperar. Usá long context.

- **Reglas deterministas** — Si la respuesta se calcula con una regla o un lookup exacto, RAG agrega variabilidad innecesaria. Usá código.

- **Datos estructurados con SQL exacto** — Para "¿cuánto vendimos en marzo?" no necesitás embeddings. Usá text-to-SQL o una API.

- **Razonar sobre todo el corpus** — Si la tarea requiere agregar o comparar todos los documentos, el retrieval por chunks puede perder la visión global. Usá long context, map-reduce o GraphRAG.

- **Latencia ultra baja** — Si necesitás milisegundos, un pipeline con embeddings + LLM no es el camino. Usá cache o reglas.

- **Auditoría legal formal** — Si la respuesta debe seguir una norma verificable paso a paso, un LLM puede no ser la herramienta. Usá un sistema basado en reglas.

## Árbol de decisión de chunking

> No hay un chunk_size universal. Hay una decisión que depende de la estructura y del tipo de pregunta.

```text
¿Qué tipo de documento es?
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
3. Recién entonces tocar el embedder.
```

> [!note]
> Regla: el chunking se decide **midiendo**, no adivinando. Y se mide en tokens del embedder, no del LLM.

## Build vs buy

> Qué conviene construir y qué conviene comprar. La respuesta cambia con el tamaño del equipo y el grado de diferenciación.

| Componente | Open source | Managed | Cuándo construir |
| --- | --- | --- | --- |
| **Vector store** | pgvector, Qdrant, Milvus, FAISS | Pinecone, Weaviate Cloud | Casi nunca; solo si hay requisitos extremos de escala o latencia. |
| **Embeddings** | E5, BGE, GTE, Sentence-BERT | OpenAI, Cohere, Voyage | Si tu dominio tiene jerga muy específica y medís una mejora clara. |
| **Reranker** | bge-reranker, monoT5 | Cohere Rerank | Rara vez; el costo de entrenar uno propio es alto. |
| **Orquestación** | LangChain, LlamaIndex, Haystack | Plataformas gestionadas | Si el pipeline es el core de tu producto y necesitás control total. |
| **Evaluación** | RAGAS, DeepEval, TruLens | Observabilidad gestionada | El golden set y las métricas de tu dominio siempre son propios. |

> [!note]
> La diferenciación real casi nunca está en el vector store. Está en **tus datos, tu chunking, tu evaluación y tu dominio**.

## Checklist de producción

> Si falta uno de estos, el sistema todavía es una demo.

- [ ] Golden set con preguntas reales y chunk/respuesta esperados.
- [ ] Métricas por fase: Recall@k, context relevance, faithfulness, answer relevance.
- [ ] ACL en el payload y filtrado pre-retrieval.
- [ ] Citas verificables y mapeadas a documento, sección y página.
- [ ] Abstención explícita cuando el contexto no alcanza.
- [ ] Tracing completo por request (query, chunks, scores, prompt, respuesta).
- [ ] Versionado de índice, prompt, modelo y configuración.
- [ ] Reindexado incremental y borrado en cascada.
- [ ] Mitigaciones de prompt injection y sanitización del contexto.
- [ ] Presupuesto de tokens, latencia y costo por query.
- [ ] Feedback loop que alimenta el golden set.
- [ ] Plan de rollback y upgrade de embedding model.

---

← [[07 - Transversal|Transversal]] · [[09 - LAB|LAB]] →
