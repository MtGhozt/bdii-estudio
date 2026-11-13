const animPipeline = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Fuentes.</b> POS, WMS, OMS y HR siguen siendo <strong>OLTP</strong>: cada venta se registra en el momento.',
  '<b>Paso 2/5 · Staging.</b> El lote aterriza crudo (<code>batch_id</code>, archivo, zona horaria). Aún no hay reglas de margen ni joins de negocio.',
  '<b>Paso 3/5 · DWH.</b> Aquí se integra: mismas claves, misma moneda, mismos sujetos (ventas, cliente, inventario).',
  '<b>Paso 4/5 · Marts.</b> Subconjuntos para tienda o finanzas. Si salen del DWH, son <strong>dependientes</strong> y comparten dimensiones.',
  '<b>Paso 5/5 · BI.</b> Dashboards y cubos leen el mart, no la caja. Todos ven la misma verdad histórica. ✓'
],
titles:['1/5 fuentes','2/5 staging','3/5 DWH','4/5 marts','5/5 BI ✓'],
init(){ this.svg=$('#svgGraph'); svgDefs(this.svg);
  this.ch=animChrome('svgGraph',5,'Pulsa <b>Reproducir</b>: fuentes → staging → DWH → marts → BI.');
  this.playBtn=document.querySelector('[onclick="animPipeline.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#graphCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(120,70,'Fuentes OLTP',cGold,cGold));
  s.appendChild(nodeBox(360,70,'Staging',cOrange,cOrange));
  s.appendChild(nodeBox(600,70,'DWH integrado',cBlue,cBlue));
  s.appendChild(nodeBox(220,190,'Mart Ventas',cTeal,cTeal));
  s.appendChild(nodeBox(500,190,'Mart Finanzas',cPurple,cPurple));
  s.appendChild(nodeBox(360,290,'BI / dashboards',cGold,cGold));
  arrow(s,186,70,294,70,cOrange,'ETL/ELT');
  arrow(s,426,70,534,70,cBlue,'integra');
  arrow(s,560,92,260,168,cTeal,'');
  arrow(s,600,92,520,168,cPurple,'');
  arrow(s,280,212,340,268,cGold,'');
  arrow(s,460,212,390,268,cGold,'');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0],[1],[2],[3,4],[5]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Pipeline.</b> La caja no es el dashboard: staging aterriza, el DWH integra, el mart sirve a BI.',this.cap,'Fuentes → staging → DWH → marts → BI ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: fuentes → staging → DWH → marts → BI.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animOltpOlap = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · OLTP.</b> “¿Hay stock del SKU 8842 en Central?” es una transacción: pocos registros, respuesta en milisegundos.',
  '<b>Paso 2/4 · Escrituras.</b> El POS hace INSERT/UPDATE/DELETE todo el día. El modelo va en <strong>3FN</strong> para no contradecir el pedido.',
  '<b>Paso 3/4 · OLAP.</b> “¿Qué categoría creció más en Q3 en el Norte?” suma historial. Segundos o minutos están bien.',
  '<b>Paso 4/4 · Separar.</b> Esa agregación no corre sobre la caja de producción: vive en el DWH, en estrella. ✓'
],
titles:['1/4 OLTP','2/4 writes','3/4 OLAP','4/4 separar ✓'],
init(){ this.svg=$('#svgCheck'); svgDefs(this.svg);
  this.ch=animChrome('svgCheck',4,'Pulsa <b>Reproducir</b>: OLTP de caja frente a OLAP.');
  this.playBtn=document.querySelector('[onclick="animOltpOlap.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#checkCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(180,80,'OLTP · POS',cOrange,cOrange));
  s.appendChild(nodeBox(180,210,'stock del SKU',cGold,cGold));
  s.appendChild(nodeBox(540,80,'OLAP · DWH',cBlue,cBlue));
  s.appendChild(nodeBox(540,210,'ventas Q3 Norte',cTeal,cTeal));
  arrow(s,180,102,180,188,cGold,'1 fila');
  arrow(s,540,102,540,188,cTeal,'SUM');
  const t=el('text',{x:360,y:300,'text-anchor':'middle',class:'tedge'}); t.textContent='no mezclar la carga analitica con la caja'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[0],[2,3],[2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],340); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Dos mundos.</b> OLTP responde el stock de ahora; OLAP compara el trimestre. No comparten la misma base de producción.',this.cap,'OLTP (caja) vs OLAP (historial) ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: OLTP de caja frente a OLAP.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animStar = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Hecho.</b> <code>fact_ventas</code> está al centro. Una fila = una línea de ticket (el grano ya declarado).',
  '<b>Paso 2/5 · Dimensiones.</b> Fecha, producto, tienda y cliente salen en tablas desnormalizadas. El join es corto.',
  '<b>Paso 3/5 · Degenerada.</b> <code>ticket_id</code> se repite en las líneas del mismo ticket y no tiene dimensión propia.',
  '<b>Paso 4/5 · Caso.</b> 2 camisas + 1 pantalón → <strong>3 filas</strong>, la misma fecha de negocio y el mismo ticket.',
  '<b>Paso 5/5 · Consulta.</b> SUM(venta_bruta) por mes y categoría, filtrando región Norte. ✓'
],
titles:['1/5 hecho','2/5 dims','3/5 ticket','4/5 3 filas','5/5 SQL ✓'],
init(){ this.svg=$('#svgEnemy'); svgDefs(this.svg);
  this.ch=animChrome('svgEnemy',5,'Pulsa <b>Reproducir</b>: estrella de FactVentas.');
  this.playBtn=document.querySelector('[onclick="animStar.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#enemyCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(360,130,'fact_ventas',cBlue,cBlue));
  s.appendChild(nodeBox(140,48,'dim_fecha',cTeal,cTeal));
  s.appendChild(nodeBox(360,48,'dim_producto',cTeal,cTeal));
  s.appendChild(nodeBox(580,48,'dim_tienda',cTeal,cTeal));
  s.appendChild(nodeBox(200,230,'dim_cliente',cPurple,cPurple));
  s.appendChild(nodeBox(520,230,'ticket_id',cGold,cGold));
  arrow(s,200,70,320,112,cTeal,'');
  arrow(s,360,70,360,108,cTeal,'');
  arrow(s,520,70,400,112,cTeal,'');
  arrow(s,300,152,230,210,cPurple,'');
  arrow(s,420,152,500,210,cGold,'degen.');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0],[1,2,3,4],[5],[0,5],[0,1,2]][this.idx]); svgCap(this.svg,this.titles[this.idx],285); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Estrella.</b> Hecho al centro, dimensiones alrededor, ticket degenerado, agregados con pocos joins.',this.cap,'fact_ventas + dimensiones ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: estrella de FactVentas.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animScd2 = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Cliente.</b> Ana López (<code>C-1001</code>) entra como Standard. Surrogate <code>cliente_key = 501</code>.',
  '<b>Paso 2/4 · Type 1.</b> Si solo sobrescribes el segmento, las ventas viejas “pasan” a VIP y pierdes el historial.',
  '<b>Paso 3/4 · Type 2.</b> El 2025-07-01 se inserta la fila <code>502</code> (VIP, is_current = Y). La 501 cierra en 2025-06-30.',
  '<b>Paso 4/4 · Hechos quietos.</b> Enero sigue apuntando a 501. Las cargas nuevas resuelven 502. No se reescribe el hecho. ✓'
],
titles:['1/4 C-1001','2/4 Type 1','3/4 fila 502','4/4 hechos ✓'],
init(){ this.svg=$('#svgZookie'); svgDefs(this.svg);
  this.ch=animChrome('svgZookie',4,'Pulsa <b>Reproducir</b>: SCD Type 2 de dim_cliente.');
  this.playBtn=document.querySelector('[onclick="animScd2.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#zookieCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(360,48,'C-1001 Ana',cGold,cGold));
  s.appendChild(nodeBox(200,150,'501 Standard',cDim,cDim));
  const vipOn=this.idx>=2;
  s.appendChild(nodeBox(520,150,vipOn?'502 VIP':'502 pendiente',vipOn?cTeal:cDim,vipOn?cTeal:cDim));
  s.appendChild(nodeBox(360,250,'fact_ventas',cBlue,cBlue));
  arrow(s,320,70,230,128,cDim,'desde ene');
  arrow(s,400,70,490,128,cTeal,'desde jul');
  arrow(s,230,172,320,228,cBlue,'key 501');
  arrow(s,490,172,400,228,cBlue,'key 502');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[1],[2],[1,2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],320); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1600); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ SCD 2.</b> Nueva fila con vigencia; el hecho conserva la surrogate que era cierta ese día.',this.cap,'501 histórica · 502 vigente ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: SCD Type 2 de dim_cliente.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animCube = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Roll-up.</b> Subes la jerarquía: de día a mes. El número es más agregado.',
  '<b>Paso 2/5 · Drill-down.</b> Bajas de mes a día para ver el detalle de la misma medida.',
  '<b>Paso 3/5 · Slice.</b> Fijas <strong>una</strong> dimensión: solo la región Norte. El resto del cubo se recorta.',
  '<b>Paso 4/5 · Dice.</b> Fijas <strong>varias</strong>: año 2025 y categoría Ropa. Eso es un subcubo.',
  '<b>Paso 5/5 · Pivot.</b> Rotas ejes: tiendas en columnas, meses en filas. La medida no cambia. ✓'
],
titles:['1/5 roll-up','2/5 drill','3/5 slice','4/5 dice','5/5 pivot ✓'],
init(){ this.svg=$('#svgArch'); svgDefs(this.svg);
  this.ch=animChrome('svgArch',5,'Pulsa <b>Reproducir</b>: roll-up, drill, slice, dice y pivot.');
  this.playBtn=document.querySelector('[onclick="animCube.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#archCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(360,160,'cubo ventas',cBlue,cBlue));
  s.appendChild(nodeBox(140,55,'día → mes',cTeal,cTeal));
  s.appendChild(nodeBox(360,55,'mes → día',cPurple,cPurple));
  s.appendChild(nodeBox(580,55,'solo Norte',cOrange,cOrange));
  s.appendChild(nodeBox(360,275,'2025 + Ropa',cGold,cGold));
  arrow(s,180,77,320,140,cTeal,'roll-up');
  arrow(s,360,77,360,138,cPurple,'drill');
  arrow(s,540,77,400,140,cOrange,'slice');
  arrow(s,360,182,360,253,cGold,'dice');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[2],[3],[4],[0]][this.idx]); svgCap(this.svg,this.titles[this.idx],340); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ OLAP.</b> Roll-up agrega, drill detalla, slice fija una dimensión, dice fija varias, pivot rota ejes.',this.cap,'Cinco operaciones del cubo ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: roll-up, drill, slice, dice y pivot.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animEtlElt = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Extraer.</b> Ambos patrones sacan datos del POS, del WMS y de archivos. La diferencia es <strong>dónde</strong> se transforman.',
  '<b>Paso 2/4 · ETL.</b> Un motor externo limpia, unifica moneda y recién entonces carga al DWH. Útil con reglas heterogéneas.',
  '<b>Paso 3/4 · ELT.</b> Primero cargas el crudo al landing (object storage o tablas raw). El destino todavía no tiene el modelo de negocio.',
  '<b>Paso 4/4 · SQL en destino.</b> En Snowflake o BigQuery la transformación es SQL versionado. Escala el motor analítico, no un servidor ETL aparte. ✓'
],
titles:['1/4 extraer','2/4 ETL','3/4 landing','4/4 ELT ✓'],
init(){ this.svg=$('#svgEtl'); svgDefs(this.svg);
  this.ch=animChrome('svgEtl',4,'Pulsa <b>Reproducir</b>: ETL fuera del DWH vs ELT dentro.');
  this.playBtn=document.querySelector('[onclick="animEtlElt.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#etlCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(110,150,'Fuentes',cGold,cGold));
  s.appendChild(nodeBox(310,70,'Motor ETL',cOrange,cOrange));
  s.appendChild(nodeBox(310,230,'Landing raw',cPurple,cPurple));
  s.appendChild(nodeBox(560,150,'DWH / SQL',cTeal,cTeal));
  arrow(s,176,130,250,84,cOrange,'ETL');
  arrow(s,176,170,250,216,cPurple,'ELT');
  arrow(s,376,80,500,136,cOrange,'ya limpio');
  arrow(s,376,220,500,164,cTeal,'transforma');
  const t=el('text',{x:360,y:310,'text-anchor':'middle',class:'tedge'}); t.textContent=this.idx>=2?'ELT: SQL dentro del destino':'ETL transforma antes de cargar'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0],[1],[2],[2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1550); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ ETL vs ELT.</b> ETL transforma antes de cargar; ELT carga crudo y transforma con SQL en el destino.',this.cap,'ETL fuera · ELT dentro del DWH ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: ETL fuera del DWH vs ELT dentro.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };
