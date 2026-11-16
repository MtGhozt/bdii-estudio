const MODULES = [
{ id:'m0', tag:'Módulo 0', accent:'gold', title:'Qué es un Data Warehouse y por qué se separa del OLTP',
summary:'Repositorio analítico con historial. El analista consulta otra base para no frenar la caja.',
html: `
<p class="lede">Un <strong>Data Warehouse</strong> es un repositorio centralizado, orientado al análisis, que integra datos de varios sistemas operacionales, los modela para consultar y guarda un <strong>historial</strong> consistente. No es la caja.</p>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Bill Inmon lo caracteriza en cuatro rasgos: <strong>orientado al sujeto</strong>, <strong>integrado</strong>, con <strong>variación en el tiempo</strong> y <strong>no volátil</strong>. Sirve para preguntar cuánto vendimos por región el trimestre pasado comparado con el año anterior. No sirve para preguntar el saldo de la cuenta X en este instante.</div>
<h3>Las cuatro ideas, en corto</h3>
<table><tr><th>#</th><th>Rasgo</th><th>En la práctica</th></tr>
<tr><td>1</td><td>Orientado al sujeto</td><td>Ventas, clientes, inventario — no “el módulo del ERP”.</td></tr>
<tr><td>2</td><td>Integrado</td><td>Misma clave de cliente, misma moneda, misma zona horaria.</td></tr>
<tr><td>3</td><td>Variación en el tiempo</td><td>Queda el estado de ayer, no solo el valor de hoy.</td></tr>
<tr><td>4</td><td>No volátil</td><td>Se carga por lotes. Un hecho ya cargado no se edita como un pedido.</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.113]</div>"Those queries are often expensive, scanning large parts of the dataset, which can harm the performance of concurrently executing transactions."<br>Kleppmann cuenta por qué el administrador no deja al analista suelto en la base operacional: la consulta ad hoc recorre una porción grande de los datos y le quita aire a las transacciones que se están cobrando al mismo tiempo. Por eso, a finales de los 80 y principios de los 90, las empresas dejaron de usar el OLTP para analítica y pasaron a una base aparte.</div>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.114]</div>"A data warehouse, by contrast, is a separate database that analysts can query to their hearts' content, without affecting OLTP operations."<br>El almacén es esa otra base. Contiene una <strong>copia de solo lectura</strong> de los distintos OLTP de la empresa. El dato se extrae (volcado periódico o flujo continuo de cambios), se transforma a un esquema cómodo para analizar, se limpia y se carga. Ese proceso es el <strong>ETL</strong> (Fig. 3-8). La ventaja: el almacén se puede optimizar para el patrón analítico; los índices del capítulo, que sirven al OLTP, no responden bien una agregación grande.</div>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>La caja (POS) anota cada venta al momento: eso es operacional. De noche el almacén analítico copia esas ventas, las cruza con productos, tiendas y el calendario fiscal, y las deja quietas. Sin ese almacén, cada gerencia exporta un Excel con su propia definición de “venta”. Con el DWH, todos leen la misma verdad histórica, y el cobro del sábado de rebajas no compite con el tablero.</div>
<div class="trade"><b>Trade-off 0 · Una sola verdad, un poco más tarde.</b> Ganas: el analista consulta cuanto quiera y la caja sigue cobrando. Pierdes: el tablero ve el último lote (o el flujo ya aplicado), no el ticket que se está pagando en este segundo.</div>
<div class="callout warn"><div class="lbl">Error común</div>Usar el DWH para “¿cuál es el saldo de esta cuenta ahora?” o, al revés, lanzar el agregado de tres años sobre el POS. La primera pregunta es OLTP. La segunda es del almacén.</div>
`,
mini:{q:'Según Kleppmann, ¿por qué el analista no corre el agregado sobre el OLTP?', opts:['Porque SQL no sabe sumar','Porque el escaneo analítico es caro y perjudica las transacciones que se ejecutan a la vez','Porque el DWH no guarda ventas','Porque el POS no tiene clave primaria'], a:1, why:'DDIA p.113–114: la consulta ad hoc barre muchos datos. El almacén es otra base, de copia de lectura, para no tocar el OLTP.'} },
{ id:'m1', tag:'Módulo 1', accent:'blue', title:'Las 4 de Inmon y OLTP contra OLAP',
summary:'Sujeto, integración, tiempo y no volatilidad, más el contraste de acceso de Kleppmann.',
html: `
<p class="lede">Inmon fija el contrato del almacén. OLTP y OLAP no son “la misma base con más índices”: cambian el propósito, el patrón de acceso y quién consulta.</p>
<h3>Qué significa cada rasgo de Inmon</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Orientado al sujeto: el modelo habla de Ventas o Cliente, no del módulo del ERP. Integrado: un solo significado de cliente, moneda y zona horaria. Variación temporal: snapshots y SCD en las dimensiones. No volátil: ETL por lotes, sin UPDATE masivo de hechos ya cargados.</div>
<table><tr><th>#</th><th>Característica</th><th>Se ve así</th></tr>
<tr><td>1</td><td>Orientado al sujeto</td><td>Áreas de negocio, no aplicaciones.</td></tr>
<tr><td>2</td><td>Integrado</td><td><code>cliente_id</code>, moneda y huso horario unificados.</td></tr>
<tr><td>3</td><td>Variación temporal</td><td>Fotos diarias; la dimensión recuerda el segmento anterior.</td></tr>
<tr><td>4</td><td>No volátil</td><td>El hecho cargado se conserva; no se “corrige” como un pedido abierto.</td></tr></table>
<h3>OLTP frente a OLAP, como lo pide el curso</h3>
<table><tr><th>Aspecto</th><th>OLTP</th><th>OLAP</th></tr>
<tr><td>Propósito</td><td>Transacciones del día</td><td>Análisis, reportes, KPI</td></tr>
<tr><td>Operaciones</td><td>INSERT, UPDATE, DELETE frecuentes</td><td>SELECT agregados, pocos writes</td></tr>
<tr><td>Modelo</td><td>Alta normalización (3FN+)</td><td>Desnormalizado (estrella)</td></tr>
<tr><td>Quién consulta</td><td>Operadores y aplicaciones</td><td>Analistas, BI, dirección</td></tr>
<tr><td>Latencia</td><td>Milisegundos</td><td>Segundos a minutos, aceptable</td></tr>
<tr><td>Ejemplo</td><td>Un pedido de e-commerce</td><td>Ventas por categoría en el año</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.112]</div>Kleppmann separa los patrones antes de ponerles nombre. El OLTP busca <strong>pocos registros por clave</strong>, con un índice, e inserta o actualiza según lo que teclea el usuario. La consulta analítica <strong>recorre muchísimos registros</strong>, lee pocas columnas y calcula un agregado (conteo, suma, promedio), no devuelve la fila cruda. Ejemplos de ventas: ingreso total de cada tienda en enero; cuántos plátanos de más se vendieron en la última promo; qué marca de alimento infantil se compra junto con los pañales de la marca X.</div>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.113]</div>La Table 3-1 pone el contraste así. Lectura: pocos registros por clave, frente a un agregado sobre muchísimos. Escritura: accesos aleatorios de baja latencia desde el usuario, frente a <strong>carga masiva (ETL)</strong> o un flujo de eventos. Quién lo usa: el cliente final vía la aplicación, frente al analista interno. Qué representa el dato: el <strong>estado actual</strong>, frente a la <strong>historia de eventos</strong>. Tamaño: gigabytes a terabytes, frente a terabytes a petabytes. La nota al pie aclara que “online” en OLAP no es el sitio web: el analista explora de forma interactiva, no solo abre un reporte ya fijo.</div>
<p>En la superficie los dos mundos hablan SQL. Por dentro no: muchos motores se especializan en uno u otro. SQL Server o SAP HANA pueden hacer ambos, pero cada vez son <strong>dos motores</strong> detrás de la misma interfaz SQL <span class="callout-src">(DDIA p.115)</span>.</p>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>OLTP: “¿Hay stock del SKU 8842 en Central?”. Eso es una clave, el estado de ahora. OLAP: “¿Qué categoría creció más en Q3 en la zona Norte?”. Eso barre el historial de eventos y no debe competir con el cobro.</div>
<div class="trade"><b>Trade-off 1 · Sacar el análisis de la caja.</b> Ganas: el POS sigue en milisegundos y el almacén se diseña para barrer historia. Pierdes: el tablero no ve la venta de hace treinta segundos; ve el último lote integrado.</div>
<div class="callout warn"><div class="lbl">Error común</div>Decir que OLAP es “OLTP con más índices”. Kleppmann marca lo contrario: el índice que encuentra una clave sirve al OLTP y responde mal el escaneo analítico. Cambia la pregunta, la forma de la tabla y el ritmo de escritura.</div>
`,
mini:{q:'En la Table 3-1 de Kleppmann, el dato analítico representa sobre todo…', opts:['El estado actual de una sola cuenta','La historia de eventos a lo largo del tiempo','Un índice B+ del POS','El saldo en vivo de la caja'], a:1, why:'OLTP = latest state. OLAP = history of events. DDIA p.113.'} },
{ id:'m2', tag:'Módulo 2', accent:'purple', title:'Arquitectura: staging, DWH, marts y metadatos',
summary:'Del sistema fuente al dashboard, con marts dependientes y tres clases de metadatos.',
html: `
<p class="lede">El almacén no es una sola tabla. Hay una zona de aterrizaje, un núcleo integrado, subconjuntos por equipo y una capa de consumo.</p>
<h3>El flujo</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Fuentes OLTP, APIs o archivos entran por ETL o ELT a staging (crudo, poco transformado). El DWH empresarial integra: en Inmon suele ser 3FN; en Kimball puede ser el bus de hechos. De ahí salen marts de ventas, inventario o CRM, y BI consume dashboards, cubos o features.</div>
<pre><code>Fuentes (POS, WMS, OMS, HR)
        → staging / landing
        → DWH integrado
        → marts (tienda, finanzas, CRM)
        → BI</code></pre>
<table><tr><th>Capa</th><th>Qué guarda</th></tr>
<tr><td>Staging</td><td>Lote crudo, trazable. Calidad mínima. Sin joins de negocio.</td></tr>
<tr><td>DWH</td><td>Modelo corporativo integrado.</td></tr>
<tr><td>Data mart</td><td>Recorte para un departamento o un caso de uso.</td></tr>
<tr><td>BI</td><td>Consulta final: tablero, cubo, modelo semántico.</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.113]</div>Kleppmann lista los OLTP que una empresa grande ya no puede consultar “a mano”: el sitio de cara al cliente, el punto de venta de las tiendas físicas, el inventario, las rutas, los proveedores, los empleados. Cada uno vive casi solo. La Fig. 3-8 (p.114) dibuja el ETL simplificado hacia el almacén. El curso parte esa flecha en capas: staging, núcleo, marts y BI. El libro no nombra el mart; la idea de “una copia analítica de todos esos sistemas” es la misma.</div>
<h3>Mart dependiente o independiente</h3>
<table><tr><th>Tipo</th><th>De dónde sale</th><th>Ventaja</th><th>Riesgo</th></tr>
<tr><td>Dependiente</td><td>Del DWH corporativo</td><td>Misma métrica, gobernanza</td><td>El núcleo puede volverse cuello de botella</td></tr>
<tr><td>Independiente</td><td>Directo de las fuentes</td><td>Un área entrega rápido</td><td>Silos y “venta” definida de dos maneras</td></tr></table>
<p>Kimball prefiere marts <strong>dependientes</strong> que comparten dimensiones conformadas. Inmon construye primero el DWH en 3FN; el mart es una extracción o una vista.</p>
<h3>Tres metadatos</h3>
<table><tr><th>Tipo</th><th>Ejemplos</th></tr>
<tr><td>Técnicos</td><td>Esquemas, linaje, jobs, SLAs</td></tr>
<tr><td>De negocio</td><td>Qué significa “venta neta”, quién es dueño del dato, políticas</td></tr>
<tr><td>Operacionales</td><td>Log de carga, filas rechazadas, watermark de extracción</td></tr></table>
<p>Sin metadatos no hay confianza cuando el esquema de origen cambia, ni forma de saber qué lote se cargó.</p>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>Fuentes: POS, WMS, OMS y RR.HH. (el mismo mapa que Kleppmann: caja, inventario, pedidos, empleados). Staging: <code>stg_pos_ventas</code> y <code>stg_inv_snapshot</code>, todavía sin el join de margen. Bus: <code>fact_ventas</code>, <code>fact_inventario</code>, <code>fact_pedidos</code> más dimensiones compartidas. Marts: operaciones de tienda y finanzas. BI lee el mart, no la caja.</div>
<h3>Checklist de staging</h3>
<ul>
<li><code>batch_id</code> y timestamp de extracción</li>
<li>Fuente y zona horaria anotadas</li>
<li>Fechas y decimales con cast explícito</li>
<li>Duplicados vistos con clave natural y hash</li>
<li>Nulos en claves obligatorias van a rechazos</li>
<li>Las reglas de negocio se quedan para el DWH</li>
<li>Retención corta (días o semanas) y linaje (<code>source_system</code>, archivo o PK de origen)</li>
</ul>
<div class="trade"><b>Trade-off 2 · Mart rápido o métrica única.</b> Ganas con el mart independiente: un equipo no espera al modelo corporativo. Pierdes: dos tableros pueden no cuadrar el mismo lunes.</div>
<div class="callout warn"><div class="lbl">Error común</div>Calcular margen, segmentos o SCD dentro de staging. Esa capa aterriza y deja rastro; la regla de negocio vive en el DWH.</div>
`,
mini:{q:'¿Dónde van las reglas de negocio complejas (margen, segmento, SCD)?', opts:['En la tabla de staging, junto al archivo crudo','En la capa del DWH, después del aterrizaje','En el POS, para no tener DWH','Solo en el nombre del dashboard'], a:1, why:'Staging conserva el lote. La integración y las reglas se aplican al entrar al almacén.'} },
{ id:'m3', tag:'Módulo 3', accent:'teal', title:'ETL contra ELT, Inmon contra Kimball',
summary:'Dónde ocurre la transformación, y si el núcleo es 3FN o un bus dimensional.',
html: `
<p class="lede">Hay dos decisiones distintas que a veces se mezclan: <strong>cómo se mueve el dato</strong> (ETL o ELT) y <strong>cómo se modela el núcleo</strong> (Inmon o Kimball).</p>
<h3>ETL y ELT</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>En ETL la transformación corre en un motor aparte y el DWH recibe datos ya conformados. En ELT se carga el crudo y se transforma con SQL dentro del destino. En la nube, ELT es el patrón habitual: landing en object storage y SQL versionado (dbt y similares).</div>
<table><tr><th></th><th>ETL</th><th>ELT</th></tr>
<tr><td>Transformación</td><td>Fuera del DWH</td><td>En el motor SQL del DWH o del lake</td></tr>
<tr><td>Cuándo conviene</td><td>Fuentes heterogéneas y reglas pesadas</td><td>Destino que escala (Snowflake, BigQuery)</td></tr>
<tr><td>Zona previa</td><td>Staging muy usado</td><td>Landing en objetos + tablas raw</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.114]</div>"Data is extracted from OLTP databases (using either a periodic data dump or a continuous stream of updates), transformed into an analysis-friendly schema, cleaned up, and then loaded into the data warehouse. This process of getting data into the warehouse is known as Extract–Transform–Load (ETL)."<br>Eso es el ETL clásico del libro: extraer (volcado periódico o flujo continuo), transformar a un esquema amigable para el análisis, limpiar y cargar (Fig. 3-8). Kleppmann no desarrolla el ELT por nombre. El ELT —cargar crudo y transformar dentro del motor— es la variante de curso y de nube, sobre la misma idea de sacar el dato del OLTP.</div>
<h3>Inmon y Kimball</h3>
<table><tr><th></th><th>Inmon</th><th>Kimball</th></tr>
<tr><td>Núcleo</td><td>DWH relacional en 3FN</td><td>Dimensional (estrella) en todo el bus</td></tr>
<tr><td>Recorrido</td><td>Top-down: primero la empresa</td><td>Bottom-up: mart a mart, dimensiones conformadas</td></tr>
<tr><td>Normalización</td><td>Alta en el núcleo</td><td>Baja en hechos y dimensiones de presentación</td></tr>
<tr><td>Tiempo al primer tablero</td><td>Más largo al inicio</td><td>Entregas por proceso de negocio</td></tr>
<tr><td>Encaja si</td><td>Hay gobierno fuerte y muchas fuentes distintas</td><td>El BI necesita salir por procesos, de forma iterativa</td></tr></table>
<p>El capítulo de Kleppmann no elige entre Inmon y Kimball. Sí dice que el modelo del almacén suele ser relacional, porque SQL cae bien a la analítica, y que el estilo habitual es la estrella (modelado dimensional). Eso se parece al consumo de Kimball. El 3FN corporativo de Inmon es materia del curso.</p>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>Si el curso pide modelo estrella y FactVentas, el hilo es Kimball. Si la empresa exige un único 3FN antes de cualquier dashboard, el matiz es Inmon. Muchas organizaciones integran al estilo Inmon y publican al estilo Kimball. Puedes cargar con ELT en BigQuery y aun así publicar la estrella: el transporte no elige el modelo.</div>
<div class="trade"><b>Trade-off 3 · Gobierno primero o tablero primero.</b> Ganas con Inmon: una sola definición antes de proliferar marts. Pierdes: el primer dashboard tarda. Ganas con Kimball: un proceso (la venta en caja) ya se puede consultar. Pierdes: sin dimensiones conformadas aparecen métricas gemelas.</div>
<div class="callout warn"><div class="lbl">Error común</div>Tratar ETL/ELT e Inmon/Kimball como la misma elección. El libro describe el ETL clásico. El curso añade ELT. Ninguno de los dos obliga a un 3FN o a una estrella.</div>
`,
mini:{q:'El ETL que describe Kleppmann consiste en…', opts:['Cargar el crudo y transformar solo dentro del DWH (eso es ELT)','Extraer del OLTP (volcado o flujo), transformar a un esquema analítico, limpiar y cargar','Consultar el POS en vivo','Sobrescribir los hechos cada vez que cambia un atributo'], a:1, why:'DDIA p.114: Extract–Transform–Load clásico. El ELT es la variante de curso/nube.'} },
{ id:'m4', tag:'Módulo 4', accent:'orange', title:'Grano y los 4 pasos de Kimball',
summary:'Declarar qué es una fila antes de elegir dimensiones y medidas.',
html: `
<p class="lede">El <strong>grano</strong> dice qué representa una fila de la tabla de hechos. Si no está escrito, el resto del modelo se apoya en un supuesto.</p>
<h3>Dos granos distintos</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Una fila puede ser una línea de ticket, o las ventas del día por tienda y SKU. El segundo grano es más grueso: ya no puedes volver a la línea. La regla es declarar el grano por escrito antes de diseñar dimensiones y medidas. Cambiarlo después obliga a reconstruir los hechos.</div>
<table><tr><th>Grano</th><th>Una fila es…</th><th>Qué ya no puedes preguntar</th></tr>
<tr><td>Fino</td><td>Una línea de ticket (un SKU en un cobro)</td><td>Nada de lo que la línea no traiga</td></tr>
<tr><td>Grueso</td><td>Ventas del día por tienda y SKU</td><td>El ticket, la hora, el cajero de esa línea</td></tr></table>
<h3>Los 4 pasos</h3>
<ol>
<li><strong>Elegir el proceso de negocio</strong> — por ejemplo, registrar la venta en caja.</li>
<li><strong>Declarar el grano</strong> — por ejemplo, la línea de detalle del ticket.</li>
<li><strong>Identificar las dimensiones</strong> — fecha, tienda, producto, cliente, empleado, promoción.</li>
<li><strong>Identificar los hechos (medidas)</strong> — cantidad, importe bruto, descuento, costo, margen.</li>
</ol>
<p>Se repite el método para inventario diario, pedido web o devolución. Cada proceso tiene su propio grano.</p>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.116]</div>"Usually, facts are captured as individual events, because this allows maximum flexibility of analysis later."<br>Capturar el evento suelto (y no un total ya resumido) es la misma razón del grano fino: después se puede agregar de muchas formas. El costo es una tabla de hechos enorme. En la p.117, si el cliente compra varios productos a la vez, cada uno es <strong>una fila distinta</strong> del hecho. Eso es el grano de línea, no el de ticket.</div>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>Proceso: ventas POS. Grano: una fila de <code>fact_ventas</code> es una línea del ticket (un SKU, en un ticket, en un instante de cobro). Un ticket con 5 productos produce 5 filas. Si el grano fuera “el ticket”, sería 1 fila, y hay que decirlo explícitamente. Kleppmann elige las filas separadas “for simplicity” y, sobre todo, para no cerrar el análisis.</div>
<div class="trade"><b>Trade-off 4 · Grano fino.</b> Ganas: puedes agregar hacia arriba (día, categoría, región) sin haberlo decidido el día del diseño. Pierdes: más filas. Una empresa grande puede tener decenas de petabytes de historia, casi toda en tablas de hechos (DDIA p.116).</div>
<div class="callout warn"><div class="lbl">Error común</div>Modelar una fila por ticket cuando el grano escrito es la línea — o al revés — y luego sorprenderse de que la cantidad no cuadra con el POS. Cambiar el grano obliga a reconstruir, no alcanza un UPDATE.</div>
`,
mini:{q:'¿Cuál es el orden de los 4 pasos de Kimball?', opts:['Medidas, SQL, cubo, dashboard','Proceso de negocio, grano, dimensiones, hechos','Staging, ELT, MOLAP, lakehouse','SCD 1, SCD 2, SCD 3, bus'], a:1, why:'Primero el proceso, después qué es una fila, después el contexto y al final las medidas.'} },
{ id:'m5', tag:'Módulo 5', accent:'gold', title:'Estrella, copo, galaxia, FactVentas y columnas',
summary:'Hecho-evento al centro, dimensiones alrededor, y por qué el almacén suele guardar por columna.',
html: `
<p class="lede">Con el grano declarado, la presentación clásica es la <strong>estrella</strong>: una tabla de hechos y dimensiones alrededor. El almacén, además, suele guardar ese hecho <strong>por columnas</strong>, porque la consulta analítica no pide la fila entera.</p>
<h3>Tres esquemas</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Estrella: hecho al centro, dimensiones desnormalizadas, pocos joins. Copo de nieve: la jerarquía de la dimensión se normaliza en tablas hijas; ahorra espacio y suma joins. Galaxia (constelación): varios hechos comparten dimensiones. Eso es el bus de Kimball.</div>
<table><tr><th>Esquema</th><th>Forma</th><th>Conviene recordar</th></tr>
<tr><td>Estrella</td><td>Hecho + dimensiones desnormalizadas</td><td>La consulta se lee de un vistazo</td></tr>
<tr><td>Copo de nieve</td><td>Jerarquías en tablas hijas</td><td>Menos redundancia, más joins</td></tr>
<tr><td>Galaxia</td><td>Varios hechos, dimensiones compartidas</td><td>Una sola <code>dim_producto</code> para ventas, inventario y pedidos</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.115]</div>"Each row of the fact table represents an event that occurred at a particular time (here, each row represents a customer's purchase of a product)."<br>La Fig. 3-9 es la estrella de un supermercado. Al centro, <code>fact_sales</code>. Cada fila es un evento. Si en vez de ventas fuera tráfico web, la fila sería una vista de página o un clic. El nombre “estrella” sale de dibujar el hecho en el medio y las dimensiones como rayos (p.117).</div>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.116]</div>"The dimensions represent the who, what, where, when, how, and why of the event."<br>Unas columnas del hecho son atributos (precio de venta, costo de compra, para poder calcular el margen). Otras son claves foráneas a las <strong>tablas de dimensión</strong>. <code>dim_product</code> trae SKU, descripción, marca, categoría, tamaño. La fecha también suele ser dimensión, para colgar festivos y distinguir venta de feriado y de día normal (p.117).</div>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.117]</div>"Snowflake schemas are more normalized than star schemas, but star schemas are often preferred because they are simpler for analysts to work with."<br>En el copo, marca y categoría son tablas hijas y <code>dim_product</code> apunta con FK, en vez de guardar el texto. Está más normalizado. La estrella se prefiere porque el analista trabaja con menos joins. Las tablas del almacén suelen ser anchas: el hecho pasa de 100 columnas, a veces varios cientos.</div>
<h3>fact_ventas del curso</h3>
<table><tr><th>Columna</th><th>Rol</th></tr>
<tr><td><code>fecha_key</code></td><td>FK a <code>dim_fecha</code></td></tr>
<tr><td><code>tienda_key</code></td><td>FK a <code>dim_tienda</code></td></tr>
<tr><td><code>producto_key</code></td><td>FK a <code>dim_producto</code></td></tr>
<tr><td><code>cliente_key</code></td><td>FK a <code>dim_cliente</code></td></tr>
<tr><td><code>empleado_key</code></td><td>FK a <code>dim_empleado</code></td></tr>
<tr><td><code>ticket_id</code></td><td>Dimensión degenerada</td></tr>
<tr><td><code>cantidad</code>, <code>venta_bruta</code>, <code>descuento</code>, <code>costo</code></td><td>Medidas aditivas</td></tr>
<tr><td><code>margen</code></td><td>Derivada. Kleppmann deja precio y costo en el hecho para poder calcularla</td></tr></table>
<h3>Consulta de la estrella (curso)</h3>
<pre><code>SELECT d.anio, d.mes, p.categoria,
       SUM(f.venta_bruta) AS venta_bruta,
       SUM(f.descuento) AS descuento_total,
       SUM(f.venta_bruta - f.descuento) AS venta_neta,
       SUM(f.cantidad) AS unidades
FROM fact_ventas AS f
INNER JOIN dim_fecha    AS d ON f.fecha_key    = d.fecha_key
INNER JOIN dim_producto AS p ON f.producto_key = p.producto_key
INNER JOIN dim_tienda   AS t ON f.tienda_key   = t.tienda_key
WHERE d.anio = 2025 AND t.region = 'Norte'
GROUP BY d.anio, d.mes, p.categoria
ORDER BY d.anio, d.mes, p.categoria;</code></pre>
<p>El Example 3-1 (DDIA p.118) es la misma forma: <code>fact_sales</code> JOIN <code>dim_date</code> y <code>dim_product</code>, filtro de año y categoría, <code>SUM(quantity)</code> por día de la semana. De un hecho de más de 100 columnas, esa consulta solo toca tres: <code>date_key</code>, <code>product_sk</code> y <code>quantity</code>.</p>
<h3>Por qué el almacén suele ser columnar</h3>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.118]</div>"Don't store all the values from one row together, but store all the values from each column together instead."<br>En un motor por filas (el OLTP típico, o un documento guardado de corrido) hay que leer la fila entera —las 100 columnas— para usar tres. En el column store cada columna va junta (Fig. 3-10): la consulta lee y parsea solo las que necesita. Las filas siguen en el mismo orden en cada archivo de columna, así se puede reconstruir la fila 23 juntando la entrada 23 de cada columna. Parquet es un formato columnar (también para documentos), emparentado con Dremel. No todo almacén es columnar, pero para la consulta ad hoc el almacenamiento por columnas es bastante más rápido y por eso se volvió el patrón habitual (p.123, p.125).</div>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>En Moda Norte un cliente compra 2 camisas y 1 pantalón. El OLTP guarda 1 cabecera y 3 líneas. Con grano de línea, <code>fact_ventas</code> tiene 3 filas, la misma fecha de negocio y el mismo <code>ticket_id</code>. Si el mes siguiente el cliente pasa a VIP, un SCD Type 2 en <code>dim_cliente</code> conserva cómo estaba el día de la compra. La consulta “venta neta por mes y categoría en Norte” no necesita empleado ni costo: un column store puede no leer esas columnas.</div>
<div class="trade"><b>Trade-off 5 · Copo contra estrella.</b> Ganas con el copo: la jerarquía producto, categoría, departamento no se repite como texto en cada fila de la dimensión. Pierdes: la consulta de “ventas por categoría” suma joins. Kleppmann se queda con la estrella porque es más simple para el analista (p.117).</div>
<div class="trade"><b>Trade-off 5b · Fila contra columna.</b> Ganas con la columna: menos bytes desde el disco (el cuello de botella del analítico es el ancho de banda, no el seek) y mejor compresión, porque los valores de una columna se repiten. Pierdes: escribir en el medio de columnas comprimidas y ordenadas es difícil; el insert suele acumularse en memoria y fundirse en lote (p.121–123).</div>
<div class="callout warn"><div class="lbl">Error común</div>Guardar la medida (cantidad, importe) en la dimensión, o tratar <code>ticket_id</code> como si necesitara su propia dimensión enorme. En la línea, el ticket es degenerado. Otro error: creer que “column-oriented” es lo mismo que una column family de Bigtable. Dentro de la familia, Bigtable guarda la fila junta; Kleppmann dice que eso sigue siendo por filas (p.121).</div>
`,
mini:{q:'En la estrella de la Fig. 3-9, una fila de fact_sales es…', opts:['El catálogo entero de un producto','Un evento (la compra de un producto en un momento)','El estado actual del stock','Una columna suelta sin las demás'], a:1, why:'DDIA p.115: el hecho es el evento. Las dimensiones son el quién, qué, dónde, cuándo, cómo y por qué.'} },
{ id:'m6', tag:'Módulo 6', accent:'pink', title:'Medidas, tipos de hecho, claves y dimensiones',
summary:'Qué se puede sumar, qué tipo de hecho usar, y a qué clave apunta la FK.',
html: `
<p class="lede">No toda columna numérica se suma, y no todo hecho es una línea de ticket. La clave que viaja en el hecho es la surrogate, no la del POS.</p>
<h3>Tres medidas</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Aditiva: se suma en todas las dimensiones (cantidad, venta bruta). Semi-aditiva: se suma en algunas, no a lo largo del tiempo (saldo de inventario, cuentas por cobrar). No aditiva: no se suma; se promedia o se recalcula (porcentaje de margen, ratios).</div>
<table><tr><th>Tipo</th><th>Al sumar</th><th>Ejemplo</th></tr>
<tr><td>Aditiva</td><td>En todas las dimensiones</td><td><code>cantidad</code>, <code>venta_bruta</code></td></tr>
<tr><td>Semi-aditiva</td><td>No en el tiempo</td><td><code>saldo_inventario</code></td></tr>
<tr><td>No aditiva</td><td>No sumar</td><td>porcentaje de margen, ratios</td></tr></table>
<h3>Cuatro hechos</h3>
<table><tr><th>Tipo</th><th>Una fila representa</th><th>Ejemplo</th></tr>
<tr><td>Transaccional</td><td>Un evento</td><td><code>fact_ventas</code> por línea de ticket</td></tr>
<tr><td>Snapshot periódico</td><td>El estado al cierre</td><td>Inventario de fin de día</td></tr>
<tr><td>Acumulativo</td><td>Hitos de un proceso largo</td><td>Pedido: creado, enviado, entregado</td></tr>
<tr><td>Factless</td><td>Solo claves; el hecho es que ocurrió</td><td>Asistencia a una promoción, elegibilidad</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.116]</div>En el hecho de la Fig. 3-9, precio y costo viven como atributos de la fila-evento precisamente para poder calcular el margen. El quién / qué / dónde / cuándo no se copia como texto largo: va como FK a la dimensión. La clasificación aditiva / semi-aditiva / factless es del curso (Kimball). El libro no la nombra; sí insiste en que el hecho guarde el evento y deje el contexto en dimensiones, a menudo muy anchas (la tienda, con panadería, metros, fecha de apertura, distancia a la carretera: p.117).</div>
<h3>Natural y surrogate</h3>
<p>La <strong>clave natural</strong> viene del origen: SKU, cédula, número de ticket. La <strong>surrogate</strong> (<code>*_key</code>, entero o UUID) es la clave técnica del DWH y no cambia cuando el origen recicla un código. La FK del hecho apunta a la surrogate. La natural vive en la dimensión, indexada. En el ejemplo de Kleppmann esa surrogate aparece como <code>product_sk</code>.</p>
<h3>Dimensiones que no son “la tienda”</h3>
<table><tr><th>Dimensión</th><th>Para qué</th></tr>
<tr><td>Conformada</td><td>La misma definición en varios hechos (<code>dim_fecha</code>, <code>dim_producto</code>)</td></tr>
<tr><td>Degenerada</td><td>Atributo del evento sin tabla propia (<code>ticket_id</code>, número de línea)</td></tr>
<tr><td>Junk</td><td>Flags de baja cardinalidad juntos (tipo de pago, canal, promo)</td></tr>
<tr><td>Role-playing</td><td>Una <code>dim_fecha</code> física, dos roles: <code>fecha_venta_key</code> y <code>fecha_envio_key</code></td></tr>
<tr><td>Fecha</td><td>Día, semana, mes, trimestre, año, calendario fiscal y, en DDIA, feriados</td></tr></table>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>El POS manda <code>tipo_pago</code>, <code>canal</code> y <code>flag_promo</code> como códigos sueltos. En vez de tres mini-dimensiones, una junk combina las combinaciones frecuentes y el hecho no se llena de banderas. El saldo de inventario no se suma día con día: es otra tabla de hechos (snapshot), no una medida más de <code>fact_ventas</code>.</div>
<div class="callout info"><div class="lbl">Fuente · [Kimball]</div>Tres tipos de hecho con física distinta: <strong>transaccional</strong> (evento puntual, disperso: solo filas que ocurrieron), <strong>snapshot periódico</strong> (foto a intervalo fijo, denso: inserta 0 si no hay stock) y <strong>acumulativo</strong> (pipeline con hitos; la fila se actualiza y guarda lags entre etapas). El factless de cobertura (producto×tienda×día en promoción) sirve para preguntar “qué no se vendió” sin inflar <code>fact_ventas</code> con ceros ficticios.</div>
<h3>Trampas que caen en el examen</h3>
<div class="callout warn"><div class="lbl">[Kimball]</div>
<ul>
<li><strong>AVG sobre semi-aditivos:</strong> <code>AVG(saldo)</code> promedia todas las filas (día×SKU×tienda), no “por día”. Lo correcto suele ser <code>SUM(saldo) / COUNT(DISTINCT fecha_key)</code>.</li>
<li><strong>FK NULL en el hecho:</strong> un <code>INNER JOIN</code> a promoción o cajero hace desaparecer esas ventas. Usa fila surrogate “Sin promoción” / “Sin cajero”.</li>
<li><strong>NULL en atributos de dimensión; 0 en métricas desconocidas:</strong> en dim, escribe <code>Unknown</code> / <code>N/A</code>. En hechos, métrica faltante = <code>NULL</code> (así <code>AVG</code>/<code>MIN</code> no se sesgan con ceros).</li>
<li><strong>Role-playing sin alias:</strong> unir dos FKs de fecha a la misma instancia de <code>dim_fecha</code> fuerza “mismo día”. Haz dos alias o vistas.</li>
<li><strong>Join fact-to-fact:</strong> unir envíos con devoluciones por cliente/producto multiplica sumas. Usa <strong>drill-across</strong>: agregar cada hecho por separado y unir el resultado.</li>
<li><strong>Violar el grano con flete:</strong> copiar el costo de envío del encabezado en cada línea triplica el flete al sumar. Asigna (allocate) o usa un hecho de encabezado aparte.</li>
</ul>
</div>
<div class="trade"><b>Trade-off 6 · Surrogate en la FK.</b> Ganas: el hecho no se entera si el origen cambia el código del SKU, y el SCD Type 2 puede tener varias filas para la misma natural. Pierdes: un join de más y una clave que el cajero no reconoce.</div>
<div class="callout warn"><div class="lbl">Error común</div>Sumar <code>saldo_inventario</code> de todos los días del mes y llamar a eso “inventario del mes”. Es un saldo: se toma el cierre, no se acumulan las fotos. Tampoco se suma un porcentaje de margen como si fuera un importe.</div>
`,
mini:{q:'¿A qué clave debe apuntar la FK de fact_ventas?', opts:['A la clave natural del POS (el SKU o la cédula)','A la surrogate key de la dimensión','Al batch_id de staging','Al nombre del cliente en texto'], a:1, why:'La surrogate es estable. La natural se queda como atributo de la dimensión. En DDIA, product_sk juega ese papel.'} },
{ id:'m7', tag:'Módulo 7', accent:'teal', title:'SCD y la Bus Matrix del retail',
summary:'Type 1 pisa el valor, Type 2 abre una fila, y la matriz dice qué hecho usa qué dimensión.',
html: `
<p class="lede">Los atributos cambian despacio: el segmento, la ciudad, la categoría. El <strong>SCD</strong> decide si el pasado se conserva. La <strong>bus matrix</strong> decide qué dimensiones se comparten.</p>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.116]</div>Kleppmann, en este capítulo, no desarrolla las slowly changing dimensions. El SCD es materia del curso y de Kimball. Lo que el libro sí fija es el papel de la dimensión: el quién, qué, dónde, cuándo, cómo y por qué del evento. La bus matrix del curso es el plano de cuáles de esos “rayos” usa cada hecho. Si un atributo de cliente cambia y pisas la fila, el evento viejo cambia de significado: por eso el curso enseña el Type 2, aunque no esté en la Fig. 3-9.</div>
<h3>Tipos 0 a 6, con peso en 1–3</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Type 0 no actualiza. Type 1 sobrescribe y pierde historia. Type 2 agrega una fila con vigencia e <code>is_current</code>. Type 3 agrega una columna “valor anterior” (solo un cambio). Type 4 manda lo volátil a una mini-dimensión. Type 5 mezcla 1 y 4. Type 6 mezcla 1, 2 y 3; es raro.</div>
<table><tr><th>Tipo</th><th>Nombre usual</th><th>Qué pasa con el atributo</th></tr>
<tr><td>0</td><td>Retain original</td><td>Se queda el primer valor</td></tr>
<tr><td>1</td><td>Overwrite</td><td>Se pisa; el análisis viejo cambia de significado</td></tr>
<tr><td>2</td><td>Add new row</td><td>Nueva fila, <code>effective_from</code> / <code>effective_to</code> / <code>is_current</code></td></tr>
<tr><td>3</td><td>Add new column</td><td>Columna del valor anterior; historial corto</td></tr>
<tr><td>4–6</td><td>Mini-dim e híbridos</td><td>Lo volátil se aparta, o se combinan 1, 2 y 3</td></tr></table>
<h3>Type 2 en dim_cliente</h3>
<p>Natural <code>C-1001</code>. La surrogate cambia cuando cambia el segmento.</p>
<table><tr><th>cliente_key</th><th>natural</th><th>nombre</th><th>segmento</th><th>ciudad</th><th>effective_from</th><th>effective_to</th><th>is_current</th></tr>
<tr><td>501</td><td>C-1001</td><td>Ana López</td><td>Standard</td><td>San José</td><td>2024-01-01</td><td>2025-06-30</td><td>N</td></tr>
<tr><td>502</td><td>C-1001</td><td>Ana López</td><td>VIP</td><td>San José</td><td>2025-07-01</td><td>9999-12-31</td><td>Y</td></tr></table>
<p>Las ventas de enero siguen en <code>cliente_key = 501</code>. Las cargas nuevas, con <code>is_current = Y</code>, resuelven a 502. El hecho no se reescribe.</p>
<h3>Bus matrix retail</h3>
<p>Filas = procesos (tablas de hechos). Columnas = dimensiones conformadas. La X marca que ese hecho usa esa dimensión.</p>
<table><tr><th>Hecho</th><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Tienda</th><th>Empleado</th></tr>
<tr><td>Ventas</td><td>X</td><td>X</td><td>X</td><td>X</td><td>X</td></tr>
<tr><td>Inventario</td><td>X</td><td></td><td>X</td><td>X</td><td></td></tr>
<tr><td>Pedidos</td><td>X</td><td>X</td><td>X</td><td>X</td><td>X</td></tr></table>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>Ventas usa todas: es la línea de caja. Inventario es una foto por fecha, producto y tienda; en ese grano no hay cliente ni empleado. Pedidos se parece a ventas y puede usar la misma <code>dim_fecha</code> en dos roles (pedido y entrega). El beneficio de la matriz es diseñar una sola <code>dim_producto</code> para los tres hechos, la misma idea de dimensión compartida que en la estrella de la Fig. 3-9.</div>
<div class="trade"><b>Trade-off 7 · SCD Type 2.</b> Ganas: el reporte de “ventas VIP” de enero no se contamina cuando Ana cambia de segmento en julio. Pierdes: la dimensión crece una fila por cambio y el ETL tiene que cerrar la vigencia anterior.</div>
<div class="callout warn"><div class="lbl">Error común</div>Actualizar <code>cliente_key</code> en los hechos viejos cuando el cliente pasa a VIP. Eso es un Type 1 disfrazado: reescribes la historia. Y no atribuyas el SCD al capítulo 3 de DDIA: ahí no está el mecanismo de vigencia.</div>
`,
mini:{q:'Ana pasa a VIP el 2025-07-01 (SCD Type 2). ¿Qué pasa con las ventas de enero?', opts:['Se reescriben a cliente_key 502','Siguen en cliente_key 501, la fila que estaba vigente','Se borran del hecho','Pasan a una junk dimension'], a:1, why:'El hecho guarda la surrogate de ese día. La fila 502 solo aplica desde julio. El SCD es del curso, no el foco de DDIA.'} },
{ id:'m8', tag:'Módulo 8', accent:'blue', title:'OLAP, arquitecturas de cubo, columnas y lakehouse',
summary:'Roll-up, slice y dice; MOLAP, ROLAP y HOLAP; cubo materializado y nube.',
html: `
<p class="lede">OLAP es la forma de recorrer el cubo. MOLAP, ROLAP y HOLAP dicen dónde viven los agregados. La nube cambia el motor, no el grano ni el SCD. El beneficio de fondo sigue siendo el de Kleppmann: barrer historia sin leer columnas de más.</p>
<h3>Cinco operaciones</h3>
<div class="callout info"><div class="lbl">Fuente · [resumen]</div>Roll-up (drill-up) sube la jerarquía y agrega más: día a mes. Drill-down baja: mes a día. Slice fija una dimensión (solo Norte). Dice fija varias y deja un subcubo (2025 y Ropa). Pivot rota filas y columnas (tienda en columnas, mes en filas).</div>
<table><tr><th>Operación</th><th>Idea</th><th>Ejemplo</th></tr>
<tr><td>Roll-up</td><td>Más agregado</td><td>Día → mes</td></tr>
<tr><td>Drill-down</td><td>Más detalle</td><td>Mes → día</td></tr>
<tr><td>Slice</td><td>Una dimensión fija</td><td>Solo región Norte</td></tr>
<tr><td>Dice</td><td>Varias dimensiones fijas</td><td>2025 y categoría Ropa</td></tr>
<tr><td>Pivot</td><td>Rotar ejes</td><td>Tienda en columnas, mes en filas</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.115]</div>Las herramientas gráficas de BI generan SQL, dibujan el resultado y dejan al analista explorar con operaciones como <strong>drill-down</strong> y <strong>slicing and dicing</strong>. El curso parte “slice and dice” en dos: slice fija una dimensión, dice fija varias. El libro las nombra juntas como la forma interactiva de recorrer el almacén.</div>
<h3>MOLAP, ROLAP, HOLAP</h3>
<table><tr><th></th><th>Dónde está el dato</th><th>Velocidad</th><th>Flexibilidad</th></tr>
<tr><td>MOLAP</td><td>Cubos pre-agregados</td><td>Muy rápida en lo que el cubo ya tiene</td><td>Poco ad hoc</td></tr>
<tr><td>ROLAP</td><td>Estrella en un motor relacional</td><td>La del SQL</td><td>Alta: es una consulta</td></tr>
<tr><td>HOLAP</td><td>Cubo + relacional</td><td>Balance</td><td>El compromiso clásico</td></tr></table>
<div class="callout info"><div class="lbl">Fuente · [DDIA · p.124]</div>"A data cube doesn't have the same flexibility as querying the raw data."<br>El cubo OLAP (Fig. 3-12) es una vista materializada: una grilla de agregados por dimensiones. Si cada celda ya tiene la suma, “ventas de ayer por tienda” es una lectura, no un barrido de millones de filas. La contra: no puedes preguntar qué parte de las ventas vino de ítems de más de 100 dólares si el precio no es una de las dimensiones. Por eso el almacén guarda el dato crudo y usa el cubo solo como atajo. MOLAP se parece a ese cubo precalculado. ROLAP es la estrella consultada con SQL, a menudo sobre un column store, que es justo donde la consulta ad hoc se acelera (p.123, p.125: el cuello es el ancho de banda del disco, no el seek).</div>
<h3>Nube, MPP y lakehouse</h3>
<ul>
<li><strong>Cloud DWH:</strong> Snowflake, BigQuery, Redshift, Synapse. Cómputo y storage separados, escala elástica, ELT nativo. Redshift, en el libro, es el ParAccel hospedado (p.115). Al lado lista SQL-sobre-Hadoop de esa época: Hive, Spark SQL, Impala, Presto, Drill.</li>
<li><strong>MPP:</strong> la consulta se parte en subtareas. Cada nodo trae CPU, RAM y disco; un coordinador reparte el SQL y junta el resultado. El almacén también guarda en columnas, en la misma idea que Parquet.</li>
<li><strong>Data lake:</strong> object storage con Parquet, Delta o Iceberg; crudo y curated. Parquet es el formato columnar que Kleppmann ya cita (p.118).</li>
<li><strong>Lakehouse:</strong> el costo del lake, transacciones ACID y SQL sobre tablas, para analítica y ML, sin copiar todo a un DWH clásico. Es posterior al capítulo; la idea de “SQL analítico sobre datos columnares” no.</li>
</ul>
<div class="callout info"><div class="lbl">Fuente · [quiz16]</div><strong>Medallón (Bronze / Silver / Gold).</strong> <em>Bronze:</em> aterrizaje crudo con timestamp; no se borra ni se edita (respaldo inmutable). <em>Silver:</em> Spark limpia (duplicados, nulos, tipos) y escribe Parquet. <em>Gold:</em> agregados listos para negocio; de ahí se alimenta el DWH o el BI. Un lago de archivos sueltos sin capa de logs no hacía borrados/cambios atómicos; Delta/Iceberg añaden el log de transacciones y el time travel.</div>
<p>Patrón actual: landing en el lake (Bronze → Silver → Gold), y BI servido desde el DWH o desde el lakehouse según el SLA.</p>
<div class="callout tip"><div class="lbl">Didáctico · caso retail</div>Para el examen mandan la estrella, Kimball, el SCD Type 2, la bus matrix y la diferencia OLTP/OLAP. La nube es el mismo diseño sobre otro motor: el grano de la línea de ticket no cambia porque el destino se llame BigQuery. Si el tablero de “venta por tienda ayer” va lento, un agregado materializado (el cubo) lo acelera; si mañana preguntan por el precio unitario, hay que volver al hecho crudo.</div>
<div class="trade"><b>Trade-off 8 · Cubo precalculado.</b> Ganas con MOLAP o con el data cube: la pregunta prevista responde de inmediato. Pierdes: una pregunta cuyo eje no está en el cubo no se puede contestar ahí (DDIA p.124). ROLAP aguanta el ad hoc y paga el escaneo, más barato si el motor es columnar.</div>
<div class="callout warn"><div class="lbl">Error común</div>Llamar slice a “2025 y Ropa”. Fijar una sola dimensión es slice. Fijar dos o más es dice, un subcubo. Otro: tirar el dato crudo porque “ya está el cubo”. Sin el hecho, la pregunta nueva no existe.</div>
`,
mini:{q:'Fijar año 2025 y categoría Ropa al mismo tiempo es…', opts:['Un roll-up','Un slice (una sola dimensión)','Un dice (subcubo de varias dimensiones)','Un SCD Type 1'], a:2, why:'Slice fija una. Dice recorta por varias dimensiones a la vez. DDIA habla de slicing and dicing como exploración interactiva (p.115).'} }
];

