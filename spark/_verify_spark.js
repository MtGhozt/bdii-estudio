const fs = require('fs');
const vm = require('vm');
const path = require('path');

const h = fs.readFileSync(path.join(__dirname, 'spark_app.html'), 'utf8');
const checks = [
  ["PAPER_SHUFFLE_ID spark", h.includes("PAPER_SHUFFLE_ID = 'spark'")],
  ['no animWebtable', !h.includes('animWebtable')],
  ['housing pipeline parquet', h.includes('output/housing_parquet')],
  ['mode overwrite quoted', h.includes('write.mode("overwrite")')],
  ['tweets pipeline', h.includes('twitter_training.csv') && h.includes('describeTopics')],
  ['Catalyst chain', h.includes('planes físicos')],
  ['no m7 corrupt', !h.includes('partici,')],
  ['no m8 corrupt', !h.includes('</td></tr>ísico')],
  ['Accumulator glossary', h.includes('Accumulator')],
  ['MEMORY_AND_DISK table', h.includes('MEMORY_AND_DISK')],
  ['ventas ejemplo', h.includes('producto_id')],
  ['describe quiz', h.includes('describe() en un DataFrame')],
  ['cheatsheet fundamentos', h.includes('Fundamentos')],
  ['tip bubbles marker', h.includes('/* ---- Glossary tip bubbles ---- */')],
  ['broadcast var vs join', h.includes('broadcast variable') || h.includes('Broadcast variable')],
  ['persist levels table', h.includes('DISK_ONLY')],
];

let fail = 0;
for (const [n, ok] of checks) {
  console.log(ok ? 'OK' : 'FAIL', n);
  if (!ok) fail++;
}

const mStart = h.indexOf('const MODULES = [');
const tip = h.indexOf('/* ---- Glossary tip bubbles ---- */');
const data = h.slice(mStart, tip);
const ctx = {};
vm.createContext(ctx);
try {
  vm.runInContext(
    data +
      '\nglobalThis.c={m:MODULES.length,q:QUIZ.length,cs:CASES.length,g:GLOSSARY.length};',
    ctx
  );
  console.log('PARSED', JSON.stringify(ctx.c));
} catch (e) {
  console.error('FAIL parse', e.message);
  fail++;
}

const keys = [
  'linaje', 'Catalyst', 'Tungsten', 'AQE', 'broadcast', 'Parquet',
  'repartition', 'coalesce', 'persist', 'SparkSession', 'createOrReplaceTempView',
  'CountVectorizer', 'LDA', 'MEMORY_ONLY', 'Accumulator', 'describe()',
  'local[*]', 'MapReduce', 'driver', 'executor', 'text_clean', 'struct',
];
for (const k of keys) {
  if (!h.includes(k)) {
    console.log('MISSING', k);
    fail++;
  }
}

const dwh = fs.readFileSync(path.join(__dirname, '..', 'dwh', 'dwh_app.html'), 'utf8');
const dwhOk = dwh.includes("PAPER_SHUFFLE_ID = 'dwh'");
console.log(dwhOk ? 'OK' : 'FAIL', 'DWH shuffle untouched');
if (!dwhOk) fail++;

process.exit(fail ? 1 : 0);
