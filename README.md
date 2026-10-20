# RAG Anatomy

App interactiva para navegar las **4 fases de una arquitectura RAG** y ver, en cada una, sus componentes, pasos internos, algoritmos, estrategias, hiperparámetros, modos de falla y métricas.

Sin build y sin servidor obligatorio: HTML + CSS + JS plano. Los simuladores son HTML autónomos; el laboratorio de embeddings incluye Tailwind local.

## Cómo abrir

**Opción 1 — directo**

Abrí `index.html` en el navegador (doble click). Funciona con `file://`.

**Opción 2 — servidor local** (recomendado si querés compartirla en red)

```bash
cd RAG-Anatomy
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Qué incluye

| Vista | Contenido |
|---|---|
| **Visión general** | Definición, fine-tuning vs RAG, los 4 contratos, la regla del techo, diagnóstico por fase, variantes, límites y glosario dev |
| **1 · CHUNKING** | Ingesta, parsers, OCR, layout, dedupe, metadata/ACL, estrategias de chunking, patrones small-to-big, embeddings, índices ANN. Incluye **Chunking en profundidad**: dimensiones, matrices/tensores, distancias, coseno, producto punto, ingesta vs. consulta, encoder/bi-encoder/cross-encoder y **2 simuladores interactivos** |
| **2 · RETRIEVAL** | Preprocesamiento y transformación de query, hybrid search, ANN, reranking, MMR, compresión, iteración, entrenamiento del retriever |
| **3 · AUGMENTED** | Token budgeting, orden anti *lost-in-the-middle*, formato, prompt en 4 capas, compresión, guardrails y prompt injection |
| **4 · GENERATION** | Decoding, citas, verificación de fidelidad, abstención/repair y ensamblado final |
| **Fundamentos** | Definiciones precisas (grounding ≠ faithfulness ≠ attribution), RAG vs long context vs fine-tuning, taxonomía, mitos, madurez, papers clave y fórmulas de evaluación |
| **Transversal** | Evaluación por fase, threat model de seguridad, gobernanza del dato, observabilidad/operación, costos/latencia, RAG multimodal, datos estructurados y memoria/orquestación |
| **Decisiones** | Cuándo NO usar RAG, árbol de decisión de chunking, build vs buy y checklist de producción |
| **LAB** | Calculadora interactiva de costo/latencia, simulador de chunking (chunk size/overlap) e inyector de fallas con diagnóstico |

Cada fase muestra:

- Contrato de **entrada** y **salida**.
- Pasos internos con los algoritmos que intervienen.
- Tabla de algoritmos (nombre, rol, qué hace).
- Estrategias con **cuándo usarlas** y su **tradeoff**.
- Hiperparámetros con valores típicos y efecto.
- Modos de falla.
- Métricas de la fase.
- **Salida en detalle**: cada artefacto del contrato explicado con qué es, qué función cumple, con qué fase conecta y una analogía de desarrollo.

## Navegación

- **Sidebar**: orden de lectura en tres bloques: **Empezar** (Visión general, Fundamentos) → **Pipeline** (4 fases) → **Profundizar** (Transversal, Decisiones, LAB).
- **Diagrama isométrico**: click en cualquier cubo para abrir esa fase.
- **Pager anterior/siguiente**: sigue la misma secuencia de lectura que el menú.
- **Subnav sticky** dentro de cada fase/página: contratos, salida en detalle, pasos, algoritmos, estrategias, hiperparámetros, fallas, métricas o las secciones conceptuales.
- **Glosario inline**: los términos técnicos aparecen subrayados; al pasar el mouse (o tocar en móvil) muestran una explicación simple.
- **Buscador**: indexa todo el contenido (pasos, algoritmos, estrategias, fallas, métricas, glosario, páginas conceptuales y el deep dive de Chunking). Click en un resultado te lleva a la sección exacta.
- **Simuladores**: dentro de Chunking en profundidad se embeben dos HTML autocontenidos: el laboratorio de embeddings/dimensiones y el inspector del pipeline RAG. También se pueden abrir en pestaña aparte.
- **Atajos**: `1`–`4` fases, `0`/`H` visión general, `F` fundamentos, `T` transversal, `D` decisiones, `L` lab, `/` buscar, `Esc` cerrar búsqueda.
- **Deep links**:
  - `index.html#retrieval`
  - `index.html#chunking/contrato-detalle`
  - `index.html#chunking/deep-embeddings`
  - `index.html#chunking/deep-distancias`
  - `index.html#chunking/deep-flujo`
  - `index.html#chunking/deep-modelos`
  - `index.html#chunking/deep-encoders`
  - `index.html#retrieval/entrenamiento`
  - `index.html#fundamentos/definiciones`
  - `index.html#transversal/seguridad`
  - `index.html#decisiones/chunking`
  - `index.html#lab/calculadora`
  - `index.html#lab/chunking`
  - `index.html#lab/fallas`
  - `index.html#general/glosario`