const QUIZ = [
{tag:'Inmon', c:'gold', q:'Un Data Warehouse, en la definición de Inmon que usa el curso, es sobre todo…', opts:['La base de la caja, actualizada en cada ticket','Un repositorio analítico integrado, por sujeto, con historial y carga no volátil','Un data lake sin tablas','Solo un cubo MOLAP'], a:1, why:'Integra fuentes, organiza por sujeto de negocio y conserva el pasado. No es el OLTP.'},
{tag:'Inmon', c:'gold', q:'“No volátil” en el DWH implica…', opts:['Un UPDATE masivo de hechos ya cargados, igual que en OLTP','Carga por lotes: el hecho cargado no se edita como una transacción abierta','Borrar el historial cada noche','Guardar todo solo en RAM'], a:1, why:'La carga es periódica. Corregir el pasado reescribiendo hechos rompe el rasgo.'},
{tag:'DDIA', c:'gold', q:'Kleppmann separa el almacén del OLTP porque…', opts:['El analista consulta esa otra base sin afectar las transacciones operacionales','SQL no puede sumar dentro del POS','El DWH borra la copia de lectura después de cada consulta','Los índices analíticos viven obligatoriamente en la caja'], a:0, why:'DDIA p.114: separate database that analysts can query without affecting OLTP operations. El escaneo ad hoc, p.113, daña las transacciones concurrentes.'},
{tag:'DDIA', c:'blue', q:'Según la Table 3-1 (DDIA), el sistema analítico se reconoce porque…', opts:['Lee pocos registros por clave y guarda solo el estado actual','Agrega sobre muchos registros, carga por ETL o flujo, y guarda historia de eventos','Lo usa el cliente final en la web, con escrituras de milisegundos','Su dataset cabe en una hoja de cálculo'], a:1, why:'p.113: aggregate over many records; bulk import (ETL) or event stream; history of events; analyst, not end user.'},
{tag:'OLTP/OLAP', c:'blue', q:'¿Cuál de estas preguntas es OLTP?', opts:['¿Qué categoría creció más en Q3 en la zona Norte?','¿Hay stock del SKU 8842 en la tienda Central?','Ventas por región, este año contra el anterior','Ingreso total de cada tienda en enero'], a:1, why:'El stock de un SKU es una clave y el estado de ahora. Las otras son agregados sobre historia. La de enero es el ejemplo de DDIA p.112.'},
{tag:'OLTP/OLAP', c:'blue', q:'En el contraste del curso, la normalización típica es…', opts:['OLTP desnormalizado y OLAP en 3FN','OLTP en 3FN o más, y OLAP en estrella','Los dos siempre en copo de nieve','Ninguno de los dos usa claves'], a:1, why:'El operacional se normaliza para escribir bien. El analítico se desnormaliza para agregar con pocos joins.'},
{tag:'Arquitectura', c:'purple', q:'El flujo de arquitectura del curso es…', opts:['Fuentes → staging → DWH → marts → BI','BI → marts → staging → fuentes','Marts → OLTP → cubo → staging','DWH → fuentes → BI → staging'], a:0, why:'Primero se aterriza, después se integra, después se recorta por dominio y al final se consulta. DDIA dibuja el ETL más corto (Fig. 3-8).'},
{tag:'Arquitectura', c:'purple', q:'En staging lo que corresponde es…', opts:['Calcular el margen neto y aplicar SCD','Aterrizar el lote crudo, con batch_id y sin reglas de negocio complejas','Publicar el dashboard de gerencia','Borrar la clave natural para ahorrar espacio'], a:1, why:'Staging deja rastro del archivo o del lote. La regla de negocio espera al DWH.'},
{tag:'Arquitectura', c:'purple', q:'Un mart independiente…', opts:['Siempre es una vista del DWH corporativo','Se arma directo desde las fuentes: rápido, con riesgo de silos','No puede tener dimensiones','Solo existe en MOLAP'], a:1, why:'Gana velocidad local y puede definir la métrica distinto al resto de la empresa.'},
{tag:'Arquitectura', c:'purple', q:'Logs de carga, filas rechazadas y el watermark son metadatos…', opts:['De negocio (definición de venta neta)','Operacionales','De la jerarquía fiscal, únicamente','Del color del dashboard'], a:1, why:'Hablan de cómo corrió la carga, no de qué significa la métrica.'},
{tag:'ETL/ELT', c:'teal', q:'En ETL, la transformación ocurre…', opts:['En el navegador, al abrir el tablero','En un motor de integración, antes de cargar al destino','Solo dentro del POS','Después de que el analista exporta a Excel'], a:1, why:'Extract, Transform, Load: el destino recibe el dato ya conformado.'},
{tag:'ETL/ELT', c:'teal', q:'ELT encaja especialmente cuando…', opts:['El destino analítico escala y la transformación es SQL (Snowflake, BigQuery, dbt)','No hay dónde dejar el crudo','Se quiere evitar SQL por completo','El OLTP ejecuta los joins del dashboard'], a:0, why:'Se carga raw y se transforma dentro del motor del almacén o del lake. Kleppmann describe el ETL clásico, no esta variante.'},
{tag:'DDIA', c:'teal', q:'El ETL clásico de Kleppmann extrae del OLTP mediante…', opts:['Solo un SELECT ad hoc en hora pico','Un volcado periódico o un flujo continuo de cambios, luego transforma, limpia y carga','Un SCD Type 2 dentro del POS','Un cubo MOLAP sin copia'], a:1, why:'DDIA p.114: periodic data dump or a continuous stream of updates, then transform into an analysis-friendly schema, clean, load.'},
{tag:'Kimball', c:'teal', q:'El núcleo que describe Inmon, frente al de Kimball, es…', opts:['Una estrella en todo el bus desde el primer día, igual que Kimball','Un DWH relacional en 3FN, top-down; Kimball es dimensional y bottom-up','Solo junk dimensions','Un data lake sin modelo'], a:1, why:'Inmon integra en 3FN. Kimball publica hechos y dimensiones conformadas por proceso. DDIA no elige: dice que el estilo analítico habitual es la estrella.'},
{tag:'Grain', c:'orange', q:'El grano de una tabla de hechos es…', opts:['La cantidad de dimensiones','Qué representa una fila','El tipo de SCD elegido','El watermark del staging'], a:1, why:'Se escribe antes de diseñar dimensiones y medidas. Cambiarlo reconstruye los hechos.'},
{tag:'Grain', c:'orange', q:'Los 4 pasos de Kimball, en orden, son…', opts:['Medidas, SQL, cubo, dashboard','Proceso de negocio, grano, dimensiones, hechos','Staging, ELT, MOLAP, lakehouse','SCD 1, SCD 2, SCD 3 y la bus matrix'], a:1, why:'Proceso, luego la fila, luego el contexto, luego las medidas.'},
{tag:'Grain', c:'orange', q:'El grano es la línea y el cliente compra 5 productos distintos. ¿Cuántas filas hay en el hecho?', opts:['1, el total del ticket','5, una por producto','0 hasta el cierre de mes','Una por tienda y por día, siempre'], a:1, why:'Curso: 5 líneas. DDIA p.117: several different products at once are separate rows in the fact table.'},
{tag:'Estrella', c:'gold', q:'El esquema estrella coloca…', opts:['Las jerarquías normalizadas en muchas tablas hijas','El hecho al centro y las dimensiones desnormalizadas','Solo metadatos, sin medidas','Hechos sin claves foráneas'], a:1, why:'Pocos joins. El copo es el que parte la dimensión. Fig. 3-9, DDIA p.115.'},
{tag:'DDIA', c:'gold', q:'En la estrella de Kleppmann, la fila del hecho representa…', opts:['El catálogo de un producto (SKU, marca, categoría)','Un evento en un momento, por ejemplo la compra de un producto','El organigrama de la empresa','Una column family de Bigtable'], a:1, why:'DDIA p.115: each row of the fact table represents an event. Las dimensiones son who, what, where, when, how, why (p.116).'},
{tag:'DDIA', c:'gold', q:'El copo de nieve, comparado con la estrella, en DDIA…', opts:['Está más normalizado, pero la estrella se prefiere porque es más simple para el analista','Siempre tiene menos joins','Prohíbe las claves foráneas','Es obligatorio en todo almacén columnar'], a:0, why:'p.117: snowflake schemas are more normalized, but star schemas are often preferred because they are simpler for analysts.'},
{tag:'Medidas', c:'pink', q:'El saldo de inventario al cierre del día es…', opts:['Aditivo en el tiempo: se suman los saldos de cada día','Semi-aditivo: no se suma a lo largo de los días','Una junk dimension','Un hecho factless'], a:1, why:'Puedes sumar saldos entre tiendas el mismo día. Sumar lunes+martes doble-cuenta existencia. cantidad y venta_bruta, en cambio, sí son aditivas.'},
{tag:'Medidas', c:'pink', q:'La clave foránea del hecho hacia la dimensión debe apuntar a…', opts:['La clave natural del sistema origen','La surrogate key de la dimensión','El batch_id de staging','El nombre del cliente en texto libre'], a:1, why:'La surrogate no cambia cuando el origen recicla un código, y permite varias versiones SCD. En DDIA ese papel lo cumple product_sk.'},
{tag:'Medidas', c:'pink', q:'ticket_id dentro de fact_ventas, sin tabla de dimensión propia, es una dimensión…', opts:['Conformada','Degenerada','Role-playing de la fecha','Junk de inventario'], a:1, why:'Es un atributo del evento. Se repite en las líneas del mismo ticket.'},
{tag:'Medidas', c:'pink', q:'fecha_venta_key y fecha_envio_key apuntando a la misma dim_fecha son…', opts:['Dos copos de nieve','Role-playing: una dimensión física, dos roles','Un SCD Type 3','Una medida no aditiva'], a:1, why:'No se duplica el calendario. El hecho usa la misma dimensión con dos significados. DDIA ya trata la fecha como dimensión (p.117).'},
{tag:'SCD', c:'teal', q:'Ana pasa a VIP el 2025-07-01 con SCD Type 2. Las ventas de enero…', opts:['Se reescriben a cliente_key 502','Siguen con cliente_key 501','Se eliminan de fact_ventas','Se mudan a una junk dimension'], a:1, why:'501 cubre hasta 2025-06-30. 502 queda is_current = Y desde julio. El hecho no se toca. Type 1 habría pisado el segmento.'},
{tag:'SCD', c:'teal', q:'El SCD Type 2 (vigencia, is_current) en este curso…', opts:['Es el tema central de la Fig. 3-9 de Kleppmann','Es modelado de Kimball / del curso; el cap. 3 de DDIA no lo desarrolla','Obliga a guardar el hecho por filas','Reemplaza a la bus matrix'], a:1, why:'DDIA p.116 fija el rol de la dimensión, no el versionado lento. No atribuyas el SCD al libro.'},
{tag:'SCD', c:'teal', q:'En la bus matrix retail, el hecho Inventario marca…', opts:['Fecha, cliente, producto, tienda y empleado','Fecha, producto y tienda','Solo empleado','Ninguna dimensión'], a:1, why:'El grano típico es la foto por día, SKU y tienda. No hay cliente ni cajero.'},
{tag:'OLAP', c:'blue', q:'Roll-up (drill-up) consiste en…', opts:['Bajar de mes a día','Subir en la jerarquía y agregar (día → mes)','Fijar solo la región Norte','Rotar filas y columnas'], a:1, why:'Más agregado. Bajar es drill-down. Fijar una dimensión es slice. DDIA p.115 menciona drill-down entre las operaciones de exploración.'},
{tag:'OLAP', c:'blue', q:'Slice y dice se distinguen porque…', opts:['Slice fija una dimensión y dice fija varias (un subcubo)','Son el mismo operador con otro nombre','Dice solo existe en MOLAP','Slice suma medidas no aditivas'], a:0, why:'Norte solo = slice. 2025 y Ropa = dice. El libro dice slicing and dicing para esa exploración.'},
{tag:'DDIA', c:'blue', q:'Un column store le conviene al almacén analítico porque…', opts:['La consulta lee las cien columnas de cada fila','Lee del disco solo las pocas columnas que usa','Es lo mismo que una column family de Bigtable','Hace barato el UPDATE in-place de una celda'], a:1, why:'DDIA p.117–118: no guardes la fila junta; guarda cada columna junta. p.125: el cuello es el ancho de banda. No todo DWH es columnar, pero el ad hoc se acelera (p.123).'},
{tag:'DDIA', c:'blue', q:'El data cube (OLAP cube) de Kleppmann acelera agregados, pero…', opts:['Responde cualquier filtro, aunque no sea dimensión','No responde un filtro que no quedó como dimensión','Reemplaza para siempre a la tabla de hechos','Solo existe dentro del sistema OLTP'], a:1, why:'DDIA p.124: a data cube does not have the same flexibility as querying the raw data. Se guarda el crudo y el cubo es un atajo.'},
{tag:'OLAP', c:'blue', q:'MOLAP se reconoce porque…', opts:['Deja toda pregunta como SQL ad hoc, sin agregados previos','Precalcula cubos: muy rápido en lo definido, menos flexible','Es idéntico a un data lake de archivos sueltos','No permite roll-up'], a:1, why:'El cubo ya trae el agregado. ROLAP resuelve con la estrella relacional. HOLAP mezcla los dos.'},
{tag:'OLAP', c:'blue', q:'Un lakehouse, frente a “solo lake” o “solo DWH clásico”, aporta…', opts:['CSV enviado por correo','Storage económico de objetos con tablas ACID y SQL, sin copiar todo a un almacén clásico','La desaparición del grano','SCD Type 1 automático'], a:1, why:'Delta o Iceberg suman transacción y SQL al lake. Parquet, el formato columnar que cita DDIA p.118, es parte de ese camino. El modelado dimensional sigue haciendo falta.'},
{tag:'Lake', c:'blue', q:'En el medallón del lago, la capa Bronze…', opts:['Ya trae ventas totales por mes listas para BI','Guarda el crudo con timestamp y no se edita','Es solo el DWH en 3FN','Borra el historial cada noche'], a:1, why:'[quiz16] Bronze = aterrizaje inmutable. Silver limpia; Gold agrega para el negocio.'},
{tag:'Lake', c:'blue', q:'MPP en un Cloud DWH significa sobre todo…', opts:['Una sola CPU lee todas las filas en serie','Un coordinador parte la consulta y cada nodo trabaja su trozo','Que el POS ejecuta el GROUP BY','Que no hace falta almacenamiento columnar'], a:1, why:'[quiz16] Cada nodo tiene CPU/RAM/disco; juntan el resultado al final.'},
{tag:'Kimball', c:'pink', q:'En un snapshot de inventario, AVG(saldo) por tienda…', opts:['Da el promedio diario exacto de la tienda','Promedia todas las filas (día×SKU), no “por día”','Falla porque SQL prohíbe AVG en semi-aditivos','Multiplica el saldo por el número de días'], a:1, why:'[Kimball] Lo semi-aditivo no se “arregla” solo con AVG. Suele hacer falta SUM(saldo)/COUNT(DISTINCT fecha).'},
{tag:'Kimball', c:'pink', q:'Si Promotion_Key queda NULL en el hecho y haces INNER JOIN…', opts:['Las ventas sin promo entran igual','Esas ventas desaparecen del total','SQL convierte NULL en la PK 0','El join se vuelve OUTER solo'], a:1, why:'[Kimball] NULL = PK no coincide. Usa una fila surrogate “Sin promoción”.'},
{tag:'Kimball', c:'pink', q:'Unir Order_Date_Key y Ship_Date_Key al mismo alias de dim_fecha…', opts:['Suma bien por año de envío','Solo deja pedidos con pedido y envío el mismo día','Duplica cada venta (cartesiano)','Obliga a snowflaking'], a:1, why:'[Kimball] Role-playing pide dos alias o vistas. Un AND sobre la misma fila fuerza igualdad de fechas.'},
{tag:'Kimball', c:'orange', q:'JOIN directo entre fact_envios y fact_devoluciones por cliente/SKU…', opts:['Es el drill-across correcto','Multiplica sumas (cartesiano parcial)','Solo falla si hay distinto grano','Es obligatorio con dimensiones conformadas'], a:1, why:'[Kimball] Agrega cada hecho por separado y une el resultado (drill-across).'},
{tag:'Kimball', c:'orange', q:'Copiar el flete del encabezado en cada línea del hecho…', opts:['Respeta el grano de línea','Triplica el flete al hacer SUM','Es la forma estándar de allocate','Convierte el flete en medida no aditiva'], a:1, why:'[Kimball] Violaste el grano. Asigna el flete a líneas o usa un hecho de encabezado.'},
{tag:'Kimball', c:'teal', q:'Para “¿qué productos en promo tuvieron 0 ventas?” Kimball recomienda…', opts:['Insertar filas con cantidad=0 en fact_ventas','Una factless de cobertura menos la actividad real','Borrar el grano atómico','Un SCD Type 1 en producto'], a:1, why:'[Kimball] Coverage factless + sales; no infles el hecho transaccional con “no eventos”.'}
];

