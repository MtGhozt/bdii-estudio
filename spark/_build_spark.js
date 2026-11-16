/**
 * Transform the Spark study-desk skeleton → Apache Spark / PySpark content.
 *
 * spark_app.html starts as the Bigtable shell with Spark identity already applied
 * (PAPER_SHUFFLE_ID, hub, storage prefix). Re-running this against an already
 * built file destroys that content unless you restore the skeleton first.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const file = path.join(__dirname, 'spark_app.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes("PAPER_SHUFFLE_ID = 'spark'") && !process.env.SPARK_FORCE_REBUILD) {
  console.error('Refusing: spark_app.html already has PAPER_SHUFFLE_ID spark. Set SPARK_FORCE_REBUILD=1 to rebuild from the skeleton.');
  process.exit(2);
}

function must(oldStr, newStr, label) {
  if (!html.includes(oldStr)) { console.error('FAIL', label); process.exit(1); }
  html = html.replace(oldStr, newStr);
  console.log('OK', label);
}

function mustRe(re, newStr, label) {
  if (!re.test(html)) { console.error('FAIL', label); process.exit(1); }
  html = html.replace(re, newStr);
  console.log('OK', label);
}

function replaceIf(oldStr, newStr, label) {
  if (!html.includes(oldStr)) { console.log('SKIP', label); return; }
  html = html.replace(oldStr, newStr);
  console.log('OK', label);
}

replaceIf('        <small>BDII Estudio · Quiz semana 16 · PySpark</small>',
  '        <small>BDII Estudio · PySpark · resumen + Colab</small>', 'brand');
console.log('OK identity already spark (title, hub, shuffle, storage)');

const inicioStart = html.indexOf('<section id="view-inicio"');
const aprendeStart = html.indexOf('<section id="view-aprende"');
if (inicioStart < 0 || aprendeStart < 0) { console.error('inicio markers'); process.exit(1); }
const inicioHTML = `<section id="view-inicio" class="view active">
  <div class="hero">
    <div>
      <p class="dateline">Apuntes de estudio · Resumen DWH y Apache Spark + notebook <cite>Pyspark</cite> (Colab)</p>
      <h1 class="title">Un motor en <em>memoria</em> que reparte el trabajo</h1>
      <p class="lede">Apache Spark procesa <strong>en memoria</strong> (no escribe disco entre map y reduce), unifica batch, SQL, streaming, ML y grafos, y <strong>no es almacenamiento</strong>: lee HDFS, S3, JDBC, Kafka o Parquet.</p>
      <p>El arco del taller en Colab sale de un solo CPU con pandas, pasa por <code>SparkSession</code> y la regla de oro de ejecución remota, y termina en housing, shuffle y tweets (regex, tokens, LDA), con el puente hacia el lago y el DWH.</p>
      <div class="hero-cta">
        <button class="btn" onclick="go('aprende')">Comenzar a aprender →</button>
        <button class="linklike" onclick="go('quiz')">Ir directo al quiz →</button>
      </div>
      <div class="continue-card" id="continueCard" hidden>
        <div>
          <div class="cc-label">Continuar</div>
          <div class="cc-detail" id="continueDetail"></div>
        </div>
        <button class="btn teal small" id="continueBtn" type="button">Seguir donde lo dejé →</button>
      </div>
    </div>
    <div class="hero-cards">
      <div class="card accent-blue" style="margin:0;"><div class="kicker">Regla de oro</div><p style="margin:6px 0 0; font-size:14.5px;">El procesamiento corre en <strong>otro entorno</strong> que el intérprete Python. Hay que pensar en ejecución remota incluso con <code>local[*]</code>.</p></div>
      <div class="card accent-teal" style="margin:0;"><div class="kicker">La idea central en 1 línea</div><p style="margin:6px 0 0; font-size:14.5px;">Transformaciones <strong>lazy</strong> arman un DAG. La acción dispara un job. El shuffle corta stages. Catalyst lo optimiza.</p></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="n">1 CPU</div><div class="l">pandas y numpy por defecto, un hilo</div></div>
    <div class="stat"><div class="n">local[*]</div><div class="l">un hilo de Spark por núcleo, una JVM</div></div>
    <div class="stat"><div class="n">1 job</div><div class="l">cada acción; stages entre shuffles</div></div>
    <div class="stat"><div class="n">Parquet</div><div class="l">formato columnar preferido en Spark</div></div>
  </div>
  <h2>Arco del notebook en Colab</h2>
  <p class="lede">El mismo hilo del taller, en el orden en que aparece. Las etiquetas <strong>[clase/notebook]</strong>, <strong>[resumen]</strong> y <strong>[didáctico]</strong> marcan de dónde sale cada bloque.</p>
  <ol class="path">
    <li><button class="path-step" onclick="goModule('m0')"><span class="path-n">00</span><span><span class="path-t">Recursos</span><span class="path-d">CPU, RAM, disco. Housing en pandas y una matriz numpy en un solo hilo.</span></span></button></li>
    <li><button class="path-step" onclick="goModule('m1')"><span class="path-n">01</span><span><span class="path-t">Paralelo y distribuido</span><span class="path-d"><code>parallelize</code> en una máquina frente a YARN, Kubernetes o Standalone.</span></span></button></li>
    <li><button class="path-step" onclick="goModule('m4')"><span class="path-n">04</span><span><span class="path-t">SparkSession</span><span class="path-d">findspark, Java 21, regla de oro, y <code>spark.stop()</code> al cerrar.</span></span></button></li>
    <li><button class="path-step" onclick="goModule('m5')"><span class="path-n">05</span><span><span class="path-t">Housing</span><span class="path-d">Schema, select, vista temporal y SQL sobre California housing.</span></span></button></li>
    <li><button class="path-step" onclick="goModule('m7')"><span class="path-n">07</span><span><span class="path-t">Shuffle y escritura</span><span class="path-d"><code>repartition</code> al escribir CSV o Parquet; <code>persist</code> si reutilizas el DataFrame.</span></span></button></li>
    <li><button class="path-step" onclick="goModule('m9')"><span class="path-n">09</span><span><span class="path-t">Tweets y DWH</span><span class="path-d">Schema, regex, Tokenizer, LDA, y el puente lago → DWH / lakehouse.</span></span></button></li>
  </ol>
  <h2>¿Cómo usar esta app?</h2>
  <p class="lede">Tres pasos, en orden. Cada uno prepara el siguiente.</p>
  <ol class="path">
    <li><button class="path-step" onclick="go('aprende')"><span class="path-n">01</span><span><span class="path-t">Aprende</span><span class="path-d">10 módulos (m0–m9). Hover en términos del glosario.</span></span></button></li>
    <li><button class="path-step" onclick="go('animaciones')"><span class="path-n">02</span><span><span class="path-t">Animaciones</span><span class="path-d">CPU y RAM, arquitectura, lazy, shuffle, Catalyst y tokens.</span></span></button></li>
    <li><button class="path-step" onclick="go('quiz')"><span class="path-n">03</span><span><span class="path-t">Quiz y casos</span><span class="path-d">Preguntas del resumen, Colab y trampas de Learning Spark / Fundamentals, más casos.</span></span></button></li>
  </ol>
</section>
`;
html = html.slice(0, inicioStart) + inicioHTML + html.slice(aprendeStart);
console.log('OK inicio');

const mStart = html.indexOf('const MODULES = [');
const tipStart = html.indexOf('/* ---- Glossary tip bubbles ---- */');
if (mStart < 0 || tipStart < 0) { console.error('markers'); process.exit(1); }
const data = fs.readFileSync(path.join(__dirname, '_spark_data.js'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(data + '\nglobalThis.__counts = { m: MODULES.length, q: QUIZ.length, cs: CASES.length, g: GLOSSARY.length, ids: MODULES.map(function(x){ return x.id; }).join(",") };', ctx);
console.log('DATA', JSON.stringify(ctx.__counts));
if (ctx.__counts.m !== 10 || ctx.__counts.ids !== 'm0,m1,m2,m3,m4,m5,m6,m7,m8,m9') {
  console.error('FAIL module ids'); process.exit(1);
}
if (ctx.__counts.q < 32 || ctx.__counts.q > 50) { console.error('FAIL quiz count', ctx.__counts.q); process.exit(1); }
if (ctx.__counts.cs < 6) { console.error('FAIL cases'); process.exit(1); }
if (ctx.__counts.g < 30) { console.error('FAIL glossary'); process.exit(1); }
html = html.slice(0, mStart) + data + '\n' + html.slice(tipStart);
console.log('OK data injected');

const aliasStart = html.indexOf('const aliases = {');
const aliasEnd = html.indexOf('Object.keys(aliases)', aliasStart);
if (aliasStart > 0 && aliasEnd > aliasStart) {
  const newAliases = `const aliases = {
    'spark':'Apache Spark', 'apache spark':'Apache Spark', 'pyspark':'PySpark',
    'mapreduce':'MapReduce', 'map reduce':'MapReduce',
    'rdd':'RDD', 'dataframe':'DataFrame', 'dataframes':'DataFrame', 'dataset':'Dataset',
    'driver':'Driver', 'executor':'Executor', 'executors':'Executor',
    'cluster manager':'Cluster manager', 'yarn':'Cluster manager',
    'sparksession':'SparkSession', 'spark session':'SparkSession',
    'regla de oro':'Regla de oro',
    'transformacion':'Transformación', 'transformación':'Transformación',
    'accion':'Acción', 'acción':'Acción',
    'narrow':'Narrow', 'wide':'Wide', 'shuffle':'Shuffle',
    'stage':'Stage', 'stages':'Stage', 'job':'Job', 'task':'Task', 'tasks':'Task',
    'dag':'DAG', 'linaje':'Linaje', 'lineage':'Linaje',
    'repartition':'repartition', 'coalesce':'coalesce',
    'cache':'cache', 'persist':'persist',
    'catalyst':'Catalyst', 'tungsten':'Tungsten', 'aqe':'AQE',
    'broadcast':'Broadcast join', 'broadcast join':'Broadcast join',
    'parquet':'Parquet', 'delta':'Delta Lake', 'delta lake':'Delta Lake',
    'tokenizer':'Tokenizer', 'stopwords':'StopWordsRemover', 'stopwordsremover':'StopWordsRemover',
    'lda':'LDA', 'lakehouse':'Lakehouse',
    'udf':'UDF', 'collect':'collect', 'explain':'explain',
    'etl':'ETL', 'elt':'ELT', 'inmon':'Inmon', 'kimball':'Kimball',
    'spark core':'Spark Core', 'spark sql':'Spark SQL', 'graphx':'GraphX', 'sparkml':'SparkML',
    'structured streaming':'Structured Streaming',
    'predicate pushdown':'Predicate pushdown', 'pushdown':'Predicate pushdown',
    'cpu':'CPU', 'ram':'RAM',
    'procesamiento paralelo':'Procesamiento paralelo', 'procesamiento distribuido':'Procesamiento distribuido'
  };
  `;
  html = html.slice(0, aliasStart) + newAliases + html.slice(aliasEnd);
  console.log('OK aliases');
}

mustRe(/const MODULE_ANIMS = \{[\s\S]*?const QUIZ_MODULE_HINT = \{[\s\S]*?\};\r?\n/,
`const MODULE_ANIMS = {
  m0: [{id:'anim-cpu', label:'CPU, RAM y límites'}],
  m1: [{id:'anim-cpu', label:'Un CPU vs muchos núcleos'}],
  m3: [{id:'anim-arch', label:'Driver, executors, CM'}],
  m6: [{id:'anim-lazy', label:'Lazy: plan y acción'}],
  m7: [{id:'anim-shuffle', label:'Narrow, wide y shuffle'}],
  m8: [{id:'anim-pipeline', label:'Catalyst, AQE, Parquet'}],
  m9: [{id:'anim-tokens', label:'Tweets, tokens y LDA'}]
};
const QUIZ_MODULE_HINT = {
  'CPU':'m0', 'Paralelo':'m1', 'Spark':'m2', 'Stack':'m3',
  'Sesion':'m4', 'Quirk':'m4', 'DF':'m5', 'Lazy':'m6',
  'Shuffle':'m7', 'Opt':'m8', 'Texto':'m9', 'DWH':'m9'
};
`, 'MODULE_ANIMS');

replaceIf('animWebtable.init(); animLocate.init(); animServe.init(); animRecovery.init(); animRead.init();',
  'animCpu.init(); animArch.init(); animLazy.init(); animShuffle.init(); animPipeline.init(); animTokens.init();', 'initAnims');
if (!html.includes('animCpu.init()')) {
  console.error('FAIL initAnims: animCpu.init missing');
  process.exit(1);
}

const animViewStart = html.indexOf('<section id="view-animaciones"');
const animViewEnd = html.indexOf('<section id="view-quiz"');
const animHTML = `<section id="view-animaciones" class="view">
  <span class="kicker">Laboratorio visual</span>
  <h2>Animaciones interactivas</h2>
  <p class="lede">Del un solo CPU al DAG, el shuffle, Catalyst y la limpieza de tweets. Cada animación tiene play, paso y narrador.</p>
  <div class="card accent-blue" id="anim-cpu"><h3>1 · CPU, RAM y los dos límites</h3>
    <p style="font-size:14px;">Pandas y numpy en un hilo. La RAM guarda datos e intermedios; el tiempo es el otro techo.</p>
    <div class="controls"><button class="btn small" onclick="animCpu.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animCpu.play()">Reproducir</button><button class="btn small ghost" onclick="animCpu.reset()">Reiniciar</button></div>
    <figure><svg id="svgGraph" viewBox="0 0 720 360" role="img"></svg><figcaption>Recursos · <span id="graphCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m0')">Leer en Aprende → Módulo 0</button></p></div>
  <div class="card accent-purple" id="anim-arch"><h3>2 · Driver, cluster manager y executors</h3>
    <p style="font-size:14px;">El driver arma el DAG. El CM asigna. Los executors corren tasks y guardan cache. <code>local[*]</code>, client o cluster.</p>
    <div class="controls"><button class="btn small" onclick="animArch.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animArch.play()">Reproducir</button><button class="btn small ghost" onclick="animArch.reset()">Reiniciar</button></div>
    <figure><svg id="svgCheck" viewBox="0 0 720 360" role="img"></svg><figcaption>Arquitectura · <span id="checkCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m3')">Leer en Aprende → Módulo 3</button></p></div>
  <div class="card accent-teal" id="anim-lazy"><h3>3 · Lazy: el plan espera a la acción</h3>
    <p style="font-size:14px;"><code>select</code> y <code>filter</code> no ejecutan. <code>explain</code> muestra el plan. <code>show</code>, <code>count</code> o <code>write</code> disparan el job.</p>
    <div class="controls"><button class="btn small" onclick="animLazy.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animLazy.play()">Reproducir</button><button class="btn small ghost" onclick="animLazy.reset()">Reiniciar</button></div>
    <figure><svg id="svgEnemy" viewBox="0 0 720 360" role="img"></svg><figcaption>Lazy · <span id="enemyCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m6')">Leer en Aprende → Módulo 6</button></p></div>
  <div class="card accent-orange" id="anim-shuffle"><h3>4 · Narrow, wide, stages y cache</h3>
    <p style="font-size:14px;">El shuffle es la frontera cara. <code>repartition</code> lo paga; <code>coalesce</code> solo reduce particiones. <code>persist</code> si hay varias acciones.</p>
    <div class="controls"><button class="btn small" onclick="animShuffle.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animShuffle.play()">Reproducir</button><button class="btn small ghost" onclick="animShuffle.reset()">Reiniciar</button></div>
    <figure><svg id="svgZookie" viewBox="0 0 720 360" role="img"></svg><figcaption>Shuffle · <span id="zookieCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m7')">Leer en Aprende → Módulo 7</button></p></div>
  <div class="card accent-gold" id="anim-pipeline"><h3>5 · Catalyst, Tungsten, AQE y Parquet</h3>
    <p style="font-size:14px;">Pushdown y pruning, ejecución off-heap, reoptimización en runtime, y broadcast cuando la dimensión es chica.</p>
    <div class="controls"><button class="btn small" onclick="animPipeline.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animPipeline.play()">Reproducir</button><button class="btn small ghost" onclick="animPipeline.reset()">Reiniciar</button></div>
    <figure><svg id="svgArch" viewBox="0 0 720 360" role="img"></svg><figcaption>Optimización · <span id="archCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m8')">Leer en Aprende → Módulo 8</button></p></div>
  <div class="card accent-pink" id="anim-tokens"><h3>6 · Tweets: regex, tokens y LDA</h3>
    <p style="font-size:14px;">Schema explícito, limpieza a <code>text_clean</code>, Tokenizer, stopwords, explode y el trío CountVectorizer → IDF → LDA.</p>
    <div class="controls"><button class="btn small" onclick="animTokens.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animTokens.play()">Reproducir</button><button class="btn small ghost" onclick="animTokens.reset()">Reiniciar</button></div>
    <figure><svg id="svgTok" viewBox="0 0 720 360" role="img"></svg><figcaption>Texto · <span id="tokCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m9')">Leer en Aprende → Módulo 9</button></p></div>
</section>
`;
html = html.slice(0, animViewStart) + animHTML + html.slice(animViewEnd);
console.log('OK anim HTML');

let animJsStart = html.indexOf('const animWebtable = ');
if (animJsStart < 0) animJsStart = html.indexOf('const animCpu = ');
const bootMarker = "renderModuleNav(); renderModule(); renderCases(); renderGlossary(''); updateProgress(); updateContinueCard();";
const bootStart = html.indexOf(bootMarker);
if (animJsStart < 0 || bootStart < 0) { console.error('anim js markers', { animJsStart, bootStart }); process.exit(1); }
const animJs = fs.readFileSync(path.join(__dirname, '_spark_anims.js'), 'utf8');
html = html.slice(0, animJsStart) + animJs + '\n' + html.slice(bootStart);
console.log('OK anim JS');

replaceIf('Sigue los módulos en orden. Los términos del glosario aparecen con <strong>subrayado punteado</strong>: hover o tap abre la burbuja. Los <strong>Trade-off</strong> son los que más caen en el quiz.',
  'Sigue los módulos en orden (m0–m9). Fuente: resumen DWH/Spark y el notebook de Colab. Las etiquetas <strong>[resumen]</strong>, <strong>[clase/notebook]</strong> y <strong>[didáctico]</strong> dicen de dónde sale cada bloque. Los términos subrayados abren el glosario.',
  'aprende lede');
replaceIf('Herramienta de estudio sobre "Bigtable: A Distributed Storage System for Structured Data" (OSDI 2006). Leer → animar → practicar.',
  'Herramienta de estudio sobre Apache Spark y PySpark (resumen DWH/Spark y notebook de Colab). Leer → animar → practicar.',
  'footer');
replaceIf('placeholder="Filtra por término o definición (ej: bloom, compaction, tablet)…"',
  'placeholder="Filtra por término (ej: shuffle, Catalyst, linaje)…"',
  'glossary placeholder');
replaceIf('Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: bloom, compaction, Boxwood).',
  'Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: shuffle, Catalyst, linaje).',
  'glossary lede');
replaceIf('>Glosario bilingüe<', '>Glosario<', 'glossary title');
replaceIf('Módulos 0/9', 'Módulos 0/10', 'progress');
replaceIf('// Deep-link hash: #aprende/m5 or #animaciones/anim-read or #quiz',
  '// Deep-link hash: #aprende/m6 or #animaciones/anim-lazy or #quiz',
  'deeplink');

if (html.includes('animWebtable.init')) { console.error('FAIL animWebtable.init still present'); process.exit(1); }

fs.writeFileSync(file, html, 'utf8');
console.log('Wrote', file, Buffer.byteLength(html));