- **Fórmulas**: las expresiones matemáticas se renderizan con **KaTeX vendorizado** (`vendor/katex/`), tanto en el deep dive de Chunking como en las fórmulas de evaluación.
- **Tema**: toggle claro/oscuro (se guarda en `localStorage`). También `?theme=light`.

## Apuntes para Obsidian

El contenido también está exportado como vault de Obsidian en `obsidian/`:

- `00 - RAG Anatomy.md`: nota índice con la ruta de lectura.
- Una nota por visión general, fase, página conceptual, LAB y glosario.
- Enlaces internos `[[...]]`, frontmatter, callouts, tablas Markdown y fórmulas en LaTeX nativo.
- Diagramas Mermaid por fase.
- `attachments/pipeline-isometrico.svg`: versión animada del diagrama isométrico.
- `attachments/pipeline-isometrico.png`: fallback estático.

Para abrirlo, en Obsidian elegí **Open folder as vault** y apuntá a `obsidian/`.

En esta copia local, el vault se regenera desde los datos de la app con `node tools/build-obsidian.mjs`. El generador y `PROGRESS.md` no se versionan: quedan solo en la copia local. El SVG se genera siempre; el PNG de fallback se rasteriza con Chromium si está instalado.

> **Atención:** `obsidian/` es una carpeta generada. El script la borra y la recrea, así que las ediciones manuales dentro del vault se pierden. Para cambios permanentes, editá `data.js`, `chunking-deep.js`, `pages.js`, `lab.js` o `terms.js` y regenerá.

## Estructura

```
RAG-Anatomy/
├── index.html   # shell de la app
├── styles.css   # diseño, tema claro/oscuro, responsive
├── data.js      # contenido de las 4 fases + overview
├── chunking-deep.js  # deep dive de Chunking: embeddings, distancias y encoders
├── simuladores/ # simuladores HTML interactivos (embeddings y pipeline)
├── vendor/katex/  # KaTeX local para renderizar fórmulas LaTeX
├── pages.js     # contenido de Fundamentos, Transversal y Decisiones
├── lab.js       # página LAB + lógica interactiva (calculadora e inyector de fallas)
├── terms.js     # glosario de términos técnicos + tooltips inline
├── app.js       # navegación, diagrama isométrico SVG, búsqueda, render
└── obsidian/    # vault generado (notas + adjuntos)
```

### Personalizar

- `data.js`: `PHASES[]` (una entrada por fase) y `OVERVIEW` (definición, contratos, prioridades, diagnóstico, variantes, límites y glosario).
- `chunking-deep.js`: secciones extra de Chunking (`CHUNKING_DEEP`). Se adjuntan a la fase en `app.js` y se exportan al vault.
- `pages.js`: `PAGES[]` con las páginas conceptuales. Cada una tiene `sections[]` con `id`, `title`, `sub` y `html` (HTML crudo), así que agregar una sección es solo escribir el bloque.
- `lab.js`: `LAB_PAGE` (se agrega sola a `PAGES`) y `mountLab()`, que conecta los sliders y los botones de fallas.
- `terms.js`: `TERMS` (término → explicación simple) y la lógica que envuelve la primera aparición de cada término en el contenido renderizado. Agregar una definición es solo sumar una entrada al objeto.
- `simuladores/`: HTML autónomos que se cargan en `iframe`. El laboratorio de embeddings usa una copia local de Tailwind (`tailwind.js`); el inspector del pipeline usa CSS propio.

Si agregás una fase o una página, el render y el buscador se actualizan solos (el nav se arma desde `PHASES` y `PAGES`).

## Sobre el diseño

El diagrama del pipeline es un SVG isométrico generado en runtime (sin librerías), con caras sombreadas, conectores animados y navegación por click. La intención es tomar el lenguaje visual de [Anatomy](https://github.com/wheresryan22/anatomy) —figuras isométricas, partes sólidas, card con lectura— aplicado a un sistema de software en vez de una máquina física.

> Nota: la skill `/anatomy` no está instalada en este entorno, así que el diagrama se construyó a mano con el mismo espíritu visual. Si querés una figura Anatomy real (con WebGL, auditoría de geometría y close-ups), se puede instalar la skill y generar una pieza aparte.

## Stack

- HTML, CSS y JavaScript vanilla.
- SVG isométrico generado con `data.js` + `app.js`.
- App principal sin dependencias ni build step. Los simuladores son HTML autónomos; el laboratorio de embeddings incluye Tailwind local. KaTeX está vendorizado en `vendor/katex/` para renderizar LaTeX sin CDN.