const CASES = [
{ title:'Caso 1 · Tres Excel de “venta”', prompt:'Cada gerencia exporta el POS con una definición distinta de venta (con IVA, sin devoluciones, o solo tienda propia). ¿Qué problema de Inmon hay y qué resuelve el DWH?', solution:'<strong>Falta integración y sujeto común.</strong> El DWH unifica la definición de venta neta, la moneda y la clave de tienda, y deja el historial en un solo lugar. <strong>Trade-off:</strong> todos cuadran el mismo número, pero el número es el del último lote, no el de la caja en este segundo.', h1:'¿Cuál de los 4 rasgos habla de nomenclatura y unidades?', h2:'¿Qué pregunta no debe responder el DWH?', rubric:'Rúbrica: 2 rasgos de Inmon + 2 qué unifica el almacén + 1 trade-off de frescura.'},
{ title:'Caso 2 · El reporte corre en el POS', prompt:'Finanzas lanza “ventas por categoría, tres años, todas las tiendas” sobre la base de producción un sábado de rebajas. La caja se pone lenta. ¿Qué está mal, dónde debe vivir esa consulta, y cómo lo diría Kleppmann?', solution:'<strong>Mezclaron OLAP con OLTP.</strong> El agregado barre historia y compite con las transacciones del cobro (DDIA p.113). El analista debería consultar el almacén, una copia de lectura, sin afectar el OLTP (p.114). <strong>Trade-off:</strong> el tablero puede ir unos minutos atrás respecto del ticket que se está pagando.', h1:'¿Qué patrón de lectura describe la Table 3-1 para OLAP?', h2:'¿Qué modelo usa el OLTP del curso y cuál el OLAP?', rubric:'Rúbrica: 2 diferencia OLTP/OLAP + 2 cita de por qué separar + 1 trade-off.'},
{ title:'Caso 3 · Staging que ya calcula el margen', prompt:'stg_pos_ventas llega sin batch_id, convierte moneda “a ojo” y ya trae el margen neto y el segmento VIP. Al día siguiente el archivo fuente no se puede reprocesar. ¿Qué romper del checklist?', solution:'<strong>Staging debe aterrizar, no decidir el negocio.</strong> Hace falta lote, zona horaria, cast explícito y rechazos. El margen y el SCD van en el DWH. Sin linaje no hay reproceso. <strong>Trade-off:</strong> una capa más de tablas, a cambio de poder volver a correr la regla cuando cambie la definición de margen.', h1:'¿Qué metadato operacional falta si no hay watermark ni lote?', h2:'¿Mart dependiente o independiente empeora si cada área calcula el margen en su staging?', rubric:'Rúbrica: 2 rol de staging + 2 reglas que sobran + 1 trade-off.'},
{ title:'Caso 4 · ETL clásico o ELT hacia BigQuery', prompt:'El retail va a Snowflake o BigQuery. Las fuentes son POS, un CSV de inventario y una API de pedidos. ¿Qué describiría Kleppmann, qué harías tú en la nube, y eso obliga a elegir Inmon o Kimball?', solution:'<strong>DDIA p.114 describe ETL clásico:</strong> volcado o flujo, transformar a un esquema analítico, limpiar, cargar. <strong>En esos motores el curso prefiere ELT:</strong> aterrizar raw y transformar con SQL en el destino. <strong>No obliga el modelado:</strong> puedes integrar al estilo Inmon y publicar FactVentas en estrella. <strong>Trade-off:</strong> el crudo ocupa storage; la regla queda en SQL versionado.', h1:'¿Dónde transforma ELT?', h2:'¿Por qué Inmon y Kimball no se excluyen?', rubric:'Rúbrica: 2 ETL de DDIA vs ELT + 2 modelado + 1 trade-off.'},
{ title:'Caso 5 · Una fila por ticket', prompt:'El equipo cargó fact_ventas con una fila por ticket (el total). El grano escrito era la línea. Un ticket de 5 productos no deja ver la categoría. ¿Qué se rompió y cómo lo vería la Fig. 3-9?', solution:'<strong>El grano cambió en silencio.</strong> Hay que volver a la línea: 5 filas, mismas fecha y ticket_id, cantidad e importe por SKU. Kleppmann (p.117) representa varios productos del mismo cliente como filas separadas del hecho, para no cerrar el análisis (p.116). Reconstruir hechos; no alcanza un UPDATE. <strong>Trade-off:</strong> más filas, y a cambio se puede agregar a categoría, tienda o mes.', h1:'¿Cuáles son los 4 pasos y en qué número está el grano?', h2:'¿Qué es ticket_id en la línea?', rubric:'Rúbrica: 2 definición de grano + 2 filas separadas + 1 trade-off.'},
{ title:'Caso 6 · Moda Norte, tres prendas', prompt:'Un cliente compra 2 camisas y 1 pantalón. Dibuja qué hay en OLTP y qué hay en fact_ventas con grano de línea. ¿Qué pasa si el mes siguiente el cliente pasa a VIP?', solution:'<strong>OLTP:</strong> 1 cabecera y 3 líneas. <strong>DWH:</strong> 3 filas-evento, misma dim_fecha de negocio, mismo ticket_id degenerado. Las dimensiones responden quién, qué, dónde y cuándo (DDIA p.116). Si el segmento cambia, <strong>SCD Type 2</strong> abre otra fila de dim_cliente; las 3 ventas siguen en la surrogate de ese día. El SCD no sale del capítulo de Kleppmann: es del curso. <strong>Trade-off:</strong> la dimensión crece y el hecho no se toca.', h1:'¿Cuántas filas si el grano fuera el ticket?', h2:'¿Type 1 qué haría con el segmento?', rubric:'Rúbrica: 2 conteo de filas + 2 SCD + 1 trade-off.'},
{ title:'Caso 7 · Inventario “del mes” y la matriz', prompt:'Alguien hace SUM(saldo_inventario) de los 30 cierres diarios y lo publica como inventario de marzo. El número es enorme. ¿Qué tipo de medida es, cómo se informa el mes, y qué X tiene Inventario en la bus matrix?', solution:'<strong>Semi-aditiva.</strong> Se puede sumar entre tiendas o SKU en la misma fecha, no a lo largo de los días. El inventario de marzo es el snapshot de cierre, no la suma de las fotos. En la matriz, Inventario marca fecha, producto y tienda: no cliente ni empleado. <strong>Trade-off:</strong> el snapshot periódico guarda una fila por día; eso permite la foto correcta y prohíbe el SUM ingenuo.', h1:'¿Qué tipo de hecho es el inventario de fin de día?', h2:'¿Por qué no hay X en Cliente?', rubric:'Rúbrica: 2 tipo de medida + 2 lectura de la matriz + 1 trade-off.'},
{ title:'Caso 8 · Cien columnas para tres campos', prompt:'fact_sales tiene más de 100 columnas. El analista pregunta fruta fresca contra dulce por día de la semana en 2013, y solo necesita weekday, category y SUM(quantity). En un motor por filas la consulta va lenta. ¿Qué almacenamiento propone Kleppmann y qué no se debe borrar?', solution:'<strong>Column-oriented storage (p.118):</strong> cada columna junta, y esta consulta solo lee date_key, product_sk y quantity del hecho, más las columnas de las dimensiones que filtra. El cuello de botella es el ancho de banda, no el seek (p.125). <strong>No borres el resto del hecho:</strong> un cubo precalculado no podría, por ejemplo, filtrar por precio si el precio no quedó como dimensión (p.124). <strong>Trade-off:</strong> las lecturas analíticas bajan de costo; el insert in-place en columnas comprimidas se vuelve incómodo.', h1:'¿Por qué no es lo mismo que una column family de Bigtable?', h2:'¿La estrella o el copo prefiere Kleppmann para el analista?', rubric:'Rúbrica: 2 por qué columna + 2 qué se lee + 1 trade-off de escritura o de cubo.'},
{ title:'Caso 9 · Promo con cero ventas', prompt:'Marketing pregunta qué SKUs en promoción esta semana tuvieron cero ventas. Un ingeniero quiere insertar filas con cantidad=0 en fact_ventas por cada producto en promo no vendido. ¿Qué arquitectura dimensional responde y qué falla con esa propuesta?', solution:'<strong>[Kimball] Factless de cobertura</strong> (producto×tienda×día en promo) menos la actividad real de ventas, con dimensiones conformadas. El hecho transaccional se queda <em>sparse</em>: solo eventos reales. Insertar ceros infla el hecho, sesga COUNT/AVG y mezcla planeación de promo con el POS. <strong>Trade-off:</strong> una tabla más, a cambio de no contaminar ventas.', h1:'¿Por qué el hecho de ventas debe ser disperso?', h2:'¿Qué operación une cobertura y actividad?', rubric:'Rúbrica: 2 factless + 2 por qué no ceros + 1 trade-off.'},
{ title:'Caso 10 · Envíos contra devoluciones', prompt:'Quieres un reporte por producto: unidades enviadas y unidades devueltas el trimestre. Alguien hace JOIN directo de fact_envios con fact_devoluciones por cliente y producto, y las sumas salen infladas. ¿Qué pasó y cómo se hace el drill-across?', solution:'<strong>[Kimball] Join fact-to-fact</strong> genera un cartesiano parcial cuando hay varios envíos y varias devoluciones del mismo par. Agrega cada hecho por separado al grano de dimensiones conformadas y une esos resultados (FULL OUTER JOIN típico). <strong>Trade-off:</strong> dos consultas en vez de una, a cambio de sumas honestas.', h1:'¿Qué son dimensiones conformadas aquí?', h2:'¿Por qué INNER JOIN no “arregla” el multiplicado?', rubric:'Rúbrica: 2 diagnóstico + 2 drill-across + 1 trade-off.'}
];

