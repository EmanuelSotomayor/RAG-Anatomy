---
tags:
  - rag
  - rag/glosario
aliases:
  - Glosario RAG
  - Términos
---
# Glosario

> [!info] Cómo usarlo
> Cada término tiene una explicación simple. La columna “Analogía dev” conecta el concepto con algo cotidiano de desarrollo de software.

| Término | Explicación simple | Analogía dev |
| --- | --- | --- |
| abstención | Que el sistema diga "no tengo información suficiente" en vez de inventar una respuesta. |  |
| ACL | Access Control List: reglas de quién puede ver qué documento. Sin ACL, el retrieval puede filtrar datos de otro usuario. |  |
| agente | Sistema que decide pasos y usa herramientas en un loop, en vez de seguir un pipeline fijo. |  |
| agentes | Sistemas que deciden pasos y usan herramientas en un loop, en vez de seguir un pipeline fijo. |  |
| agentic | Diseño con un orquestador que decide qué hacer, qué herramienta usar y cuándo parar. |  |
| alucinación | Cuando el modelo inventa información que no está soportada por la evidencia. |  |
| alucinaciones | Afirmaciones inventadas por el modelo que no están soportadas por la evidencia. |  |
| ANN | Búsqueda aproximada de vecinos: encuentra vectores parecidos sin comparar contra todos. Como buscar en un mapa por zona en vez de calle por calle. |  |
| ASR | Automatic Speech Recognition: convertir audio en texto. |  |
| AST | Árbol de sintaxis del código. Permite cortar por función, clase o método en vez de por líneas. |  |
| attribution | Mapear cada afirmación de la respuesta a la fuente que la respalda. |  |
| BEIR | Benchmark heterogéneo para comparar modelos de retrieval en distintos dominios. |  |
| bi-encoder | Modelo que codifica consulta y documento por separado. Permite precalcular y buscar rápido. |  |
| blue/green | Tener dos versiones del sistema y cambiar el tráfico de una a otra para desplegar sin cortes. |  |
| BM25 | Búsqueda léxica clásica: puntúa por coincidencia de palabras, no por significado. |  |
| boilerplate | Texto repetitivo que no aporta información: headers, footers, avisos legales. Como el pie de página que se repite en todas las páginas. |  |
| buffer | Memoria que guarda los últimos turnos tal cual. Simple, pero crece rápido. |  |
| cache | Guardar resultados para no repetir trabajo. Como no volver a calcular lo que ya sabés. |  |
| chunk | Fragmento de documento que se indexa y recupera. Como cortar un libro en fichas. |  |
| chunking | Partir documentos en fragmentos indexables. La decisión define qué puede recuperar el sistema. | ETL que parte en registros |
| chunks | Fragmentos de documento que se indexan y recuperan. Como cortar un libro en fichas. |  |
| cita | Referencia explícita a una fuente, para que la respuesta sea verificable. |  |
| citas | Referencias explícitas a las fuentes usadas, para que el usuario pueda verificarlas. |  |
| CLIP | Modelo que alinea imágenes y texto en un mismo espacio vectorial; sirve para buscar imágenes. |  |
| ColBERT | Familia de modelos de late interaction: guarda un vector por token y compara con MaxSim. |  |
| context rot | Degradación general de la calidad cuando el contexto crece demasiado, aunque entre en la ventana. |  |
| contexto | Información que el modelo ve en una llamada: instrucciones, historial y documentos recuperados. |  |
| contrastive | Entrenamiento que acerca los pares correctos y aleja los incorrectos en el espacio vectorial. |  |
| corpus | El conjunto de documentos que el sistema puede consultar. Como la carpeta compartida del equipo. |  |
| corpus heterogéneo | Conjunto de documentos de distintos formatos y calidades: PDFs, HTML, tickets, escaneos. Como una carpeta compartida donde conviven Word, mails y fotos. |  |
| cosine | Medida de parecido entre vectores según el ángulo. Un valor alto indica cercanía semántica, no necesariamente utilidad. |  |
| CRAG | Variante que evalúa la calidad del retrieval y activa un fallback correctivo si es mala. |  |
| cross-encoder | Modelo que lee la consulta y el documento juntos para puntuar relevancia. Más preciso, más lento. |  |
| denial of wallet | Ataque que busca agotar el presupuesto haciendo consultas caras o masivas. |  |
| dense | Búsqueda por significado usando embeddings, en vez de coincidencia exacta de palabras. |  |
| dimensión | Cantidad de coordenadas que ubican un punto. Un embedding de 1.536 números vive en un espacio de 1.536 dimensiones, aunque en código sea un arreglo 1D. |  |
| distancia euclidiana | Distancia en línea recta entre dos puntos. Es Pitágoras generalizado a N dimensiones; 0 significa vectores idénticos. |  |
| DPR | Dense Passage Retrieval: bi-encoder entrenado para recuperar pasajes relevantes. |  |
| drift | Cambio gradual en los datos o en las preguntas que degrada el rendimiento con el tiempo. |  |
| embedder | Modelo que convierte texto en vectores. Como traducir cada texto a coordenadas en un mapa de significados. |  |
| embedding | Lista de números que representa el significado de un texto. Como coordenadas: textos parecidos quedan cerca. | Featurizar texto a vectores |
| embeddings | Listas de números que representan el significado de un texto. Textos parecidos quedan cerca en ese espacio. |  |
| encoder | Modelo que lee texto y lo comprime en una representación vectorial. No genera texto nuevo como un decoder. |  |
| entity | Una cosa concreta del dominio: un cliente, un producto, un ticket, una persona. |  |
| entity memory | Guardar el estado de cada entidad (cliente, pedido, ticket) para no repetir contexto en cada turno. |  |
| exfiltración | Sacar información del sistema por un canal no autorizado, por ejemplo a través de links o respuestas. |  |
| faithfulness | Qué tan fiel es la respuesta al contexto: cada afirmación debe estar soportada por la evidencia. |  |
| FiD | Fusion-in-Decoder: concatena varios pasajes en el decoder para responder con múltiples fuentes. |  |
| fine-tuning | Reentrenar un modelo con ejemplos para cambiar su comportamiento, estilo o formato. | Recompilar el binario |
| golden set | Conjunto de preguntas con su fuente y respuesta correctas, usado para medir el sistema. |  |
| GraphRAG | RAG sobre un grafo de entidades y relaciones. Útil para preguntas que conectan varios documentos. |  |
| ground truth | La respuesta o fuente considerada correcta por un humano, contra la cual se compara el sistema. |  |
| grounding | Que la respuesta se base en evidencia recuperada, no solo en la memoria interna del modelo. | Contrato de salida: solo datos de la fuente |
| guardrail | Barrera de seguridad que filtra entradas o salidas para evitar usos indebidos. |  |
| hallucination | Cuando el modelo inventa información que no está soportada por la evidencia. |  |
| hard negatives | Ejemplos parecidos a la respuesta correcta pero incorrectos. Se usan para entrenar un retriever más fino. |  |
| híbrido | Combinar búsqueda densa y léxica para cubrir significado y términos exactos. |  |
| HNSW | Un índice ANN basado en grafos. Es rápido y preciso, pero consume bastante memoria. |  |
| HyDE | Generar un documento hipotético con el modelo y usar ese texto para buscar, en vez de la pregunta cruda. |  |
| indexación | Proceso de construir el índice: parsear, cortar, vectorizar y guardar los documentos. |  |
| índice | Estructura que permite buscar rápido sin recorrer todo. Como el índice de un libro. |  |
| índices | Estructuras que permiten buscar rápido sin recorrer todo. Como el índice de un libro. |  |
| inferencia | El momento en que el modelo genera una respuesta, a diferencia del entrenamiento. |  |
| IVF | Índice ANN que agrupa vectores en clusters y busca solo en los más cercanos. |  |
| knowledge graph | Grafo de entidades y relaciones verificadas. Como un mapa de quién se relaciona con qué. |  |
| KV cache | Memoria interna del modelo para no recalcular tokens que ya procesó durante la generación. |  |
| late interaction | Técnica que compara vectores por token en vez de un solo vector por texto; más precisa y más cara. |  |
| latencia | Tiempo que tarda una respuesta desde que se hace la consulta. |  |
| layout-aware | Chunking que respeta columnas, tablas y orden de lectura en vez de cortar por caracteres. |  |
| LLM | Large Language Model: modelo de lenguaje entrenado con enormes cantidades de texto para generar y razonar. |  |
| LLM-as-judge | Usar otro modelo para evaluar respuestas. Es barato, pero tiene sesgos y hay que calibrarlo. |  |
| long context | Pasar muchos documentos directamente en el prompt en vez de recuperarlos con un índice. |  |
| lost in the middle | Fenómeno por el cual el modelo presta menos atención al centro de contextos largos. |  |
| matriz | Arreglo bidimensional: filas y columnas. Un lote de 32 embeddings de 1.536 dimensiones forma una matriz de 32 × 1.536. |  |
| mean pooling | Promediar los vectores de todos los tokens para obtener un solo vector del texto. |  |
| metadata | Datos que describen un documento: fecha, autor, área, permisos. Sirven para filtrar y autorizar. |  |
| metadatos | Datos que describen un documento: fecha, autor, área, permisos. Sirven para filtrar y autorizar. |  |
| MRR | Mean Reciprocal Rank: premia que el primer resultado correcto aparezca lo más arriba posible. |  |
| MTEB | Benchmark masivo para comparar embeddings en tareas y idiomas. |  |
| multi-hop | Pregunta que requiere varios pasos de búsqueda y razonamiento encadenados. |  |
| multimodal | Sistema que trabaja con texto, imágenes, audio o video en conjunto. |  |
| nDCG | Métrica que evalúa la calidad del orden completo, premiando los resultados relevantes arriba. |  |
| non-parametric memory | Conocimiento guardado fuera del modelo, por ejemplo en un índice de documentos. |  |
| normalización | Escalar un vector para que su longitud sea 1. Permite usar producto punto como si fuera similitud del coseno. |  |
| OCR | Reconocimiento óptico de caracteres: convierte una imagen escaneada en texto. |  |
| orquestación | Coordinar los pasos y componentes del sistema: retrieval, tools, memoria y generación. |  |
| overlap | Parte que se repite entre chunks consecutivos para no cortar una idea al medio. |  |
| OWASP | Organización que publica listas de riesgos de seguridad; su LLM Top 10 es referencia para RAG. |  |
| parametric memory | Conocimiento guardado en los pesos del modelo, no en una base externa. |  |
| parámetro | Número interno que define el comportamiento del modelo. Se ajusta durante el entrenamiento. |  |
| parámetros | Números internos que definen el comportamiento del modelo. Se ajustan durante el entrenamiento. |  |
| parent-document | Indexar fragmentos chicos para buscar, pero pasar al modelo el documento padre completo para responder. |  |
| parser | Componente que extrae texto y estructura de un archivo (PDF, HTML, Word). Como abrir un sobre y sacar el contenido. |  |
| payload | Datos extra que acompañan un vector en la base: texto original, archivo, página, permisos. Sirven para filtrar y reconstruir el contexto. |  |
| pesos del modelo | Los parámetros aprendidos durante el entrenamiento. Cambiarlos es lo que hace el fine-tuning. |  |
| PII | Información personal identificable: nombre, DNI, email, teléfono, dirección. |  |
| poisoning | Insertar documentos falsos o maliciosos en el corpus para contaminar las respuestas. |  |
| precision | De los resultados devueltos, qué proporción es realmente relevante. |  |
| producto punto | Multiplicar coordenada por coordenada y sumar. Con vectores normalizados da el mismo resultado que la similitud del coseno. |  |
| prompt | Texto de entrada que recibe el modelo: instrucciones, pregunta y contexto. |  |
| prompt engineering | Diseñar las instrucciones y el formato del contexto para obtener mejores respuestas. |  |
| prompt injection | Instrucción maliciosa escondida en un documento o input que intenta cambiar el comportamiento del modelo. |  |
| prompts | Textos de entrada que recibe el modelo. |  |
| query | La consulta o pregunta del usuario que dispara la búsqueda. |  |
| query rewriting | Reformular la pregunta para buscar mejor: agregar contexto, sinónimos o descomponerla. |  |
| RAG | Retrieval-Augmented Generation: buscar información y pasársela al modelo antes de responder. Como consultar la documentación en vez de contestar de memoria. | Consultar la DB en runtime |
| RAGAS | Framework de evaluación de RAG que mide fidelidad, relevancia y calidad del contexto. | Suite de tests con LLM-as-judge |
| RAPTOR | Resumir documentos en varios niveles para responder preguntas globales, no solo locales. |  |
| rate limit | Límite de consultas por usuario o por minuto para evitar abuso y costos descontrolados. |  |
| REALM | Modelo que trata el retrieval como una variable latente y entrena el retriever junto al generador. |  |
| Recall@k | De todos los documentos relevantes, cuántos aparecen en el top-k. Mide si el bueno se escapó. |  |
| reference-free | Métrica que no necesita una respuesta de referencia para calcularse; se apoya en el contexto o en otro modelo. |  |
| reindexado | Volver a construir el índice con documentos nuevos o con otro modelo de embeddings. |  |
| reranker | Modelo que reordena los candidatos recuperados. Más caro y más preciso que el primer retrieval. | ORDER BY score más fino |
| rerankers | Modelos que reordenan los candidatos recuperados. Más caros y más precisos. |  |
| reranking | Reordenar los candidatos con un modelo más preciso antes de pasarlos al generador. |  |
| retrieval | Recuperar los documentos o fragmentos más relevantes para una consulta. | SELECT ... LIMIT k (dense + grep) |
| rollback | Volver a una versión anterior del sistema cuando la nueva falla. |  |
| router | Componente que decide qué fuente o herramienta usar para cada consulta. |  |
| Self-RAG | Variante donde el modelo decide si necesita recuperar y evalúa si lo recuperado es útil. |  |
| semantic cache | Cachear respuestas por similitud de significado, no por texto exacto. |  |
| semantic collapse | Cuando un chunk grande mezcla tantos temas que su embedding promedia todo y pierde el detalle. |  |
| similitud coseno | Medida de parecido entre vectores según el ángulo que forman. No mide relevancia por sí sola. |  |
| SLA | Acuerdo de nivel de servicio: latencia y disponibilidad prometidas a los usuarios. |  |
| sparse | Búsqueda por coincidencia de palabras, con vectores mayormente en cero. |  |
| SPLADE | Búsqueda léxica neural que expande términos y sigue siendo eficiente con índices invertidos. |  |
| SQL | Lenguaje para consultar bases de datos relacionales con filtros y agregaciones exactas. |  |
| stop condition | Criterio explícito para cortar un loop de agente y evitar costos o respuestas infinitas. |  |
| summary memory | Memoria que resume la conversación para comprimir el historial. |  |
| supply chain | Riesgos de dependencias, modelos o datasets de terceros que pueden venir comprometidos. |  |
| tenant | Cliente o espacio aislado dentro de un mismo sistema. Los datos de un tenant no deben verse desde otro. |  |
| tensor | Arreglo de N ejes. Un tensor 3D puede representar un lote de secuencias de embeddings. |  |
| text-to-SQL | Traducir una pregunta a SQL para consultar una base de datos. Ideal para filtros y agregaciones exactas. |  |
| throughput | Cuántas consultas por segundo puede procesar el sistema. |  |
| token | Unidad mínima de texto que procesa el modelo: una palabra, parte de una palabra o un signo. |  |
| tokenizador | Componente que parte el texto en tokens. Es el que define el largo real de un prompt. |  |
| tokens | Unidades mínimas de texto que procesa el modelo: palabras, partes de palabras o signos. |  |
| top-k | Los k mejores resultados de una búsqueda. Es cuántos candidatos pasan a la siguiente etapa. |  |
| tracing | Registrar el recorrido completo de una consulta: query, chunks, scores, prompt y respuesta. |  |
| vector | Lista de números que representa un objeto. El embedding es un vector de significado. |  |
| vectores | Listas de números que representan objetos o textos. El embedding es un vector de significado. |  |
| ventana de contexto | Cantidad máxima de tokens que el modelo puede leer en una sola llamada. |  |
| VLM | Vision-Language Model: modelo que entiende imágenes y texto a la vez. |  |

---

[[01 - Visión general|← Visión general]] · [[11 - Diagramas|Diagramas →]]
