/**
 * Transform the DWH Bigtable skeleton → Data Warehouse Study-desk (BDII).
 *
 * The skeleton already has PAPER_SHUFFLE_ID = 'dwh', hub ../index.html and the
 * dwh- storage prefix. Running this again replaces inicio, data, animaciones
 * and aliases. Set DWH_FORCE_REBUILD=1 to allow that overwrite.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'dwh_app.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes("PAPER_SHUFFLE_ID = 'dwh'") && !process.env.DWH_FORCE_REBUILD) {
  console.error('Refusing: dwh_app.html already built. Set DWH_FORCE_REBUILD=1 if you really mean to rebuild.');
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

replaceIf('Bigtable · BDII Estudio — Distributed Storage for Structured Data',
  'Data Warehouse · BDII Estudio — Kimball / OLAP / SCD', 'title');
replaceIf('href="../../index.html"', 'href="../index.html"', 'hub');
replaceIf('<div class="logo">B</div><div><div>Bigtable</div>\n        <small>BDII Estudio · Distributed Storage for Structured Data</small></div></div>',
  '<div class="logo">W</div><div><div>Data Warehouse</div>\n        <small>BDII Estudio · Quiz semana 16 · DWH</small></div></div>', 'brand');
replaceIf("const PAPER_SHUFFLE_ID = 'bigtable';", "const PAPER_SHUFFLE_ID = 'dwh';", 'shuffle id');
html = html.replace(/bigtable-/g, 'dwh-');
html = html.replace(/Dominas Bigtable/g, 'Dominas Data Warehouse');
html = html.replace(/Aprende Bigtable/g, 'Aprende Data Warehouse');
console.log('OK storage prefix + strings');

const inicioStart = html.indexOf('<section id="view-inicio"');
const aprendeStart = html.indexOf('<section id="view-aprende"');
if (inicioStart < 0 || aprendeStart < 0) { console.error('inicio markers'); process.exit(1); }
const inicioHTML = `<section id="view-inicio" class="view active">
  <div class="hero">
    <div>
      <p class="dateline">Apuntes · Inmon/Kimball · DDIA Kleppmann Ch.3 (warehouse) · quiz semana 16</p>
      <h1 class="title">Una sola <em>verdad histórica</em> para analizar</h1>
      <p class="lede">Un <strong>Data Warehouse</strong> integra las fuentes operacionales, las organiza por sujeto de negocio y conserva el <strong>historial</strong>. Responde cuánto vendimos por región el trimestre pasado, no cuál es el saldo de esta caja ahora mismo.</p>
      <p>Recorre Inmon, OLTP/OLAP, staging → marts, ETL/ELT, grano y estrella, SCD y bus matrix, OLAP — con citas de <cite>Designing Data-Intensive Applications</cite> (Kleppmann, Ch.3) etiquetadas <code>[DDIA]</code>, más el caso retail.</p>
      <div class="hero-cta">
        <button class="btn" onclick="go('aprende')">Comenzar a aprender →</button>
        <button class="linklike" onclick="go('quiz')">Ir directo al quiz →</button>
      </div>
      <div class="continue-card" id="continueCard" hidden>
        <div>
          <div class="cc-label">Continuar</div>
          <div class="cc-detail" id="continueDetail"></div>
        </div>
        <button class="btn teal" id="continueBtn" type="button">Seguir donde lo dejé →</button>
      </div>
    </div>
    <div class="hero-cards">
      <div class="card accent-blue" style="margin:0;"><div class="kicker">No es la caja</div><p style="margin:6px 0 0; font-size:14.5px;">El POS sigue siendo <strong>OLTP</strong>. El DWH se carga por lotes, no compite con el cobro de cada ticket.</p></div>
      <div class="card accent-teal" style="margin:0;"><div class="kicker">La idea central en 1 línea</div><p style="margin:6px 0 0; font-size:14.5px;">Fuentes → <strong>staging</strong> → DWH integrado → <strong>marts</strong> → BI. El grano de <code>fact_ventas</code> es una línea de ticket.</p></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="n">4</div><div class="l">rasgos de Inmon: sujeto, integrado, tiempo, no volátil</div></div>
    <div class="stat"><div class="n">4</div><div class="l">pasos Kimball: proceso, grano, dims, hechos</div></div>
    <div class="stat"><div class="n">SCD2</div><div class="l">nueva fila; el hecho no se reescribe</div></div>
    <div class="stat"><div class="n">SQL</div><div class="l">estrella: pocos joins, SUM por mes y categoría</div></div>
  </div>
  <h2>¿Cómo usar esta app?</h2>
  <p class="lede">Tres pasos, en orden. Cada uno prepara el siguiente.</p>
  <ol class="path">
    <li><button class="path-step" onclick="go('aprende')"><span class="path-n">01</span><span><span class="path-t">Aprende</span><span class="path-d">9 módulos (m0–m8): Inmon, arquitectura, Kimball, SCD y OLAP. Hover en términos del glosario.</span></span></button></li>
    <li><button class="path-step" onclick="go('animaciones')"><span class="path-n">02</span><span><span class="path-t">Animaciones</span><span class="path-d">Pipeline, OLTP/OLAP, estrella, SCD Type 2, cubo OLAP y ETL vs ELT.</span></span></button></li>
    <li><button class="path-step" onclick="go('quiz')"><span class="path-n">03</span><span><span class="path-t">Quiz y casos</span><span class="path-d">Preguntas de examen y casos retail (grano, bus matrix, inventario semi-aditivo).</span></span></button></li>
  </ol>
</section>
`;
html = html.slice(0, inicioStart) + inicioHTML + html.slice(aprendeStart);
console.log('OK inicio');

const mStart = html.indexOf('const MODULES = [');
const tipStart = html.indexOf('/* ---- Glossary tip bubbles ---- */');
if (mStart < 0 || tipStart < 0) { console.error('markers'); process.exit(1); }
const data = fs.readFileSync(path.join(__dirname, '_dwh_data.js'), 'utf8');
html = html.slice(0, mStart) + data + '\n' + html.slice(tipStart);
console.log('OK data injected');