const GLOSSARY = [
['Data Warehouse','Repositorio analítico central: por sujeto, integrado, con historial y carga no volátil. En DDIA, una base aparte que el analista consulta sin afectar el OLTP (p.114).'],
['OLTP','Procesamiento del día a día: pocos registros por clave, escrituras de baja latencia, estado actual (DDIA Table 3-1, p.113). En el curso, modelo normalizado y milisegundos.'],
['OLAP','Procesamiento analítico: agregados sobre muchos registros, historia de eventos, analista interno (DDIA p.112–113). En el curso: reportes y KPI, a menudo en estrella.'],
['Inmon','Enfoque top-down: primero un DWH corporativo en 3FN; los marts se derivan después. Los cuatro rasgos (sujeto, integrado, tiempo, no volátil) son del curso.'],
['Kimball','Enfoque bottom-up: hechos y dimensiones conformadas, entregados por proceso de negocio. La estrella de DDIA es este estilo de modelado dimensional.'],
['Orientado al sujeto','El modelo se organiza por área de negocio (ventas, cliente), no por aplicación.'],
['Integrado','Claves, unidades, moneda y zona horaria significan lo mismo en todas las fuentes.'],
['Variación en el tiempo','El almacén conserva estados pasados, no solo el valor de hoy.'],
['No volátil','La carga es por lotes; un hecho ya cargado no se actualiza como un pedido OLTP.'],
['Staging','Zona temporal de aterrizaje, cruda, con lote y linaje, antes de las reglas de negocio.'],
['Data mart','Subconjunto analítico para un departamento o un caso de uso.'],
['Mart dependiente','Sale del DWH corporativo. Gana consistencia y puede esperar al núcleo.'],
['Mart independiente','Se construye directo desde las fuentes. Rápido, con riesgo de silos.'],
['Metadatos técnicos','Esquemas, linaje, jobs de carga y SLAs.'],
['Metadatos de negocio','Definición de una métrica (venta neta), dueño del dato y políticas.'],
['Metadatos operacionales','Logs de carga, filas rechazadas y watermark de extracción.'],
['ETL','Extract–Transform–Load. DDIA p.114: volcado periódico o flujo continuo, transformar a un esquema analítico, limpiar y cargar (Fig. 3-8).'],
['ELT','Extraer, cargar el crudo y transformar con SQL dentro del destino analítico. Variante de curso y de nube; el capítulo de Kleppmann describe el ETL clásico.'],
['Grano','Qué significa una fila de la tabla de hechos. Se declara antes de las dimensiones y las medidas.'],
['Fact table','Tabla de hechos: cada fila es un evento (DDIA p.115, fact_sales en la Fig. 3-9) más medidas y FKs a dimensiones.'],
['Tabla de hechos','Centro del modelo dimensional: claves foráneas a dimensiones y medidas numéricas. En DDIA, el evento (compra, clic) con atributos como precio y costo.'],
['Dimension','Tabla de contexto del evento: who, what, where, when, how, why (DDIA p.116). Ejemplos: dim_product, dim_date.'],
['Dimensión','Contexto descriptivo (quién, qué, dónde, cuándo), ancho en una estrella.'],
['Star schema','Esquema estrella: hecho al centro, dimensiones alrededor como rayos (DDIA Fig. 3-9, p.115–117). Se prefiere al copo porque es más simple para el analista.'],
['Esquema estrella','Hecho al centro y dimensiones desnormalizadas. Pocos joins. Misma idea que Star schema.'],
['Copo de nieve','Snowflake: la dimensión se parte en subdimensiones (marca, categoría). Más normalizado, más joins (DDIA p.117).'],
['Galaxia','Varios hechos comparten dimensiones conformadas. También se llama constelación o bus.'],
['Column-oriented','Almacén por columnas: los valores de cada columna van juntos, y la consulta lee solo las columnas que usa (DDIA p.118, Fig. 3-10). Por eso el DWH analítico suele ser columnar.'],
['Medida aditiva','Se puede sumar en todas las dimensiones. Ejemplo: cantidad, venta bruta.'],
['Medida semi-aditiva','Se suma en algunas dimensiones y no a lo largo del tiempo. Ejemplo: saldo de inventario.'],
['Medida no aditiva','No se suma: se promedia o se vuelve a calcular. Ejemplo: porcentaje de margen.'],
['Hecho transaccional','Una fila por evento de negocio, como la línea de un ticket.'],
['Snapshot periódico','Una fila con el estado al cierre de un período, como el inventario de fin de día.'],
['Hecho acumulativo','Una fila que va llenando hitos de un proceso largo (creado, enviado, entregado).'],
['Factless','Tabla de hechos solo con claves. La fila cuenta un evento, sin medida de importe.'],
['Drill-across','Agregar cada tabla de hechos por separado y unir resultados por dimensiones conformadas; no hacer join fact-to-fact. [Kimball]'],
['Snapshot acumulativo','Hecho de pipeline con varias fechas/hitos; la fila se actualiza y guarda lags. [Kimball]'],
['Clave natural','Identificador del sistema origen: SKU, cédula, número de ticket.'],
['Surrogate key','Clave técnica del DWH, estable. La FK del hecho apunta aquí. En DDIA, product_sk.'],
['Dimensión conformada','La misma definición de dimensión, compartida por varias tablas de hechos.'],
['Dimensión degenerada','Atributo de la transacción que se queda en el hecho, sin tabla propia. Ejemplo: ticket_id.'],
['Junk dimension','Combina flags y códigos de baja cardinalidad en una sola dimensión.'],
['Role-playing','Una dimensión física usada con varios roles. Ejemplo: fecha de venta y fecha de envío.'],
['Dimensión fecha','Calendario con día, semana, mes, trimestre, año, atributos fiscales y, en DDIA, feriados (p.117).'],
['SCD Type 1','Sobrescribe el atributo. El historial anterior se pierde. Modelado de Kimball, no el foco de DDIA cap. 3.'],
['SCD Type 2','Nueva fila con effective_from, effective_to e is_current. El hecho no se reescribe. Curso / Kimball, no la Fig. 3-9.'],
['SCD Type 3','Nueva columna con el valor anterior. El historial cabe en un solo cambio.'],
['Bus Matrix','Filas de procesos o hechos, columnas de dimensiones conformadas, X donde se usan.'],
['Roll-up','Subir en la jerarquía y agregar más. De día a mes. Drill-up.'],
['Drill-down','Bajar en la jerarquía y ver más detalle. De mes a día. DDIA p.115 lo cita como operación de exploración.'],
['Slice','Fijar una sola dimensión. Ejemplo: solo la región Norte.'],
['Dice','Fijar varias dimensiones y quedarse con un subcubo. Ejemplo: 2025 y Ropa.'],
['Pivot','Rotar qué dimensión va en filas y cuál en columnas.'],
['Data cube','Cubo OLAP: grilla de agregados materializados por dimensiones (DDIA Fig. 3-12, p.124). Rápido en lo previsto, menos flexible que el dato crudo.'],
['Materialized view','Copia en disco del resultado de una consulta. El cubo es un caso particular (DDIA p.123). En OLTP encarece las escrituras.'],
['MOLAP','Cubos pre-agregados. Muy rápidos en lo ya definido, poco ad hoc.'],
['ROLAP','La estrella vive en un motor relacional y se consulta con SQL. A menudo sobre almacenamiento columnar.'],
['HOLAP','Híbrido: parte en cubo pre-agregado y parte en el relacional.'],
['Bitmap index','Índice de mapas de bits por valor de una columna, muy comprimible cuando hay pocos distintos. DDIA p.119–120 lo usa para filtros de almacén. No es lo mismo que un índice B+ de OLTP.'],
['Data lake','Object storage con datos crudos y curated (Parquet, Delta, Iceberg).'],
['Medallón','Capas Bronze (crudo), Silver (limpio) y Gold (curado para BI). [quiz16]'],
['MPP','Procesamiento paralelo masivo: el coordinador reparte la consulta entre nodos. [quiz16/resumen]'],
['Lakehouse','Lake con tablas ACID y SQL, para analítica, sin duplicar todo en un DWH clásico. Parquet, citado en DDIA p.118, es el formato columnar de ese camino.']
];

