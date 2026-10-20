---
tags:
  - rag
  - rag/anatomia
  - rag/overview
aliases:
  - RAG
  - Retrieval Augmented Generation
  - Visión general
---
# Visión general

> [!abstract] Idea central
> Una arquitectura que desacopla el conocimiento del modelo. No reentrena: recupera, aumenta y genera con la fuente delante.

## Definición corta

> [!quote]
> RAG (Retrieval-Augmented Generation) es un pipeline que, sin tocar los pesos del modelo, recupera fragmentos relevantes de una base de conocimiento externa y los inyecta en el contexto del LLM para que genere una respuesta fundamentada en esa información.

## Definición técnica

> [!info] A nivel técnico
> El **Retrieval Augmented Generation (RAG)** es una **arquitectura** que, sin re-entrenar el **modelo**, permite recuperar **información relevante** de una **base de conocimiento externa** (memoria **no paramétrica**) y la inyecta en el contexto del **LLM** para que genere una respuesta fundamentada en esa información.

## En palabras simples

> [!tip] En palabras simples
> **RAG** es darle al **LLM** un **buscador** para que consulte nuestros **documentos** antes de responder.

## Qué no es RAG

> [!warning] Fine-tuning
> Recompila el binario: modifica los pesos y el comportamiento. No es una vía confiable para inyectar conocimiento factual.

> [!warning] RAG
> Consulta la DB en runtime: el RAG estándar no toca los pesos. La familia RAG incluye variantes que entrenan retriever y/o generador.

> [!warning] Agente
> Un RAG no es necesariamente un agente. El pipeline es lineal; el bucle agéntico es una variante.

## Los 4 contratos

| Desde | Fase | Hacia |
| --- | --- | --- |
| Documentos crudos | 1 · CHUNKING | Índice vectorial + sparse + chunk store + metadata |
| Query | 2 · RETRIEVAL | Top-n chunks ordenados + scores + procedencia |
| Query + chunks | 3 · AUGMENTED | messages + citations_map + trace |
| Prompt final | 4 · GENERATION | Respuesta + citas + grounded + confidence |

## Prioridades

| # | Qué mover | Por qué |
| --- | --- | --- |
| 1 | Retrieval + chunking | Mueve más la aguja: si el buen chunk no entra al top-k, el generador no lo puede inventar. |
| 2 | Reranking | Segundo mayor impacto por esfuerzo. |
| 3 | Prompt / augmentation | Tercero. Orden, presupuesto y formato. |
| 4 | Modelo generador | Último. Cambiar de LLM rara vez arregla un retrieval roto. |

## Diagnóstico por síntoma

| Síntoma | Métrica | Dónde mirar |
| --- | --- | --- |
| No encuentra el dato | Recall@k bajo | Fase 1–2 · chunking / retrieval |
| Encuentra ruido | Precision@k baja | Fase 2 · filtros y reranking |
| El contexto no sirve | Context relevance baja | Fase 3 · selección y orden |
| Inventa pese al contexto | Faithfulness baja | Fase 4 · grounding y decoding |
| Responde otra cosa | Answer relevance baja | Fase 3–4 · prompt y modelo |

## Variantes de RAG

### Naive RAG

Retrieve → read. El pipeline vanilla: buscar, concatenar, responder.

- **Analogía dev**: Script lineal

### Advanced RAG

Pre-retrieval (rewrite, HyDE) y post-retrieval (rerank, compresión).

- **Analogía dev**: Pipeline con etapas

### Modular RAG

Componentes intercambiables: routing, memoria, tools, evaluadores.

- **Analogía dev**: Microservicios / plugins

### Self-RAG · CRAG · Adaptive

El sistema decide si recuperar, evalúa lo recuperado y corrige o hace fallback.

- **Analogía dev**: Retries con validación

### GraphRAG

Recupera sobre un knowledge graph en vez de (o además de) vectores.

- **Analogía dev**: Grafo de conocimiento

### Agentic RAG

ReAct multi-hop: decide a qué fuente pegar, encadena llamadas y reintenta.

- **Analogía dev**: Orquestador con loop

## Límites que no se negocian

1. El techo del sistema es el retriever: si el chunk correcto no entra al top-k, el generador no lo puede inventar.
2. El domain gap del embedder define la semántica de la búsqueda; si no entiende tu jerga, el recall cae.
3. El chunking es un hiperparámetro crítico y de efectos no triviales; se decide midiendo, no adivinando.
4. RAG no elimina las alucinaciones: las mitiga condicionalmente y las desplaza hacia errores de fidelidad.

---

[[02 - Fundamentos|Fundamentos]] →
