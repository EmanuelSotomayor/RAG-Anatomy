---
tags:
  - rag
  - rag/moc
aliases:
  - RAG Anatomy
  - Inicio
  - MOC
---
# RAG Anatomy

> [!abstract] Qué es este vault
> Apuntes navegables de una arquitectura RAG completa: fundamentos, pipeline, evaluación, seguridad, decisiones y laboratorio. Exportado desde la app interactiva RAG Anatomy.

![[pipeline-isometrico.svg]]

## Ruta de lectura

1. [[01 - Visión general|Visión general]]
2. [[02 - Fundamentos|Fundamentos]]
3. [[03 - Chunking|Chunking]]
4. [[04 - Retrieval|Retrieval]]
5. [[05 - Augmented|Augmented]]
6. [[06 - Generation|Generation]]
7. [[07 - Transversal|Transversal]]
8. [[08 - Decisiones|Decisiones]]
9. [[09 - LAB|LAB]]

## Pipeline

| Fase | Qué produce | Nota |
|---|---|---|
| 1 | Índice consultable | [[03 - Chunking\|Chunking]] |
| 2 | Top-n chunks | [[04 - Retrieval\|Retrieval]] |
| 3 | Prompt final | [[05 - Augmented\|Augmented]] |
| 4 | Respuesta validada | [[06 - Generation\|Generation]] |

## Referencia

- [[10 - Glosario|Glosario]]
- [[11 - Diagramas|Diagramas]]
- [[07 - Transversal|Evaluación, seguridad y operación]]
- [[08 - Decisiones|Cuándo usar y cuándo no]]
- [[09 - LAB|Calculadora, simulador y fallas]]

## Regla base

> [!important] El techo del sistema
> El techo real es **min(calidad del retrieval, calidad de la generación)**. El retriever es el límite más frecuente, no el único.