const CHEATSHEET = `
<div class="cheat-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0 14px;align-items:start;grid-column:1 / -1">
<div class="card accent-gold"><h3 style="margin-top:0;">Inmon</h3><p style="font-size:14px;">Sujeto · integrado · variación en el tiempo · <strong>no volátil</strong>. Pregunta de historial, no el saldo de ahora.</p></div>
<div class="card accent-blue"><h3 style="margin-top:0;">OLTP / OLAP</h3><p style="font-size:14px;">Curso: OLTP escribe, 3FN, milisegundos. OLAP agrega, estrella, segundos. DDIA Table 3-1 (p.113): pocos registros por clave y estado actual, frente a agregado, ETL y <strong>historia de eventos</strong>.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Por qué otra base</h3><p style="font-size:14px;">DDIA p.114: el analista consulta el almacén <strong>sin afectar el OLTP</strong>. Copia de lectura. Entra por volcado periódico o flujo, se transforma, se limpia, se carga (ETL, Fig. 3-8).</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">Arquitectura</h3><p style="font-size:14px;">Fuentes → <strong>staging</strong> (crudo, batch_id) → DWH → <strong>marts</strong> → BI. Dependiente = consistente. Independiente = rápido y con silos. Metadatos: técnicos, de negocio, operacionales.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">ETL, ELT, enfoques</h3><p style="font-size:14px;"><strong>ETL</strong> clásico (DDIA): transforma fuera. <strong>ELT</strong>: carga raw y transforma en SQL (nube). Inmon: 3FN top-down. Kimball: bus dimensional. Se pueden combinar.</p></div>
<div class="card accent-orange"><h3 style="margin-top:0;">Grano y 4 pasos</h3><p style="font-size:14px;">1 proceso · 2 grano · 3 dimensiones · 4 medidas. Línea de ticket: 5 SKU = 5 filas. DDIA p.117: varios productos, filas separadas del hecho.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Estrella y columnas</h3><p style="font-size:14px;">Fig. 3-9: fila del hecho = <strong>evento</strong>. Dimensiones = quién, qué, dónde, cuándo. Copo = más normalizado (p.117). Column store (p.118): se leen solo las columnas del SELECT. <code>ticket_id</code> es degenerado.</p></div>
<div class="card accent-pink"><h3 style="margin-top:0;">Medidas y claves</h3><p style="font-size:14px;">Aditiva (importe) · semi-aditiva (saldo: no sumar días) · no aditiva (ratio). Hechos: transacción, snapshot, acumulativo, factless. FK = <strong>surrogate</strong> (<code>product_sk</code>). Conformada, degenerada, junk, role-playing, fecha.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">SCD y bus</h3><p style="font-size:14px;">Type 1 pisa. Type 2 nueva fila (501 Standard hasta jun-2025, 502 VIP después). El SCD es Kimball/curso, no el foco de DDIA. Inventario: fecha, producto, tienda. Sin cliente.</p></div>
<div class="card accent-blue"><h3 style="margin-top:0;">OLAP, cubo, plataforma</h3><p style="font-size:14px;">Roll-up · drill-down · slice (una dim) · dice (varias) · pivot. El cubo (p.124) es rápido y menos flexible que el crudo. MOLAP · ROLAP · HOLAP. Lakehouse: lake + ACID + SQL. El examen sigue siendo estrella, SCD 2 y OLTP/OLAP.</p></div>
</div>
`;