const aliasStart = html.indexOf('const aliases = {');
const aliasEnd = html.indexOf('Object.keys(aliases)', aliasStart);
if (aliasStart > 0 && aliasEnd > aliasStart) {
  const newAliases = `const aliases = {
    'data warehouse':'Data Warehouse', 'dwh':'Data Warehouse', 'almacén de datos':'Data Warehouse', 'almacen de datos':'Data Warehouse',
    'oltp':'OLTP', 'olap':'OLAP',
    'inmon':'Inmon', 'kimball':'Kimball',
    'staging':'Staging', 'data mart':'Data mart', 'mart':'Data mart',
    'etl':'ETL', 'elt':'ELT',
    'grano':'Grano', 'granularidad':'Grano', 'grain':'Grano',
    'estrella':'Esquema estrella', 'esquema estrella':'Esquema estrella',
    'copo de nieve':'Copo de nieve', 'snowflake':'Copo de nieve',
    'galaxia':'Galaxia', 'constelación':'Galaxia', 'constelacion':'Galaxia',
    'aditiva':'Medida aditiva', 'semi-aditiva':'Medida semi-aditiva', 'no aditiva':'Medida no aditiva',
    'factless':'Factless', 'snapshot periódico':'Snapshot periódico', 'snapshot periodico':'Snapshot periódico',
    'surrogate':'Surrogate key', 'surrogate key':'Surrogate key', 'clave subrogada':'Surrogate key',
    'clave natural':'Clave natural',
    'conformada':'Dimensión conformada', 'conformed':'Dimensión conformada',
    'degenerada':'Dimensión degenerada',
    'junk':'Junk dimension', 'junk dimension':'Junk dimension',
    'role-playing':'Role-playing', 'role playing':'Role-playing',
    'scd':'SCD Type 2', 'scd type 2':'SCD Type 2', 'scd type 1':'SCD Type 1', 'scd type 3':'SCD Type 3',
    'bus matrix':'Bus Matrix', 'matriz del bus':'Bus Matrix',
    'roll-up':'Roll-up', 'rollup':'Roll-up', 'drill-up':'Roll-up', 'drill-down':'Drill-down', 'drill down':'Drill-down',
    'slice':'Slice', 'dice':'Dice', 'pivot':'Pivot',
    'molap':'MOLAP', 'rolap':'ROLAP', 'holap':'HOLAP',
    'lakehouse':'Lakehouse', 'data lake':'Data lake',
    'medallón':'Medallón', 'medallon':'Medallón', 'mpp':'MPP',
    'dimensión fecha':'Dimensión fecha', 'dimension fecha':'Dimensión fecha',
    'no volátil':'No volátil', 'no volatil':'No volátil',
    'orientado al sujeto':'Orientado al sujeto',
    'metadatos':'Metadatos técnicos', 'metadatos técnicos':'Metadatos técnicos', 'metadatos tecnicos':'Metadatos técnicos',
    'metadatos de negocio':'Metadatos de negocio', 'metadatos operacionales':'Metadatos operacionales'
  };
  `;
  html = html.slice(0, aliasStart) + newAliases + html.slice(aliasEnd);
  console.log('OK aliases');
} else {
  console.error('FAIL aliases'); process.exit(1);
}

