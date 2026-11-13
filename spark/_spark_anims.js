const animCpu = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Un solo CPU.</b> R y Python, por defecto, usan <strong>un núcleo</strong> aunque la máquina tenga más. El taller lo muestra con pandas (housing) y numpy 800×800.',
  '<b>Paso 2/4 · RAM.</b> Capacidad de procesamiento (CPU/GPU) y de memoria: la RAM guarda datos e <strong>intermedios</strong>. Si el dataset no cabe, el cómputo se frena.',
  '<b>Paso 3/4 · Tiempo.</b> El otro límite es la latencia: hay cargas que piden respuesta casi en tiempo real y un solo hilo no llega.',
  '<b>Paso 4/4 · Escalar.</b> Spark (y el MPP de un DWH) atacan el mismo problema: muchas filas y consultas pesadas, repartidas en núcleos y, en clúster, en máquinas. ✓'
],
titles:['1/4 un CPU','2/4 RAM','3/4 tiempo','4/4 escalar ✓'],
init(){ this.svg=$('#svgGraph'); svgDefs(this.svg);
  this.ch=animChrome('svgGraph',4,'Pulsa <b>Reproducir</b>: CPU, RAM y límites.');
  this.playBtn=document.querySelector('[onclick="animCpu.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#graphCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(160,90,'pandas / numpy',cGold,cGold));
  s.appendChild(nodeBox(400,90,this.idx>=1?'RAM llena':'1 CPU',this.idx>=1?cOrange:cDim,this.idx>=1?cOrange:cDim));
  s.appendChild(nodeBox(160,210,'disco',cPurple,cPurple));
  s.appendChild(nodeBox(520,210,'Spark / MPP',cTeal,cTeal));
  arrow(s,226,90,334,90,cGold,this.idx>=1?'presión':'1 hilo');
  arrow(s,400,112,190,188,cPurple,this.idx>=1?'a disco':'');
  arrow(s,466,112,500,188,cTeal,this.idx>=3?'reparte':'');
  const t=el('text',{x:360,y:300,'text-anchor':'middle',class:'tedge'});
  t.textContent=this.idx>=3?'muchas filas: paralelismo y clúster':'por defecto: un solo núcleo';
  s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[1,2],[1],[3]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Recursos.</b> Un CPU por defecto; los límites son RAM y tiempo. Spark reparte el trabajo.',this.cap,'CPU, RAM y límites ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: CPU, RAM y límites.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animArch = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Driver.</b> Proceso principal: crea la <strong>SparkSession</strong>, arma el <strong>DAG</strong> y parte el trabajo en stages y tasks.',
  '<b>Paso 2/5 · Cluster manager.</b> Asigna recursos. Standalone, YARN o Kubernetes (Mesos está deprecado).',
  '<b>Paso 3/5 · Executors.</b> Corren las tasks, guardan <strong>cache</strong> local y reportan al driver.',
  '<b>Paso 4/5 · local.</b> <code>local[*]</code> mete todo en una JVM: un hilo por núcleo. Sirve para el taller, no es un clúster.',
  '<b>Paso 5/5 · client vs cluster.</b> En <strong>client</strong> el driver vive en tu notebook. En <strong>cluster</strong> el driver vive dentro del clúster. ✓'
],
titles:['1/5 driver','2/5 CM','3/5 executors','4/5 local[*]','5/5 deploy ✓'],
init(){ this.svg=$('#svgCheck'); svgDefs(this.svg);
  this.ch=animChrome('svgCheck',5,'Pulsa <b>Reproducir</b>: driver, executors y modos.');
  this.playBtn=document.querySelector('[onclick="animArch.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#checkCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  const driverLbl=this.idx>=4?'driver (en clúster)':'Driver';
  s.appendChild(nodeBox(360,48,this.idx===3?'local[*] JVM':driverLbl,cBlue,cBlue));
  s.appendChild(nodeBox(360,160,'Cluster mgr',cOrange,cOrange));
  s.appendChild(nodeBox(140,270,'Executor',cTeal,cTeal));
  s.appendChild(nodeBox(360,270,'Executor',cTeal,cTeal));
  s.appendChild(nodeBox(580,270,'Executor',cTeal,cTeal));
  arrow(s,360,70,360,138,cOrange,'recursos');
  arrow(s,300,182,170,248,cTeal,'tasks');
  arrow(s,360,182,360,248,cTeal,'tasks');
  arrow(s,420,182,550,248,cTeal,'tasks');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0],[1],[2,3,4],[0],[0,1]][this.idx]); svgCap(this.svg,this.titles[this.idx],340); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Arquitectura.</b> Driver coordina, el CM asigna, los executors ejecutan y cachean.',this.cap,'Driver, executors, CM ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: driver, executors y modos.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animLazy = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Transformación.</b> <code>select</code>, <code>filter</code>, <code>withColumn</code> no lanzan el cómputo: agregan un nodo al plan.',
  '<b>Paso 2/4 · Plan completo.</b> Spark espera para fusionar proyecciones, empujar filtros y evitar trabajo de más.',
  '<b>Paso 3/4 · explain.</b> <code>explain()</code> muestra el plan físico. <code>explain(True)</code> agrega lógico, optimizado y físico. Aún no es el resultado.',
  '<b>Paso 4/4 · Acción.</b> <code>show</code>, <code>count</code>, <code>collect</code>, <code>write</code> disparan un <strong>job</strong>. ✓'
],
titles:['1/4 transform','2/4 plan','3/4 explain','4/4 acción ✓'],
init(){ this.svg=$('#svgEnemy'); svgDefs(this.svg);
  this.ch=animChrome('svgEnemy',4,'Pulsa <b>Reproducir</b>: lazy y acciones.');
  this.playBtn=document.querySelector('[onclick="animLazy.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#enemyCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(140,130,'select',cBlue,cBlue));
  s.appendChild(nodeBox(320,130,'filter',cPurple,cPurple));
  s.appendChild(nodeBox(500,130,'plan DAG',cGold,cGold));
  s.appendChild(nodeBox(500,250,this.idx>=3?'JOB':'acción',cBad,cBad));
  arrow(s,206,130,254,130,cPurple,'lazy');
  arrow(s,386,130,434,130,cGold,'lazy');
  arrow(s,500,152,500,228,cOrange,'dispara');
  const t=el('text',{x:220,y:250,'text-anchor':'middle',class:'tedge'});
  t.textContent=this.idx>=3?'la acción materializa el plan':'nada corre todavía';
  s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0],[0,1,2],[2],[3]][this.idx]); svgCap(this.svg,this.titles[this.idx],320); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Lazy.</b> Las transformaciones arman el plan. Solo la acción lo ejecuta.',this.cap,'Transformaciones y acciones ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: lazy y acciones.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animShuffle = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Narrow.</b> <code>map</code>, <code>filter</code>, <code>select</code>: una partición de salida depende de <strong>una</strong> de entrada. No hay shuffle.',
  '<b>Paso 2/5 · Wide.</b> <code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code> mezclan particiones por red o disco.',
  '<b>Paso 3/5 · Stages.</b> <strong>1 acción = 1 job</strong>. El scheduler corta <strong>stages</strong> en cada frontera de shuffle. Cada stage lanza <strong>tasks</strong> (una por partición, en lo típico).',
  '<b>Paso 4/5 · repartition vs coalesce.</b> <code>repartition(n)</code> sube o baja <em>con</em> shuffle. <code>coalesce(n)</code> solo baja, sin shuffle completo.',
  '<b>Paso 5/5 · cache / persist.</b> Si el mismo DataFrame alimenta varias acciones (limpieza + conteos + ML), <code>persist()</code> evita recomputar. <code>unpersist()</code> suelta la copia. ✓'
],
titles:['1/5 narrow','2/5 wide','3/5 stages','4/5 repartition','5/5 cache ✓'],
init(){ this.svg=$('#svgZookie'); svgDefs(this.svg);
  this.ch=animChrome('svgZookie',5,'Pulsa <b>Reproducir</b>: narrow, wide y shuffle.');
  this.playBtn=document.querySelector('[onclick="animShuffle.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#zookieCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(150,100,'P1 filter',cTeal,cTeal));
  s.appendChild(nodeBox(150,210,'P2 filter',cTeal,cTeal));
  s.appendChild(nodeBox(400,155,this.idx>=1?'SHUFFLE':'sin red',this.idx>=1?cOrange:cDim,this.idx>=1?cOrange:cDim));
  s.appendChild(nodeBox(580,100,'stage B',cBlue,cBlue));
  s.appendChild(nodeBox(580,210,'cache',cPurple,cPurple));
  arrow(s,216,110,334,145,cDim,'narrow');
  arrow(s,216,200,334,170,this.idx>=1?cOrange:cDim,'wide');
  arrow(s,466,140,514,110,cBlue,'tasks');
  const t=el('text',{x:360,y:300,'text-anchor':'middle',class:'tedge'});
  t.textContent='1 acción = 1 job → stages entre shuffles → tasks';
  s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[2],[2,3],[2],[4]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Shuffle.</b> Narrow no mueve datos. Wide sí, y parte el job en stages. Cache si reutilizas el plan.',this.cap,'Narrow, wide, stages ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: narrow, wide y shuffle.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animPipeline = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Plan lógico.</b> El DataFrame o el SQL se vuelve un plan. DataFrame y Dataset pasan por Catalyst; el RDD no.',
  '<b>Paso 2/5 · Catalyst.</b> Reglas: <strong>predicate pushdown</strong> y <strong>column pruning</strong>. Luego elige el plan físico.',
  '<b>Paso 3/5 · Tungsten.</b> Ejecución apretada: memoria off-heap y código generado por etapas.',
  '<b>Paso 4/5 · AQE.</b> Vuelve a optimizar <strong>en runtime</strong> con tamaños reales después del shuffle (puede cambiar el join).',
  '<b>Paso 5/5 · Formato y broadcast.</b> Parquet (columnar) es el default de producción. Si la dimensión es chica, <strong>broadcast</strong> evita shufflear la tabla de hechos. Delta / Iceberg / Hudi suman ACID sobre ese Parquet. ✓'
],
titles:['1/5 lógico','2/5 Catalyst','3/5 Tungsten','4/5 AQE','5/5 Parquet ✓'],
init(){ this.svg=$('#svgArch'); svgDefs(this.svg);
  this.ch=animChrome('svgArch',5,'Pulsa <b>Reproducir</b>: Catalyst, Tungsten, AQE.');
  this.playBtn=document.querySelector('[onclick="animPipeline.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#archCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(120,150,'DataFrame',cGold,cGold));
  s.appendChild(nodeBox(300,80,'Catalyst',cBlue,cBlue));
  s.appendChild(nodeBox(480,80,'Tungsten',cPurple,cPurple));
  s.appendChild(nodeBox(480,220,'AQE',cOrange,cOrange));
  s.appendChild(nodeBox(640,150,'Parquet',cTeal,cTeal));
  arrow(s,186,140,250,100,cBlue,'plan');
  arrow(s,366,80,414,80,cPurple,'codegen');
  arrow(s,480,102,480,198,cOrange,'stats');
  arrow(s,546,150,574,150,cTeal,'scan');
  const t=el('text',{x:300,y:300,'text-anchor':'middle',class:'tedge'});
  t.textContent=this.idx>=4?'broadcast si la dimensión cabe':'pushdown + pruning antes de ejecutar';
  s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0],[1],[2],[3],[4]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Optimización.</b> Catalyst planea, Tungsten ejecuta, AQE corrige con datos reales. Parquet + broadcast cuando la tabla chica cabe.',this.cap,'Catalyst, AQE, Parquet ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: Catalyst, Tungsten, AQE.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animTokens = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/6 · Schema.</b> <code>inferSchema</code> se rompe con comas dentro del texto. DDL: <code>id long, user string, sentiment string, text string</code>. El archivo del código es <code>twitter_training.csv</code>.',
  '<b>Paso 2/6 · Limpieza.</b> Quita URLs y menciones, baja a minúsculas, recorta espacios y filtra textos vacíos. El resultado es <code>text_clean</code>.',
  '<b>Paso 3/6 · Tokenizer.</b> Parte <code>text_clean</code> en palabras. Tokenizar la columna <code>text</code> cruda mezcla URLs y puntuación.',
  '<b>Paso 4/6 · StopWords.</b> <code>StopWordsRemover</code> tira artículos y preposiciones.',
  '<b>Paso 5/6 · explode + count.</b> Una fila por token, luego <code>groupBy("token").count()</code>. Sin ese conteo la nube de palabras no tiene frecuencias.',
  '<b>Paso 6/6 · Tópicos.</b> <strong>CountVectorizer</strong> (bolsa) → <strong>IDF</strong> (pesa lo raro) → <strong>LDA</strong> (<code>k</code> temas). <code>describeTopics</code> muestra las palabras de cada tema. ✓'
],
titles:['1/6 schema','2/6 regex','3/6 tokens','4/6 stops','5/6 count','6/6 LDA ✓'],
init(){ this.svg=$('#svgTok'); svgDefs(this.svg);
  this.ch=animChrome('svgTok',6,'Pulsa <b>Reproducir</b>: tweets, tokens y LDA.');
  this.playBtn=document.querySelector('[onclick="animTokens.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#tokCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,6,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(110,120,'CSV text',cGold,cGold));
  s.appendChild(nodeBox(270,120,'text_clean',cOrange,cOrange));
  s.appendChild(nodeBox(430,120,'tokens',cTeal,cTeal));
  s.appendChild(nodeBox(590,120,'stops',cPurple,cPurple));
  s.appendChild(nodeBox(360,240,'count / LDA',cBlue,cBlue));
  arrow(s,176,120,204,120,cOrange,'regex');
  arrow(s,336,120,364,120,cTeal,'split');
  arrow(s,496,120,524,120,cPurple,'stop');
  arrow(s,520,142,420,220,cBlue,'explode');
  const t=el('text',{x:360,y:310,'text-anchor':'middle',class:'tedge'});
  t.textContent='Tokenizer sobre text_clean, no sobre text crudo';
  s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,6,st,this.cap,st);
  glowIdx(this.svg,[[0],[1],[2],[3],[4],[4]][this.idx]); svgCap(this.svg,this.titles[this.idx],340); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,6); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,6); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',6,6,'<b>✓ Texto.</b> Schema explícito, limpieza, tokens, stops, conteo y recién entonces LDA.',this.cap,'Tweets → tokens → LDA ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,6,'Pulsa <b>Reproducir</b>: tweets, tokens y LDA.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };
