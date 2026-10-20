/* RAG Anatomy — Chunking en profundidad
   Contenido adaptado de "1. RAG Foundations" (Obsidian) e integrado
   como una sección data-driven de la fase Chunking. */

const CHUNKING_DEEP = {
  title: "Chunking en profundidad",
  sub: "De strings a vectores: qué significa una dimensión, cómo se mide la distancia, cómo fluye la ingesta y por qué un bi-encoder no es un LLM.",
  sections: [
    {
      id: "embeddings",
      title: "Embeddings: vectores, dimensiones y espacios N-dimensionales",
      sub: "El chunking corta texto; el modelo de embeddings lo convierte en coordenadas. Estas coordenadas son las que después se buscan.",
      html: `
        <div class="deep-lead">
          <p><strong>Chunking</strong> —también llamado <strong>Indexing</strong>— es la fase en la que partimos los documentos en fragmentos (<strong>chunks</strong>) de distinta longitud, según cuánto texto queremos pasarle al modelo. Después esos chunks pasan a un <strong>entorno vectorial</strong> conocido como <strong>embeddings</strong> y se guardan en una base de datos vectorial, o en una base que tenga soporte para vectores. Cuando hacemos una pregunta, buscamos ahí y traemos los fragmentos más parecidos. En términos de desarrollo: parseamos las fuentes, las normalizamos, las particionamos en registros y construimos un índice, igual que preparar una tabla para consultas rápidas.</p>
          <p>El <strong>chunking</strong> es una operación sobre texto: parte un documento en fragmentos llamados <strong>chunks</strong>. Recién después, un <strong>modelo de embeddings</strong> toma cada chunk y lo transforma en un vector numérico de <strong>N dimensiones</strong>. Los textos con significado similar terminan cerca en el espacio vectorial; esa cercanía es la que usa el retrieval.</p>
          <p>La idea es imaginar un <strong>mapa</strong>: cada embedding es una coordenada y los conceptos parecidos quedan próximos. Esa proximidad se mide con una fórmula de distancia o similitud.</p>
        </div>

        <div class="vector-example">
          <div class="vector-row">
            <span class="vector-label">El gato duerme en el sofá</span>
            <code>[0.12, -0.34, 0.87, …]</code>
          </div>
          <div class="vector-row">
            <span class="vector-label">Un felino descansa en el mueble</span>
            <code>[0.11, -0.33, 0.85, …]</code>
          </div>
          <div class="vector-row far">
            <span class="vector-label">Python es un lenguaje de programación</span>
            <code>[-0.45, 0.72, 0.01, …]</code>
          </div>
        </div>

        <div class="callout"><strong>Resumen:</strong> un embedding es una lista de números reales que representa un concepto —palabra, frase, imagen— como un único punto o dirección dentro de un espacio matemático. Aunque tenga 1.536 dimensiones, en código sigue siendo un <strong>vector 1D</strong>: se recorre con un solo índice, <code>vector[i]</code>.</div>

        <h3 class="deep-h3">1.1.1 La gran confusión: dos significados de “dimensión”</h3>
        <p>Cuando decimos que un embedding es un “vector de N dimensiones”, solemos pensar que a partir de 2 dimensiones debería ser una matriz. La clave está en distinguir qué significa <strong>dimensión</strong> según la disciplina:</p>

        <div class="deep-grid">
          <div class="deep-card">
            <span class="mini-tag">Álgebra lineal y geometría</span>
            <h4>Dimensión del espacio</h4>
            <p>Es la <strong>cantidad de coordenadas o ejes</strong> que necesitamos cruzar para ubicar un único punto.</p>
            <ul class="deep-list">
              <li>2 números <code>(x, y)</code> → espacio de 2 dimensiones (ℝ²).</li>
              <li>3 números <code>(x, y, z)</code> → espacio de 3 dimensiones (ℝ³).</li>
              <li>1.536 números <code>(x₁, x₂, …, x₁₅₃₆)</code> → espacio de 1.536 dimensiones (ℝ¹⁵³⁶).</li>
            </ul>
          </div>
          <div class="deep-card">
            <span class="mini-tag">Programación y datos</span>
            <h4>Rango o ejes del tensor</h4>
            <p>Es la <strong>cantidad de índices independientes</strong> que necesitamos para acceder a un dato: <code>array[i]</code> frente a <code>array[i][j]</code>.</p>
            <ul class="deep-list">
              <li>Un embedding individual → <code>array[i]</code> → 1D.</li>
              <li>Un lote de embeddings → <code>matriz[fila][columna]</code> → 2D.</li>
              <li>Secuencias por lotes → <code>tensor[b][t][d]</code> → 3D.</li>
            </ul>
          </div>
        </div>

        <h3 class="deep-h3">1.1.2 Tabla de equivalencias: álgebra vs. código</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Concepto matemático</th><th>Representación en código</th><th>Rango / ejes</th><th>Shape</th><th>Cómo se indexa</th></tr></thead>
            <tbody>
              <tr><td><strong>Escalar</strong></td><td>Un único número (<code>42</code>)</td><td><code>0D</code></td><td><code>()</code></td><td><code>valor</code></td></tr>
              <tr><td><strong>Vector (1 embedding)</strong></td><td>Lista de números (<code>[0.1, -0.4, 0.8]</code>)</td><td><code>1D</code></td><td><code>(1536,)</code></td><td><code>vector[i]</code></td></tr>
              <tr><td><strong>Matriz (batch de embeddings)</strong></td><td>Tabla de filas y columnas</td><td><code>2D</code></td><td><code>(32, 1536)</code></td><td><code>matriz[fila][columna]</code></td></tr>
              <tr><td><strong>Tensor 3D</strong></td><td>Cubo de datos, por ejemplo secuencias por lotes</td><td><code>3D</code></td><td><code>(8, 32, 1536)</code></td><td><code>tensor[b][t][d]</code></td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout"><strong>Regla de oro:</strong> cantidad de elementos del array = cantidad de dimensiones matemáticas = cantidad de coordenadas de ese único punto. Un embedding individual <strong>nunca es una matriz por sí solo</strong>; se vuelve matriz cuando agrupamos varios vectores, por ejemplo 32 embeddings de 1.536 dimensiones forman una matriz de <code>32 × 1536</code>.</div>

        <h3 class="deep-h3">1.1.3 ¿Por qué N coordenadas siguen siendo un solo punto?</h3>
        <p>Cada posición del vector es una <strong>característica latente</strong> (<em>feature</em>) que actúa como un eje del mapa que ubica un concepto. Por ejemplo, para la palabra “Perro”:</p>

        <div class="deep-grid">
          <div class="deep-card"><span class="mini-tag">1D · 1 eje</span><h4>¿Es un ser vivo?</h4><p><code>[0.9]</code> es un punto sobre una línea recta.</p></div>
          <div class="deep-card"><span class="mini-tag">2D · 2 ejes</span><h4>¿Vivo? ¿Doméstico?</h4><p><code>[0.9, 0.8]</code> es un único punto en una hoja de papel. Los dos números no son dos puntos: son las instrucciones para clavar un solo alfiler.</p></div>
          <div class="deep-card"><span class="mini-tag">3D · 3 ejes</span><h4>¿Vivo? ¿Doméstico? ¿Tamaño?</h4><p><code>[0.9, 0.8, 0.5]</code> es un punto flotando en una habitación, o una flecha desde el origen <code>(0,0,0)</code> hasta ese punto.</p></div>
          <div class="deep-card"><span class="mini-tag">ND · N ejes</span><h4>Cuando se acaban X, Y, Z</h4><p>Se usan subíndices: <code>(x₁, x₂, …, x₁₀₀)</code>. En código es <code>vector[0]</code>, <code>vector[1]</code>, …, <code>vector[99]</code>. Todas esas coordenadas juntas ubican <strong>un solo concepto</strong>.</p></div>
        </div>

        <div class="sim-shell">
          <div class="sim-head">
            <div>
              <span class="sim-kicker">SIMULADOR 01</span>
              <h4>Laboratorio de embeddings y dimensiones</h4>
              <p>Vector vs. matriz, distancia euclidiana vs. coseno, coordenadas paralelas y proyección 200D → 3D.</p>
            </div>
            <a class="btn" href="simuladores/simulador-espacio-vectorial.html" target="_blank" rel="noopener">Abrir aparte ↗</a>
          </div>
          <iframe class="sim-frame" src="simuladores/simulador-espacio-vectorial.html" title="Laboratorio interactivo de embeddings y dimensiones" loading="lazy"></iframe>
          <div class="sim-note">Arrastrá los lienzos 3D para rotar la cámara. Usá las pestañas para cambiar entre vector/matriz, distancias, N dimensiones y proyección.</div>
        </div>
      `
    },
    {
      id: "distancias",
      title: "Distancias y similitud entre vectores",
      sub: "Tres fórmulas que funcionan igual en 3D, 100D o 1.536D: distancia euclidiana, similitud del coseno y producto punto.",
      html: `
        <div class="deep-lead">
          <p>Si tenemos estos tres vectores de 3 dimensiones, a simple vista <strong>A y B están casi pegados</strong> y <strong>C está muy lejos</strong>:</p>
          <div class="vector-example">
            <div class="vector-row"><span class="vector-label">Vector A</span><code>[0.13, 0.25, 0.99]</code></div>
            <div class="vector-row"><span class="vector-label">Vector B</span><code>[0.11, 0.23, 0.90]</code></div>
            <div class="vector-row far"><span class="vector-label">Vector C</span><code>[-3.00, 0.10, 1.00]</code></div>
          </div>
          <p>En motores de búsqueda vectorial como <strong>Qdrant, Pinecone, Milvus o pgvector</strong>, esa cercanía se mide con tres fórmulas que funcionan exactamente igual en 3D, 100D o 1.536D.</p>
        </div>

        <div class="formula-grid">
          <div class="formula-card">
            <span class="mini-tag">1.1.5 · La regla física</span>
            <h4>Distancia euclidiana (L2)</h4>
            <p>Es el teorema de Pitágoras generalizado a N dimensiones. Mide la línea recta entre las puntas de dos vectores.</p>
            <div class="formula no-terms">$$d(A,B) = \\sqrt{\\sum_i (A_i - B_i)^2}$$</div>
            <ul class="deep-list">
              <li><strong>A vs. B:</strong> ≈ <strong>0.094</strong> → muy cercanos, próximo a 0.</li>
              <li><strong>A vs. C:</strong> ≈ <strong>3.133</strong> → muy lejanos.</li>
            </ul>
          </div>

          <div class="formula-card">
            <span class="mini-tag">1.1.6 · El ángulo de la brújula</span>
            <h4>Similitud del coseno</h4>
            <p>En vez de medir la distancia entre puntas, mide el <strong>ángulo θ</strong> entre las dos flechas que salen del origen. Es el estándar en NLP porque captura significado sin importar la longitud del texto.</p>
            <div class="formula no-terms">$$\\cos(\\theta) = \\frac{A \\cdot B}{\\lVert A \\rVert \\, \\lVert B \\rVert}$$</div>
            <ul class="deep-list">
              <li><strong>A vs. B:</strong> ≈ <strong>0.9998</strong> → casi idénticos.</li>
              <li><strong>A vs. C:</strong> ≈ <strong>0.1890</strong> → ángulo muy abierto, baja relación.</li>
              <li>Rango: <strong>−1</strong> (opuestos, 180°) → <strong>0</strong> (ortogonales, 90°) → <strong>1</strong> (misma dirección, 0°).</li>
            </ul>
          </div>
        </div>

        <div class="formula-card wide">
          <span class="mini-tag">1.1.7 · El atajo de alta velocidad</span>
          <h4>Producto punto (dot product)</h4>
          <p>Multiplica coordenada por coordenada y suma todo:</p>
          <div class="formula no-terms">$$A \\cdot B = \\sum_i A_i B_i$$</div>
          <div class="callout"><strong>Truco en producción:</strong> cuando los embeddings están <strong>normalizados</strong> —su magnitud ‖A‖ es exactamente 1—, el denominador del coseno se vuelve <code>1 × 1 = 1</code>. Entonces el producto punto da exactamente el mismo resultado que la similitud del coseno, y ahorra millones de raíces cuadradas y divisiones en la GPU.</div>
        </div>

        <div class="callout">En el <strong>Simulador 01</strong>, pestaña <strong>“Distancias (Euclidiana vs. Coseno)”</strong>, podés mover las coordenadas y ver las dos métricas actualizarse en vivo.</div>
      `
    },
    {
      id: "flujo",
      title: "El flujo real: ingesta vs. consulta",
      sub: "El chunking no vectoriza: solo corta strings. La vectorización ocurre después, en un modelo de embeddings especializado.",
      html: `
        <div class="deep-lead">
          <p>La conversión de texto a embeddings se hace exclusivamente con un <strong>modelo de embeddings especializado</strong>. Es clave separar las dos etapas: el chunking corta el texto en fragmentos (<strong>strings</strong>) y recién después el modelo toma cada fragmento y lo transforma en un vector de <strong>N dimensiones</strong>.</p>
        </div>

        <div class="flow-grid">
          <div class="flow-card">
            <span class="flow-num">1</span>
            <h4>Dividir el documento</h4>
            <p>Un <em>text splitter</em> —por ejemplo <code>RecursiveCharacterTextSplitter</code>— toma un documento largo (PDF, Markdown, código) y lo corta en fragmentos, por ejemplo de <strong>500 tokens</strong> con un <strong>overlap</strong> de <strong>50 tokens</strong> para no cortar ideas por la mitad.</p>
            <p>El resultado es una lista de strings: <code>["chunk 1…", "chunk 2…", "chunk 3…"]</code>.</p>
          </div>

          <div class="flow-card">
            <span class="flow-num">2</span>
            <h4>Vectorizar los chunks</h4>
            <p>La lista se envía en <em>batch</em> a un modelo de embeddings como <code>text-embedding-3-small</code>, <code>bge-m3</code> o <code>nomic-embed-text</code>.</p>
            <p>Cada chunk produce <strong>exactamente un vector</strong>. Si enviamos 10 chunks a un modelo de 1.536 dimensiones, recibimos una <strong>matriz de 10 × 1.536</strong>: son 10 vectores agrupados, no un vector de 10 dimensiones.</p>
          </div>

          <div class="flow-card">
            <span class="flow-num">3</span>
            <h4>Indexar en la base vectorial</h4>
            <p>En Qdrant, Pinecone, pgvector o Milvus se guarda cada registro con tres elementos inseparables:</p>
            <ul class="deep-list">
              <li><code>id</code>: identificador único del fragmento.</li>
              <li><code>vector</code>: el arreglo numérico que se usa para calcular distancias.</li>
              <li><code>payload</code> / <code>metadata</code>: el texto plano original, el nombre del archivo y la página. Los vectores no se pueden “desencriptar” de vuelta a texto.</li>
            </ul>
          </div>

          <div class="flow-card">
            <span class="flow-num">4</span>
            <h4>Consultar y recuperar</h4>
            <p>La pregunta del usuario pasa por el <strong>mismo modelo de embeddings</strong> y se convierte en un <em>query vector</em>. La base calcula la similitud del coseno contra los vectores guardados, recupera los <strong>K más cercanos</strong> y le pasa sus textos originales al LLM para que redacte la respuesta.</p>
          </div>
        </div>

        <div class="callout danger"><strong>CRÍTICO:</strong> se debe usar exactamente el mismo modelo de embeddings en la ingesta y en la consulta. Si cambia el modelo, cambia la geometría del espacio y el recall se cae sin dar ningún error visible.</div>

        <div class="sim-shell">
          <div class="sim-head">
            <div>
              <span class="sim-kicker">SIMULADOR 02</span>
              <h4>Pipeline RAG: inspección de datos paso a paso</h4>
              <p>Documento crudo → chunking → embeddings → vector DB → similitud y retrieval.</p>
            </div>
            <a class="btn" href="simuladores/simulador-pipeline-rag.html" target="_blank" rel="noopener">Abrir aparte ↗</a>
          </div>
          <iframe class="sim-frame" src="simuladores/simulador-pipeline-rag.html" title="Simulador interactivo del pipeline RAG" loading="lazy"></iframe>
          <div class="sim-note">Avanzá con “Siguiente” o hacé click en los nodos del diagrama para ver el input y el output de cada etapa.</div>
        </div>
      `
    },
    {
      id: "modelos",
      title: "Modelo de embeddings vs. LLM generativo",
      sub: "Los dos nacen de Transformer, pero cumplen roles opuestos: representar significado vs. predecir el siguiente token.",
      html: `
        <div class="deep-lead">
          <p>Aunque ambos nacen de la arquitectura <strong>Transformer</strong>, un modelo de embeddings y un LLM generativo no hacen lo mismo. Uno comprime significado en coordenadas; el otro produce texto nuevo token por token.</p>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Característica</th><th>Modelo de embeddings (encoder / bi-encoder)</th><th>LLM generativo (decoder)</th></tr></thead>
            <tbody>
              <tr><td><strong>Objetivo</strong></td><td>Comprimir y representar significado en coordenadas fijas.</td><td>Predecir el siguiente token: generar texto nuevo.</td></tr>
              <tr><td><strong>Cómo lee el texto</strong></td><td><strong>Bidireccional:</strong> lee todo el chunk al mismo tiempo para entender el contexto completo antes del <em>pooling</em>.</td><td><strong>Unidireccional / causal:</strong> lee de izquierda a derecha, palabra por palabra.</td></tr>
              <tr><td><strong>Entrada → salida</strong></td><td><code>String</code> (chunk) → <code>float[N]</code> (por ejemplo, 1.536 números).</td><td><code>String</code> (prompt) → <code>String</code> (respuesta).</td></tr>
              <tr><td><strong>Ejemplos</strong></td><td><code>text-embedding-3-small</code>, <code>text-embedding-004</code>, <code>BAAI/bge-m3</code>, <code>nomic-embed-text</code>.</td><td><code>GPT-4o</code>, <code>Claude 3.5 Sonnet</code>, <code>Gemini 2.5 Pro</code>, <code>Llama 3</code>.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout danger"><strong>Regla de oro en RAG:</strong> nunca se pueden mezclar modelos. Si indexamos los chunks con un modelo de OpenAI de 1.536 dimensiones y convertimos la pregunta con un modelo local como <code>bge-m3</code> de 1.024 dimensiones, no solo falla por la cantidad de coordenadas: incluso si ambos tuvieran 768 dimensiones, cada modelo organiza su “mapa geométrico” de forma totalmente distinta.</div>
      `
    },
    {
      id: "encoders",
      title: "Encoder, bi-encoder y cross-encoder",
      sub: "La diferencia no es el archivo que descargás: es el diseño de la arquitectura y el momento en que se cruzan la pregunta y el documento.",
      html: `
        <div class="deep-lead">
          <p>Son modelos de Machine Learning basados en Transformer, pero entrenados de formas distintas. La confusión suele venir de que llamamos “modelo” al archivo que descargamos; la diferencia entre un <strong>bi-encoder</strong> y un <strong>cross-encoder</strong> está en cómo procesan la información y en qué momento se cruzan la pregunta y el documento.</p>
          <p>Se usan para cosas complementarias dentro de un RAG: el bi-encoder para <strong>recuperar</strong> y el cross-encoder para <strong>reordenar</strong>.</p>
        </div>

        <h3 class="deep-h3">¿Por qué se les llama “encoders”?</h3>
        <p>Vienen de la arquitectura original del Transformer, que tenía dos partes: el <em>encoder</em> que leía y entendía el texto, y el <em>decoder</em> que lo generaba, como GPT.</p>
        <ul class="deep-list">
          <li>El <strong>bi-encoder</strong> usa dos encoders independientes —de ahí “bi”—.</li>
          <li>El <strong>cross-encoder</strong> usa un solo encoder que cruza ambos textos internamente desde la primera capa.</li>
        </ul>
        <p>Por eso, cuando configuramos un RAG, descargamos dos modelos distintos según la fase: un <strong>bi-encoder</strong> para generar y guardar los embeddings, y opcionalmente un <strong>cross-encoder</strong> —normalmente llamado <em>reranker</em>, como <code>bge-reranker-large</code>— para afinar los resultados al final.</p>

        <div class="encoder-grid">
          <article class="encoder-card">
            <span class="mini-tag">Bi-Encoder · “El separado”</span>
            <h4>Dos textos, dos vectores</h4>
            <p>Es un modelo de lenguaje —un encoder como BERT, RoBERTa o un modelo especializado de Hugging Face— al que le pasamos un texto y devuelve un vector numérico. Lo descargamos, por ejemplo <code>bge-small-en-v1.5</code>, y lo ejecutamos localmente o vía API.</p>
            <div class="encoder-row"><span>Cómo funciona</span><p>Toma la pregunta por un lado y el documento por el otro, y los procesa de forma totalmente independiente. El resultado son <strong>dos vectores separados</strong>.</p></div>
            <div class="encoder-row"><span>Cuándo se cruzan</span><p>No se cruzan dentro de la red. La relación se calcula al final con una fórmula rápida: similitud del coseno o producto punto entre los vectores ya terminados.</p></div>
            <div class="encoder-row good"><span>Ventaja</span><p>Como los documentos no necesitan conocer la pregunta de antemano, podés precalcular y guardar millones de vectores. Al preguntar, solo calculás el vector de la query y buscás vecinos cercanos en milisegundos.</p></div>
            <div class="encoder-row trade"><span>Desventaja</span><p>Como pregunta y documento nunca se ven dentro de las capas profundas, se pierden matices sutiles de contexto y relaciones directas entre palabras.</p></div>
          </article>

          <article class="encoder-card cross">
            <span class="mini-tag">Cross-Encoder · “El junto”</span>
            <h4>Dos textos, un score</h4>
            <p>Puede ser la misma familia de modelos, como BERT, pero entrenado con otra tarea y con una capa de salida diferente. En vez de devolver un vector, recibe dos textos juntos y devuelve una única puntuación de relevancia. Está diseñado para reordenar y puntuar con máxima precisión.</p>
            <div class="encoder-row"><span>Cómo funciona</span><p>Mete pregunta y documento juntos en el Transformer, en una sola entrada combinada separada por tokens especiales: <code>[CLS] Pregunta [SEP] Documento [SEP]</code>.</p></div>
            <div class="encoder-row"><span>Cuándo se cruzan</span><p>Desde la primera capa. Cada palabra de la pregunta puede prestar atención a cada palabra del documento. El modelo analiza la interacción directa y devuelve un score de relevancia, por ejemplo entre 0 y 1.</p></div>
            <div class="encoder-row good"><span>Ventaja</span><p>Es mucho más preciso para detectar si un texto realmente responde a la pregunta: entiende negaciones, matices complejos y relaciones lógicas que un bi-encoder puede pasar por alto.</p></div>
            <div class="encoder-row trade"><span>Desventaja</span><p>No se puede precalcular nada. Por cada documento a comparar, el modelo hace una pasada neuronal pesada en tiempo real, O(N). Hacerlo contra un millón de chunks demoraría varios minutos por consulta.</p></div>
          </article>
        </div>

        <h3 class="deep-h3">Tabla comparativa resumida</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Característica</th><th>Bi-Encoder</th><th>Cross-Encoder</th></tr></thead>
            <tbody>
              <tr><td><strong>Estructura de entrada</strong></td><td>Pregunta y documento por separado.</td><td>Pregunta y documento unidos en un solo texto.</td></tr>
              <tr><td><strong>¿Se puede precalcular?</strong></td><td><strong>Sí</strong>: se guardan los vectores en la DB.</td><td><strong>No</strong>: se calcula en caliente por cada consulta.</td></tr>
              <tr><td><strong>Velocidad</strong></td><td>Ultrarrápido, milisegundos.</td><td>Lento, pesado para la GPU.</td></tr>
              <tr><td><strong>Escalabilidad</strong></td><td>Excelente: millones de documentos.</td><td>Pobre: solo sirve para pocos candidatos.</td></tr>
              <tr><td><strong>Precisión</strong></td><td>Buena: captura similitud general.</td><td><strong>Excelente</strong>: captura relevancia exacta.</td></tr>
              <tr><td><strong>Rol en RAG</strong></td><td><strong>Recuperación inicial</strong> (<em>retrieval</em>).</td><td><strong>Reordenamiento</strong> (<em>reranking</em>).</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="deep-h3">El flujo de dos etapas del RAG avanzado</h3>
        <p>Hoy los sistemas de RAG avanzados no eligen uno u otro: combinan ambos para aprovechar lo mejor de los dos mundos.</p>

        <div class="two-stage">
          <div class="stage-card">
            <span class="stage-num">Fase 1</span>
            <h4>Recuperación masiva con bi-encoder</h4>
            <p>La base vectorial busca rápidamente entre un millón de chunks y trae los <strong>top 50 candidatos</strong> más cercanos por similitud de coseno. Es la etapa de velocidad pura.</p>
          </div>
          <div class="stage-arrow">→</div>
          <div class="stage-card">
            <span class="stage-num">Fase 2</span>
            <h4>Reordenamiento fino con cross-encoder</h4>
            <p>Esos 50 candidatos se pasan junto a la pregunta por un cross-encoder. El modelo los evalúa uno por uno, los reordena del más al menos relevante y devuelve los <strong>top 5</strong> para el LLM.</p>
          </div>
        </div>

        <div class="callout"><strong>En una frase:</strong> el bi-encoder decide <em>qué merece ser mirado</em>; el cross-encoder decide <em>qué merece ser leído</em>.</div>
      `
    }
  ]
};