mustRe(/const MODULE_ANIMS = \{[\s\S]*?const QUIZ_MODULE_HINT = \{[\s\S]*?\};\r?\n/,
`const MODULE_ANIMS = {
  m0: [{id:'anim-oltp-olap', label:'OLTP vs OLAP'}],
  m1: [{id:'anim-oltp-olap', label:'OLTP vs OLAP'}],
  m2: [{id:'anim-pipeline', label:'Pipeline staging → BI'}],
  m3: [{id:'anim-etl-elt', label:'ETL vs ELT'}],
  m4: [{id:'anim-star', label:'Grano en la estrella'}],
  m5: [{id:'anim-star', label:'Esquema estrella'}],
  m6: [{id:'anim-star', label:'Hecho y dimensiones'}],
  m7: [{id:'anim-scd2', label:'SCD Type 2'}],
  m8: [{id:'anim-cube', label:'Operaciones OLAP'}]
};
const QUIZ_MODULE_HINT = {
  'Inmon':'m1', 'OLTP/OLAP':'m1', 'Arquitectura':'m2', 'ETL/ELT':'m3', 'Kimball':'m3',
  'Grain':'m4', 'Estrella':'m5', 'Medidas':'m6', 'SCD':'m7', 'OLAP':'m8', 'Lake':'m8',
  'DDIA':'m0', 'trade-off':'m5'
};
`, 'MODULE_ANIMS');

replaceIf('animWebtable.init(); animLocate.init(); animServe.init(); animRecovery.init(); animRead.init();',
  'animPipeline.init(); animOltpOlap.init(); animStar.init(); animScd2.init(); animCube.init(); animEtlElt.init();', 'initAnims');
if (!html.includes('animPipeline.init()')) {
  console.error('FAIL initAnims missing after replace');
  process.exit(1);
}

const animViewStart = html.indexOf('<section id="view-animaciones"');
const animViewEnd = html.indexOf('<section id="view-quiz"');
if (animViewStart < 0 || animViewEnd < 0) { console.error('anim html markers'); process.exit(1); }
const animHTML = `<section id="view-animaciones" class="view">
  <span class="kicker">Laboratorio visual</span>
  <h2>Animaciones interactivas</h2>
  <p class="lede">Pipeline del almacén, OLTP frente a OLAP, estrella, SCD Type 2, cubo y ETL/ELT. Cada animación tiene play/paso y narrador.</p>
  <div class="card accent-blue" id="anim-pipeline"><h3>1 · Pipeline: fuentes, staging, DWH, marts, BI</h3>
    <p style="font-size:14px;">El lote sale del POS, aterriza crudo, se integra y recién entonces alimenta el dashboard.</p>
    <div class="controls"><button class="btn small" onclick="animPipeline.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animPipeline.play()">Reproducir</button><button class="btn small ghost" onclick="animPipeline.reset()">Reiniciar</button></div>
    <figure><svg id="svgGraph" viewBox="0 0 720 340" role="img" aria-label="Pipeline DWH"></svg><figcaption>Pipeline · <span id="graphCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m2')">Leer en Aprende → Módulo 2</button></p></div>
  <div class="card accent-purple" id="anim-oltp-olap"><h3>2 · OLTP de caja frente a OLAP</h3>
    <p style="font-size:14px;">Stock de un SKU ahora mismo, contra ventas de categoría en el trimestre.</p>
    <div class="controls"><button class="btn small" onclick="animOltpOlap.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animOltpOlap.play()">Reproducir</button><button class="btn small ghost" onclick="animOltpOlap.reset()">Reiniciar</button></div>
    <figure><svg id="svgCheck" viewBox="0 0 720 360" role="img" aria-label="OLTP vs OLAP"></svg><figcaption>OLTP / OLAP · <span id="checkCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m1')">Leer en Aprende → Módulo 1</button></p></div>
  <div class="card accent-teal" id="anim-star"><h3>3 · Estrella de FactVentas</h3>
    <p style="font-size:14px;">Hecho al centro, dimensiones alrededor y <code>ticket_id</code> degenerado.</p>
    <div class="controls"><button class="btn small" onclick="animStar.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animStar.play()">Reproducir</button><button class="btn small ghost" onclick="animStar.reset()">Reiniciar</button></div>
    <figure><svg id="svgEnemy" viewBox="0 0 720 300" role="img" aria-label="Esquema estrella"></svg><figcaption>Estrella · <span id="enemyCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m5')">Leer en Aprende → Módulo 5</button></p></div>
  <div class="card accent-orange" id="anim-scd2"><h3>4 · SCD Type 2: Ana pasa a VIP</h3>
    <p style="font-size:14px;">Nueva fila con vigencia. Las ventas viejas siguen en la surrogate anterior.</p>
    <div class="controls"><button class="btn small" onclick="animScd2.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animScd2.play()">Reproducir</button><button class="btn small ghost" onclick="animScd2.reset()">Reiniciar</button></div>
    <figure><svg id="svgZookie" viewBox="0 0 720 340" role="img" aria-label="SCD Type 2"></svg><figcaption>SCD 2 · <span id="zookieCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m7')">Leer en Aprende → Módulo 7</button></p></div>
  <div class="card accent-gold" id="anim-cube"><h3>5 · Operaciones OLAP</h3>
    <p style="font-size:14px;">Roll-up, drill-down, slice, dice y pivot sobre el cubo de ventas.</p>
    <div class="controls"><button class="btn small" onclick="animCube.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animCube.play()">Reproducir</button><button class="btn small ghost" onclick="animCube.reset()">Reiniciar</button></div>
    <figure><svg id="svgArch" viewBox="0 0 720 360" role="img" aria-label="Operaciones OLAP"></svg><figcaption>Cubo · <span id="archCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m8')">Leer en Aprende → Módulo 8</button></p></div>
  <div class="card accent-pink" id="anim-etl-elt"><h3>6 · ETL frente a ELT</h3>
    <p style="font-size:14px;">Transformar antes de cargar, o cargar crudo y transformar con SQL en el destino.</p>
    <div class="controls"><button class="btn small" onclick="animEtlElt.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animEtlElt.play()">Reproducir</button><button class="btn small ghost" onclick="animEtlElt.reset()">Reiniciar</button></div>
    <figure><svg id="svgEtl" viewBox="0 0 720 340" role="img" aria-label="ETL vs ELT"></svg><figcaption>ETL / ELT · <span id="etlCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m3')">Leer en Aprende → Módulo 3</button></p></div>
</section>
`;
html = html.slice(0, animViewStart) + animHTML + html.slice(animViewEnd);
console.log('OK anim HTML');

let animJsStart = html.indexOf('const animWebtable = ');
if (animJsStart < 0) animJsStart = html.indexOf('const animPipeline = ');
const bootMarker = "renderModuleNav(); renderModule(); renderCases(); renderGlossary(''); updateProgress(); updateContinueCard();";
const bootStart = html.indexOf(bootMarker);
if (animJsStart < 0 || bootStart < 0) { console.error('anim js markers', { animJsStart, bootStart }); process.exit(1); }
const animJs = fs.readFileSync(path.join(__dirname, '_dwh_anims.js'), 'utf8');
html = html.slice(0, animJsStart) + animJs + '\n' + html.slice(bootStart);
console.log('OK anim JS');

html = html.replace('Aprende Bigtable desde cero', 'Aprende Data Warehouse desde cero');
html = html.replace(
  '<p class="lede">Sigue los módulos en orden. Los términos del glosario aparecen con <strong>subrayado punteado</strong>: hover o tap abre la burbuja. Los <strong>Trade-off</strong> son los que más caen en el quiz.</p>',
  '<p class="lede">Sigue los módulos en orden. Fuente: apuntes de Data Warehouse (Inmon, Kimball, grano, SCD, OLAP) y el caso retail. Los términos con <strong>subrayado punteado</strong> abren el glosario. Los <strong>Trade-off</strong> son los que más caen en el quiz.</p>'
);
html = html.replace(
  'Herramienta de estudio sobre "Bigtable: A Distributed Storage System for Structured Data" (OSDI 2006). Leer → animar → practicar.',
  'Herramienta de estudio sobre Data Warehouse (Inmon, Kimball, SCD y OLAP · caso retail). Leer → animar → practicar.'
);
html = html.replace('>Glosario bilingüe<', '>Glosario<');
html = html.replace(
  'placeholder="Filtra por término o definición (ej: bloom, compaction, tablet)…"',
  'placeholder="Filtra por término o definición (ej: grano, SCD, estrella, OLAP)…"'
);
html = html.replace(
  'Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: bloom, compaction, Boxwood).',
  'Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: grano, SCD, estrella, OLAP).'
);
console.log('OK aprende titles');

if (html.includes('animWebtable')) { console.error('FAIL leftover animWebtable'); process.exit(1); }
const ids = [...html.matchAll(/\{ id:'(m\d+)'/g)].map(function(m){ return m[1]; });
console.log('modules', ids.join(','));

fs.writeFileSync(file, html, 'utf8');
console.log('Wrote', file, Buffer.byteLength(html));
