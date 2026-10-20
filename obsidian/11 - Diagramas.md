---
tags:
  - rag
  - rag/diagramas
aliases:
  - Diagramas
  - Pipeline RAG
---
# Diagramas

## Pipeline isométrico animado

![[pipeline-isometrico.svg]]

> [!note] Animación
> El SVG conserva la animación de los paquetes entre fases. Si tu versión de Obsidian no reproduce SMIL, se ve igual como diagrama estático.

## Versión PNG

![[pipeline-isometrico.png]]

## Pipeline en Mermaid

```mermaid
flowchart LR
  A[Documentos crudos] --> B[CHUNKING]
  B --> C[Índice consultable]
  C --> D[RETRIEVAL]
  D --> E[Top-n chunks]
  E --> F[AUGMENTED]
  F --> G[Prompt final]
  G --> H[GENERATION]
  H --> I[Respuesta validada]
  I --> J[Evaluación / feedback]
  J -.-> B
```

## Diagramas por fase

### Chunking

```mermaid
flowchart LR
  A[Documentos crudos] --> B[Parsing + OCR]
  B --> C[Limpieza y deduplicación]
  C --> D[Metadata]
  D --> E[Chunking]
  E --> F[Embeddings]
  F --> G[(Índice vectorial)]
  E --> H[(Chunk store)]
  F --> I[(Índice léxico)]
  G --> J[RETRIEVAL]
  H --> J
  I --> J
```

### Retrieval

```mermaid
flowchart LR
  Q[Query] --> P[Preprocesar]
  P --> T[Transformar / reescribir]
  T --> E[Encoding]
  E --> D[(ANN dense)]
  E --> S[(BM25 / sparse)]
  D --> F[Fusionar]
  S --> F
  F --> R[Reranking]
  R --> O[Post-procesar]
  O --> N[Top-n chunks]
```

### Augmented

```mermaid
flowchart LR
  A[Query + chunks] --> B[Presupuesto de tokens]
  B --> C[Selección]
  C --> D[Orden]
  D --> E[Formato + citas]
  E --> F[Compresión]
  F --> G[Guardrails]
  G --> H[messages finales]
```

### Generation

```mermaid
flowchart LR
  A[Prompt final] --> B[Decoding]
  B --> C[Respuesta borrador]
  C --> D[Citas]
  D --> E[Verificación de fidelidad]
  E --> F{¿Grounded?}
  F -- Sí --> G[Respuesta validada]
  F -- No --> H[Abstención o reparación]
  H --> G
```

---

[[01 - Visión general|← Visión general]] · [[10 - Glosario|Glosario →]]
