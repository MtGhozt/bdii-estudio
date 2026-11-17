const MODULES = [
{ id:'m0', tag:'Módulo 0', accent:'gold', title:'Recursos: CPU, RAM y los dos límites',
summary:'Un solo núcleo por defecto, memoria para intermedios, y cuándo una máquina no alcanza.',
html: `
<p class="lede">Antes de repartir el trabajo hay que ver con qué se cuenta: núcleos, memoria y disco. El taller arranca ahí, con pandas y numpy en un hilo.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>En análisis de datos los recursos se agrupan en <strong>capacidad de procesamiento</strong> (CPUs; GPUs en casos especiales) y <strong>capacidad de memoria y disco</strong>. La RAM guarda los datos y también los <strong>intermedios</strong> del cómputo. El disco entra cuando la RAM no alcanza.</div>
<table><tr><th>Limitación</th><th>Cómo se manifiesta</th></tr>
<tr><td><strong>Memoria</strong></td><td>El dataset no cabe en la RAM de una sola máquina.</td></tr>
<tr><td><strong>Tiempo</strong></td><td>Hace falta baja latencia, casi tiempo real, y un solo hilo no llega.</td></tr></table>
<div class="callout tip"><div class="lbl">[didáctico]</div>R y Python <strong>por defecto usan un solo CPU</strong> aunque el equipo tenga más núcleos. El notebook lo contrasta con dos demos: <code>pandas</code> sobre <code>california_housing_train.csv</code> (~17&nbsp;000 filas, barras por edad de la vivienda) y <code>numpy</code> sumando una matriz 800×800, con un solo hilo visible en el monitor.</div>
<div class="callout info"><div class="lbl">[resumen]</div>Los DWH modernos y motores como Spark atacan el mismo problema: <strong>muchas filas y consultas pesadas</strong>, con paralelismo y, en clúster, <strong>MPP</strong>.</div>
<div class="trade"><b>Trade-off 0 · Quedarse en un proceso.</b> Ganas: el código de pandas o numpy es directo. Pierdes: el resto de núcleos y cualquier dataset que no quepa en esa RAM.</div>
`,
mini:{q:'Según el taller, pandas y numpy por defecto usan…', opts:['Todos los núcleos del equipo','Un solo CPU','La GPU siempre','Un executor por columna'], a:1, why:'El notebook lo muestra a propósito: un hilo, aunque haya más núcleos.'} },
{ id:'m1', tag:'Módulo 1', accent:'blue', title:'Procesamiento paralelo vs distribuido',
summary:'Un nodo con N núcleos frente a N máquinas. local[*] no es un clúster.',
html: `
<p class="lede">Paralelo y distribuido no son sinónimos. Distribuido es el caso en que las tareas ya no viven en la misma computadora.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div><strong>Procesamiento paralelo:</strong> el código se divide en procesos o hilos que aprovechan los CPUs de una máquina (o de varias, si hay red). <strong>Procesamiento distribuido:</strong> subconjunto de ese paralelismo en el que las tareas corren en <strong>distintas computadoras</strong> del clúster.</div>
<pre><code>rdd = spark.sparkContext.parallelize(range(800 * 800))</code></pre>
<div class="callout info"><div class="lbl">[resumen]</div>En clúster las particiones del dataset viven en varios nodos. Spark puede ir de una máquina a miles; el modo dice dónde corren esas particiones.</div>
<table><tr><th></th><th>Paralelo (multiproceso)</th><th>Distribuido</th></tr>
<tr><td>Alcance</td><td>1 nodo, N cores</td><td>N nodos, N×cores</td></tr>
<tr><td>Ejemplo Spark</td><td><code>local[*]</code></td><td>YARN / Kubernetes / Standalone</td></tr>
<tr><td>Fallo</td><td>Cae el nodo y cae todo</td><td>Puede tolerarse la caída de un executor (linaje)</td></tr></table>
<div class="callout tip"><div class="lbl">[didáctico]</div><code>local[*]</code> es paralelo dentro de <strong>una JVM</strong> (un hilo por núcleo). No es un clúster: si esa máquina muere, no hay otro nodo que retome el linaje.</div>
<div class="trade"><b>Trade-off 1 · Una máquina vs un clúster.</b> Ganas en local: cero operación de clúster, ideal para el Colab. Pierdes: techo de RAM y un solo punto de fallo.</div>
`,
mini:{q:'Procesamiento distribuido, en el notebook, es…', opts:['Cualquier uso de más de un núcleo','Tareas en distintas computadoras del clúster','Solo SQL','Escribir un CSV'], a:1, why:'Distribuido es el paralelismo que cruza de máquina.'} },
{ id:'m2', tag:'Módulo 2', accent:'purple', title:'Spark frente a Hadoop MapReduce',
summary:'Memoria en vez de disco entre etapas, motor unificado, y Spark no guarda los datos.',
html: `
<p class="lede">Spark nace en UC Berkeley (AMPLab, 2009, Matei Zaharia) y pasa a la Apache Software Foundation. Es un motor de procesamiento distribuido, no un almacén.</p>
<div class="callout info"><div class="lbl">[resumen]</div>Procesa <strong>en memoria</strong>, así que en iteraciones va mucho más rápido que MapReduce, que <strong>persiste en disco</strong> entre map y reduce. Es un <strong>motor unificado</strong>: batch, SQL, streaming, ML y grafos. Lenguajes: Scala (nativo), Python (PySpark), Java, R y SQL. <strong>No es almacenamiento:</strong> lee HDFS, S3, Azure Blob, JDBC, Kafka, Parquet y otros.</div>
<table><tr><th>Aspecto</th><th>MapReduce</th><th>Spark</th></tr>
<tr><td>Intermedios</td><td>Disco</td><td>Memoria (disco si hace falta)</td></tr>
<tr><td>Operaciones</td><td>map + reduce</td><td>map, filter, join, groupBy, SQL…</td></tr>
<tr><td>Modalidades</td><td>Batch</td><td>Batch, streaming, ML, SQL, grafos</td></tr>
<tr><td>Iteraciones (ML)</td><td>Lentas</td><td>Eficientes</td></tr>
<tr><td>API</td><td>Verbosa (Java)</td><td>Alto nivel (DataFrame, SQL)</td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El notebook lo resume así: Spark reparte el trabajo en <strong>una o miles</strong> de máquinas y aprieta memoria y CPUs.</div>
<div class="callout tip"><div class="lbl">[didáctico]</div>Spark puede correr <strong>sobre</strong> Hadoop (YARN + HDFS). Reemplaza a MapReduce como motor de cómputo. No tiene que reemplazar todo el ecosistema Hadoop.</div>
<div class="trade"><b>Trade-off 2 · Memoria contra disco.</b> Ganas: iteraciones rápidas y un solo API. Pierdes: si el working set no cabe, Spark igual derrama a disco y el mito de "siempre en RAM" se cae.</div>
<div class="callout warn"><div class="lbl">[resumen]</div>Error común: tratar Spark como base de datos. No guarda el dataset; lo lee de otro sistema y puede escribir el resultado de vuelta.</div>
`,
mini:{q:'¿Por qué Spark gana a MapReduce en iteraciones?', opts:['Porque no tiene shuffle','Porque mantiene intermedios en memoria','Porque solo corre en un CPU','Porque es un sistema de archivos'], a:1, why:'MapReduce escribe disco entre map y reduce. Spark evita ese viaje cuando la RAM alcanza.'} },
{ id:'m3', tag:'Módulo 3', accent:'teal', title:'Stack, driver, executors y despliegue',
summary:'Core, SQL, GraphX, SparkML, más el trío driver / cluster manager / executor.',
html: `
<p class="lede">El ecosistema se apila sobre un cluster manager y un almacén. Quien arma el plan es el driver; quien lo corre son los executors.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Nombres del notebook (el ML del taller es <strong>SparkML</strong>):</div>
<table><tr><th>Componente</th><th>Rol</th></tr>
<tr><td><strong>Spark Core</strong></td><td>Motor base: scheduling, memoria, fallos y <strong>RDD</strong>.</td></tr>
<tr><td><strong>Spark SQL</strong></td><td>DataFrames y consultas SQL.</td></tr>
<tr><td><strong>GraphX</strong></td><td>Grafos (PageRank y similares).</td></tr>
<tr><td><strong>SparkML</strong></td><td>Pipelines de ML: clasificación, clustering, LDA.</td></tr>
<tr><td><strong>Structured Streaming</strong></td><td>Datos en tiempo casi real: <strong>micro-batches</strong>, el stream se trata como <strong>una tabla que crece</strong>.</td></tr>
<tr><td><strong>MLlib</strong></td><td>API de ML del resumen. En la práctica moderna mucho vive en <code>pyspark.ml</code>.</td></tr></table>
<div class="callout info"><div class="lbl">[resumen]</div>Por debajo hay un <strong>cluster manager</strong> y un <strong>almacenamiento</strong> (HDFS, S3, Parquet, Delta, JDBC, Kafka). El driver crea la <code>SparkSession</code>, convierte el programa en un <strong>DAG</strong>, lo corta en stages y tasks, y coordina. El cluster manager (Standalone, YARN, Kubernetes; Mesos deprecado) asigna recursos. Los executors corren tasks, guardan cache y reportan al driver.</div>
<table><tr><th>Modo</th><th>Dónde vive el driver</th></tr>
<tr><td><strong>local</strong></td><td>Todo en una JVM. <code>local[*]</code> = un hilo por núcleo. Sirve para pruebas.</td></tr>
<tr><td><strong>client</strong></td><td>Driver en la máquina de quien lanza el trabajo (notebook, IDE).</td></tr>
<tr><td><strong>cluster</strong></td><td>Driver dentro del clúster.</td></tr></table>
<div class="callout tip"><div class="lbl">[didáctico]</div>Mnemotecnia: <strong>driver piensa, CM reparte, executor trabaja</strong>. Si el driver está en tu laptop (client) y cierras la sesión, el trabajo se queda sin coordinador.</div>
<div class="trade"><b>Trade-off 3 · client vs cluster.</b> Ganas en client: ves logs y depuras desde el notebook. Pierdes: el driver compite con tu máquina y un corte de red tumba el job.</div>
`,
mini:{q:'¿Quién convierte el programa en un DAG?', opts:['Cada executor','El driver','El archivo Parquet','El Tokenizer'], a:1, why:'El driver planifica. Los executors ejecutan tasks.'} },
{ id:'m4', tag:'Módulo 4', accent:'orange', title:'PySpark, SparkSession y la regla de oro',
summary:'Ejecución remota aunque el master sea local, más el quirk de Java en Colab.',
html: `
<p class="lede">PySpark es la librería Python para un clúster Spark. Muchas operaciones de pandas tienen análogo, con otros métodos. El cómputo no ocurre en el ciclo <code>for</code> de Python.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div><strong>Regla de oro:</strong> los procesamientos ocurren en un entorno de ejecución distinto al intérprete Python. Hay que pensar en <strong>ejecución remota</strong>, incluso con <code>master("local[*]")</code>.</div>
<div class="callout tip"><div class="lbl">[didáctico]</div>Consecuencias que caen en el examen: no recorras filas con bucles Python masivos; no hagas <code>collect()</code> de un dataset grande (trae todo al driver); una UDF es más lenta que una función nativa de Spark SQL; <code>toPandas()</code> solo para una muestra o un gráfico.</div>
<div class="callout info"><div class="lbl">[resumen]</div>La sesión es la puerta de entrada a las APIs (DataFrame, SQL, y el resto del stack). Crearla y cerrarla con <code>spark.stop()</code> libera los recursos del proceso.</div>
<h3>Secuencia típica en Colab</h3>
<ol>
<li>Descargar y descomprimir Spark (en el taller, <code>spark-4.3.0-bin-hadoop3</code>).</li>
<li><code>pip install findspark pyspark</code>.</li>
<li>Fijar <code>JAVA_HOME</code> y <code>SPARK_HOME</code>.</li>
<li><code>findspark.init()</code> y entonces <code>SparkSession</code>.</li>
</ol>
<pre><code>import os
import findspark
os.environ["JAVA_HOME"] = "/usr/lib/jvm/java-21-openjdk-amd64"
os.environ["SPARK_HOME"] = "/content/spark-4.3.0-bin-hadoop3"
findspark.init()
from pyspark.sql import SparkSession
spark = (SparkSession.builder
    .master("local[*]")
    .appName("BDII-PySpark")
    .getOrCreate())
# spark.stop()</code></pre>
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de Java.</strong> La primera celda intenta <code>apt-get install openjdk-8</code> y a veces el apt responde 404. La celda siguiente apunta <code>JAVA_HOME</code> a <code>java-21-openjdk-amd64</code>. En la práctica <strong>funciona con Java 21</strong> si Spark ya está descomprimido. No hace falta forzar Java 8 salvo que el runtime lo exija. Otro quirk: varias celdas dicen "Escriba el código aquí" y la solución ya está en la celda de abajo.</div>
<div class="trade"><b>Trade-off 4 · La comodidad de Python.</b> Ganas: el mismo lenguaje que el resto del análisis. Pierdes: cada ida y vuelta con el driver (collect, toPandas, UDF fila a fila) borra la ventaja del motor.</div>
`,
mini:{q:'La regla de oro pide pensar el cómputo como…', opts:['Un bucle Python sobre cada fila','Ejecución remota, incluso en local[*]','Siempre un collect al final','Una UDF obligatoria'], a:1, why:'El intérprete Python arma el plan. El motor lo corre en otro lado.'} },
{ id:'m5', tag:'Módulo 5', accent:'pink', title:'DataFrames: lectura, esquema, select y SQL',
summary:'Housing en California: schema, tres formas de nombrar columnas, y una vista temporal.',
html: `
<p class="lede">Si el archivo está donde Spark puede leerlo, la carga es del motor, no de pandas. El taller lo practica con el CSV de vivienda.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>APIs de lectura: <code>spark.read.csv</code>, <code>json</code>, <code>parquet</code> (el preferido en producción), <code>text</code> (una columna por línea) y <code>kafka</code>. Opciones frecuentes: <code>header=True</code>, <code>inferSchema=True</code>, <code>schema=...</code>, y <code>mode("overwrite")</code> al escribir.</div>
<p>Dos caminos para housing. <strong>Pandas primero</strong> y luego <code>spark.createDataFrame(pddf)</code>: útil en un prototipo chico, porque el driver carga todo. <strong>Directo</strong> con <code>spark.read.csv(path, schema=..., header=True)</code>: es el camino que escala.</p>
<h3>Esquema: string DDL y StructType</h3>
<pre><code>schema_str = """
    longitude double, latitude double, housing_median_age double,
    total_rooms double, total_bedrooms double, population double,
    households double, median_income double, median_house_value double
"""
df = spark.read.csv(path, header=True, schema=schema_str)</code></pre>
<pre><code>from pyspark.sql.types import StructType, StructField, DoubleType
schema = StructType([
    StructField("longitude", DoubleType(), True),
    StructField("latitude", DoubleType(), True),
])
df = spark.read.csv(path, header=True, schema=schema)</code></pre>
<div class="callout tip"><div class="lbl">[didáctico]</div>Declarar el esquema evita la <strong>doble pasada</strong> de <code>inferSchema</code> y la sorpresa de "todo string". Alinea los tipos con el CSV real. El atributo <code>df.total_rooms</code> no sirve si el nombre tiene espacios: ahí manda <code>F.col</code>.</div>
<pre><code>from pyspark.sql import functions as F
(df.select(
    "housing_median_age",
    df.total_rooms,
    (F.col("housing_median_age") + F.col("total_rooms")).alias("edad_mas_habitaciones"),
).limit(10))</code></pre>
<pre><code>df.createOrReplaceTempView("Housing")
spark.sql("SELECT housing_median_age FROM Housing LIMIT 10").show()</code></pre>
<div class="callout info"><div class="lbl">[resumen]</div>RDD, DataFrame y Dataset no pasan igual por el optimizador. En PySpark el camino es el DataFrame.</div>
<table><tr><th></th><th>RDD</th><th>DataFrame</th><th>Dataset</th></tr>
<tr><td>Estructura</td><td>Objetos sin esquema</td><td>Columnas con nombre y tipo</td><td>DataFrame tipado (Scala/Java)</td></tr>
<tr><td>Catalyst</td><td>No</td><td>Sí</td><td>Sí</td></tr>
<tr><td>Hoy en PySpark</td><td>Legado</td><td><strong>La API a usar</strong></td><td>No es el camino Python</td></tr></table><div class="callout info"><div class="lbl">[resumen]</div>En Scala, <code>DataFrame = Dataset[Row]</code>. El Dataset tipado solo existe en Scala/Java. En PySpark el camino es el DataFrame.</div>
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de tipos.</strong> Un ejemplo del notebook mezcla <code>IntegerType</code> en <code>total_rooms</code> con <code>DoubleType</code> en otras columnas. Si el header no calza, aparecen nulos raros. Mejor un esquema homogéneo (todo double en la lectura) y el cast explícito después, o <code>inferSchema=True</code> más un cast.</div>
<div class="trade"><b>Trade-off 5 · inferSchema vs esquema declarado.</b> Ganas con inferir: una línea y a explorar. Pierdes: una pasada extra y tipos adivinados. En producción se declara.</div>
<h3>Pipeline housing (corregido)</h3><pre><code>df_conv.repartition(4).write.mode(overwrite).parquet(output/housing_parquet)</code></pre>
`,
mini:{q:'Una vista temporal creada con createOrReplaceTempView…', opts:['Queda publicada en el DWH','Vive solo en esa SparkSession','Escribe Parquet','Desactiva Catalyst'], a:1, why:'Misma sesión, mismo Catalyst que el API DataFrame. Al cerrar, desaparece.'} },
{ id:'m6', tag:'Módulo 6', accent:'gold', title:'Ejecución perezosa, map-reduce y acciones',
summary:'El plan espera. explain lo muestra. show, count y write lo disparan.',
html: `
<p class="lede">Nada corre cuando escribes <code>select</code> o <code>filter</code>. Spark acumula el plan para poder achicarlo. La acción es el gatillo.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Las transformaciones construyen un plan. Las acciones lo ejecutan: <code>show</code>, <code>count</code>, <code>collect</code>, <code>write</code>, y también <code>take</code> o <code>first</code>. <code>explain()</code> muestra el plan físico sin correr el cómputo. <code>explain(True)</code> extiende: lógico, optimizado y físico.</div>
<pre><code>plan = df.select((F.col("housing_median_age") + F.col("total_rooms")).alias("Housing_3"))
plan.explain()
plan.explain(True)</code></pre>
<div class="callout tip"><div class="lbl">[didáctico]</div>El beneficio de esperar es un plan entero: menos shuffles, proyecciones fusionadas y <strong>predicate pushdown</strong>. Si "no pasa nada" después de un <code>filter</code>, falta la acción.</div>
<h3>Map y reduce, como idea</h3>
<table><tr><th>Fase</th><th>Idea</th><th>En DataFrame</th></tr>
<tr><td><strong>Map</strong></td><td>Transformar cada registro</td><td><code>select</code>, <code>withColumn</code>, tokenizar</td></tr>
<tr><td><strong>Reduce</strong></td><td>Agrupar y agregar</td><td><code>groupBy("user").count()</code>, <code>agg(avg(...))</code></td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El notebook también lo muestra en Python puro: la suma de cuadrados de 0 a 99 da <strong>338350</strong>. En el API DataFrame no hay funciones llamadas map y reduce: el patrón son transformaciones más <code>groupBy</code> / <code>agg</code>.</div>
<pre><code>from functools import reduce
l = list(range(100))
reduce(lambda x, y: x + y, map(lambda x: x**2, l))  # 338350</code></pre>
<div class="callout info"><div class="lbl">[resumen]</div>La transformación alarga el plan. La acción lo ejecuta.</div>
<table><tr><th>Transformaciones (lazy)</th><th>Acciones</th></tr>
<tr><td><code>select</code>, <code>filter</code> / <code>where</code>, <code>withColumn</code>, <code>join</code>, <code>groupBy</code>, <code>distinct</code>, <code>flatMap</code>, <code>union</code></td><td><code>show</code>, <code>count</code>, <code>collect</code>, <code>take</code>, <code>first</code>, <code>reduce</code>, <code>saveAsTextFile</code>, <code>write</code></td></tr></table>
<p><code>where</code> y <code>filter</code> son <strong>alias</strong>. <code>describe()</code> devuelve count, mean, stddev, min y max de las columnas numéricas: es una acción de perfilado. Un <code>groupBy</code> con agregación y clave distinta es una transformación <strong>wide</strong> (hay shuffle).</p>
<pre><code>df_conversion.select("median_income").where("total_rooms &gt; 5000").show()
df_conversion.filter(F.col("total_rooms") &gt; 5000).count()
(df_conversion.groupBy("housing_median_age")
    .agg(F.avg("median_house_value").alias("promedio_valor"),
         F.sum("median_income").alias("suma_ingreso"))
    .orderBy(F.desc("housing_median_age"))
    .show())</code></pre>
<div class="callout warn"><div class="lbl">[didáctico · Learning Spark]</div>Encadenar <code>filter</code>/<code>select</code> y hacer <code>print("listo")</code> <strong>sin acción</strong> no lee el archivo: solo alarga el plan. El error de ruta o de datos aparece en el <code>count</code>/<code>show</code>/<code>write</code>, no en la línea del filtro.</div>
<div class="trade"><b>Trade-off 6 · Pereza.</b> Ganas: el motor ve el plan completo y tira trabajo inútil. Pierdes: el error de datos aparece en la acción, líneas después de donde escribiste el filtro.</div>
`,
mini:{q:'¿Cuál de estas dispara la ejecución?', opts:['select','withColumn','count','filter'], a:2, why:'count es acción. select, withColumn y filter solo alargan el plan.'} },
{ id:'m7', tag:'Módulo 7', accent:'blue', title:'Narrow, wide, stages, particiones y caché',
summary:'Dónde está el shuffle, cómo se parten los jobs, y cuándo persistir.',
html: `
<p class="lede">El linaje permite rehacer una partición perdida. El shuffle es lo que parte ese grafo en stages y, de paso, lo que más cuesta.</p>
<div class="callout info"><div class="lbl">[resumen]</div>Un RDD es <strong>resiliente</strong> (el linaje reconstruye cada partici, y por eso no hace falta replicar los datos);ón), <strong>distribuido</strong>, <strong>inmutable</strong> (cada transformación produce otro) y <strong>lazy</strong>. <strong>Narrow:</strong> una partición de salida depende de una de entrada (<code>map</code>, <code>filter</code>, <code>select</code>, <code>withColumn</code> simple): sin shuffle. <strong>Wide:</strong> la salida depende de muchas entradas (<code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>): hay shuffle por red o disco.</div>
<div class="callout tip"><div class="lbl">[didáctico]</div>Fórmula: <strong>1 acción = 1 job → N stages (cortados en cada shuffle) → M tasks (una por partición, en lo típico).</strong></div>
<table><tr><th>Método</th><th>Particiones</th><th>Shuffle</th><th>Cuándo</th></tr>
<tr><td><code>repartition(n)</code></td><td>Sube o baja</td><td>Sí</td><td>Balancear, o justo antes de una escritura pesada.</td></tr>
<tr><td><code>coalesce(n)</code></td><td>Solo baja</td><td>Sin shuffle completo</td><td>Reducir particiones al final, más barato.</td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Al escribir housing el taller hace <code>repartition(1)</code> para un solo CSV (cómodo de abrir, malo para paralelismo) y <code>repartition(10)</code> para unos diez Parquet (mejor si después se lee en distribuido).</div>
<pre><code>df_join.repartition(1).write.mode("overwrite").csv("ejemplo_escritura_1.csv")
df_join.repartition(10).write.mode("overwrite").parquet("ejemplo_escritura_1_parquet")
df_cached = df_datetime.persist()  # MEMORY_AND_DISK
df_cached.unpersist()</code></pre>
<p><code>cache()</code> equivale a <code>persist(MEMORY_ONLY)</code>. <code>persist()</code> sin argumentos usa <code>MEMORY_AND_DISK</code>. Niveles: <code>MEMORY_ONLY</code>, <code>MEMORY_AND_DISK</code>, <code>DISK_ONLY</code>, entre otros. Tiene sentido cuando el mismo DataFrame alimenta varias ramas: limpieza de tweets, agregaciones y ML. Si no, Spark recomputa el linaje en cada acción.</p>
<div class="callout info"><div class="lbl">[didáctico · Learning Spark]</div>En agregaciones por clave (RDD Pair o idea equivalente), preferí <code>reduceByKey</code> / <code>aggregate</code> con combine local frente a <code>groupByKey</code>+sumar: el primero reduce tráfico de red; el segundo manda listas crudas y puede OOM. Si particionas un dataset grande que reusas en varios joins, <code>repartition</code>/<code>partitionBy</code> + <code>persist</code>: sin persist, cada acción re-shufflea. Tras particionar, transformar solo el valor (<code>mapValues</code> en RDD) conserva el partitioner; un <code>map</code> genérico lo borra y el siguiente join vuelve a shufflear.</div>
<div class="trade"><b>Trade-off 7 · Shuffle y caché.</b> Ganas con repartition: archivos balanceados. Pierdes: el movimiento de datos. Ganas con persist: no repites la limpieza. Pierdes: RAM (y disco, si el nivel lo permite) ocupada hasta el <code>unpersist</code>.</div>
`,
mini:{q:'coalesce(n) se diferencia de repartition porque…', opts:['Siempre aumenta particiones con shuffle','Solo reduce particiones, sin shuffle completo','Es un broadcast','Borra el linaje'], a:1, why:'coalesce baja el número y evita el shuffle completo. No sirve para subir particiones.'} },
{ id:'m8', tag:'Módulo 8', accent:'purple', title:'Catalyst, Tungsten, AQE y formatos',
summary:'Quién optimiza el plan, quién lo ejecuta, y por qué Parquet gana al CSV.',
html: `
<p class="lede">El DataFrame no se ejecuta "como lo escribiste". Catalyst lo reescribe, Tungsten lo corre apretado y AQE puede cambiar de opinión con los tamaños reales.</p>
<table><tr><th>Motor</th><th>Qué hace</th></tr>
<tr><td><strong>Catalyst</strong></td><td>Cadena: plan lógico -> plan lógico <strong>optimizado</strong> (predicate pushdown, column pruning) -> <strong>varios planes físicos</strong> -> elección por <strong>costos</strong> -> generación de código.</td></tr>ísico.</td></tr>
<tr><td><strong>Tungsten</strong></td><td>Ejecución: memoria <strong>off-heap</strong>, formato binario compacto y <strong>whole-stage code generation</strong>.</td></tr>
<tr><td><strong>AQE</strong></td><td>Reoptimiza <strong>en runtime</strong> con estadísticas reales (tamaño después del shuffle, otra estrategia de join).</td></tr></table>
<div class="callout info"><div class="lbl">[resumen]</div>Si una tabla es pequeña, Spark puede <strong>difundirla</strong> a todos los executors y no shufflear la grande. El caso de libro es hechos unidos a una dimensión chica del modelo estrella.</div>
<div class="callout info"><div class="lbl">[resumen]</div><strong>Variables compartidas:</strong> <em>broadcast variables</em> = variables de solo lectura enviadas una vez a cada nodo (no confundir con el broadcast join). <em>Accumulators</em> = variables a las que los executors solo suman (contadores); el driver las lee. El linaje del RDD permite recalcular una particion perdida: por eso no hace falta replicar los datos.</div>
<table><tr><th>Formato</th><th>Naturaleza</th><th>Notas</th></tr>
<tr><td>CSV / JSON</td><td>Texto</td><td>Interoperables. El parseo es caro y los tipos son débiles.</td></tr>
<tr><td><strong>Parquet</strong></td><td>Columnar comprimido</td><td>El preferido en Spark. Entra el predicate pushdown.</td></tr>
<tr><td>ORC</td><td>Columnar</td><td>Ecosistema Hive.</td></tr>
<tr><td>Avro</td><td>Por filas</td><td>Evolución de esquema y streaming.</td></tr>
<tr><td>Delta / Iceberg / Hudi</td><td>Capa sobre Parquet</td><td>ACID y time travel: el <strong>lakehouse</strong>.</td></tr></table>
<div class="callout info"><div class="lbl">[quiz16]</div><strong>Por qué Parquet acelera en el lago.</strong> Misma columna = mismo tipo → compresión fuerte. El pie del archivo guarda stats por bloque (ej. edad min 18 / máx 35): si el filtro es <code>edad &gt; 50</code>, Spark <strong>salta el bloque</strong> sin bajarlo. Además, partición física en carpetas (<code>/ventas/año=2026/mes=11/…</code>): un <code>WHERE año=2026 AND mes=11</code> ignora el resto de carpetas.</div>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El taller escribe el mismo housing en CSV y en Parquet. Pandas puede leer solo dos columnas del Parquet de salida:</div>
<pre><code>import pandas as pd
pd.read_parquet("ejemplo_escritura_1_parquet", columns=["total_rooms", "total_bedrooms"])</code></pre>
<div class="callout tip"><div class="lbl">[didáctico]</div>CSV para mirar el archivo con un humano. Parquet para que el clúster lea columnas y empuje filtros. Broadcast solo si la tabla chica <strong>cabe en cada executor</strong>.</div>
<div class="trade"><b>Trade-off 8 · Broadcast.</b> Ganas: la tabla grande no viaja por la red. Pierdes: una dimensión que no era tan chica revienta la memoria de los executors.</div>
`,
mini:{q:'¿Cuándo aplica un broadcast join?', opts:['Cuando una tabla es pequeña y se puede copiar a los executors','Cuando ambas tablas son enormes','Solo con RDD sin esquema','Solo al hacer coalesce'], a:0, why:'Se difunde la chica (típico: dimensión) y se evita el shuffle de la grande (hechos).'} },
{ id:'m9', tag:'Módulo 9', accent:'teal', title:'Tweets, texto y el puente al DWH',
summary:'Schema, regex, Tokenizer, LDA, y Spark entre el lago y el almacén.',
html: String.raw`
<p class="lede">El cierre del Colab son cerca de 1,6 millones de tweets: texto libre, usuarios y sentimiento. El resumen lo conecta con el lago y el DWH.</p>
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de archivo.</strong> El markdown dice <code>/content/traindata.csv</code>. El código abre <code>/content/twitter_training.csv</code>. Usa el nombre del código, o renombra al subir. <code>inferSchema=True</code> suele fallar: las comas del texto parten columnas de más. El esquema va declarado.</div>
<pre><code>schema_str = "id long, user string, sentiment string, text string"
df_twitter = spark.read.csv(path, header=True, schema=schema_str)
df_twitter.where(F.col("id").isNull()).count()  # filas corruptas</code></pre>
<pre><code>(df_twitter.groupBy("user").count().orderBy(F.desc("count")).limit(20).show())
(df_twitter.select("sentiment", F.length("text").alias("length"))
    .groupBy("sentiment").avg("length").show())</code></pre>
<p>Si existe <code>date</code> con forma <code>Mon Apr 06 22:19:45 PDT 2009</code>, el taller recorta el día de la semana y parsea:</p>
<pre><code>df_datetime = (df_twitter
    .withColumn("date", F.substring("date", 5, 1000))
    .withColumn("date", F.to_timestamp("date", "MMM dd HH:mm:ss zz yyyy"))
    .persist())</code></pre>
<h3>Limpieza, tokens y tópicos</h3>
<div class="callout tip"><div class="lbl">[didáctico]</div>La primera mención es <code>regexp_extract</code> del grupo 1 de <code>@usuario</code>. Para la nube de palabras hay que tokenizar <strong>text_clean</strong>, no el <code>text</code> crudo: el Tokenizer del notebook de ML apunta a <code>text</code>, y las líneas de <code>groupBy("token").count()</code> a veces vienen comentadas. Sin ese conteo, el dict de la nube no existe.</div>
<pre><code>df_clean = (df
    .withColumn("text_clean", F.regexp_replace("text", r"https?://[^\s]+", ""))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"@\w+", " "))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"[^\w\s]", " "))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"\s+", " "))
    .withColumn("text_clean", F.lower(F.trim("text_clean")))
    .filter(F.length("text_clean") > 1)
    .persist())
tokenizer = Tokenizer(inputCol="text_clean", outputCol="tokens")
stop = StopWordsRemover(inputCol="tokens", outputCol="filtered")
word_counts = (stop.transform(tokenizer.transform(df_clean))
    .select(F.explode("filtered").alias("token"))
    .groupBy("token").count().orderBy(F.desc("count")))</code></pre>
<p>Tópicos, en este orden: <strong>CountVectorizer</strong> (bolsa dispersa, <code>rawFeatures</code>) → <strong>IDF</strong> (pesa lo poco frecuente, <code>vectors</code>) → <strong>LDA</strong> (<code>k</code> temas, no supervisado) → <code>describeTopics</code>. La calidad depende de la limpieza y de <code>vocabSize</code>.</p>
<pre><code>cv = CountVectorizer(inputCol="filtered", outputCol="rawFeatures", vocabSize=200, minDF=2)
idf = IDF(inputCol="rawFeatures", outputCol="vectors")
lda = LDA(k=10, maxIter=10, featuresCol="vectors")</code></pre>
<h3>Puente con el DWH</h3>
<div class="callout info"><div class="lbl">[resumen]</div>Spark hace el <strong>ETL/ELT</strong>: lee crudo del data lake (S3 o HDFS), limpia, agrega y escribe al DWH o a tablas curadas. En un <strong>lakehouse</strong> consulta Parquet, Delta o Iceberg con ACID. También arma hechos y dimensiones (Kimball) a partir de lo ya procesado. El ELT moderno carga crudo al lago y transforma con Spark o dbt en el destino. Snowflake, BigQuery o Redshift pueden ocupar partes del pipeline; Spark sigue siendo el motor de preparación.</div>
<div class="callout tip"><div class="lbl">[Fundamentals]</div>Un lake sin catálogo ni capa ACID degenera en <em>data swamp</em>. Preferí Parquet (no CSV) para schema-on-read; evitá miles de archivos diminutos (un PUT por fila). Un MERGE/CDC fila a fila sobre columnar es Copy-on-Write caro: loteá. Lambda (batch+stream duplicados) solo si hace falta; Kappa unifica en un stream con replay.</div>
<div class="callout info"><div class="lbl">[quiz16]</div><strong>Medallón.</strong> Bronze = crudo con timestamp (inmutable). Silver = Spark limpia y tipa, escribe Parquet. Gold = agregados para BI/DWH. El log de transacciones (Delta/Iceberg) habilita cambios atómicos y time travel sobre el lago de archivos.</div>
<table><tr><th>Tema</th><th>Idea para cuando el quiz mezcla modelo</th></tr>
<tr><td>Bronze / Silver / Gold</td><td>Crudo → limpio → curado. Spark suele vivir en Silver.</td></tr>
<tr><td>Inmon</td><td>DWH integrado, orientado a temas, histórico, no volátil.</td></tr>
<tr><td>Kimball</td><td>Estrella o copo. La granularidad se define primero. Dimensiones conformadas.</td></tr>
<tr><td>OLTP vs OLAP</td><td>Transacciones contra análisis agregado.</td></tr>
<tr><td>ETL vs ELT</td><td>Transformar antes de cargar, o después, ya en el destino.</td></tr>
<tr><td>SCD tipo 2</td><td>Una fila nueva conserva la historia. La llave subrogada identifica la versión.</td></tr>
<tr><td>Lakehouse</td><td>Lago más transacciones ACID (Delta o Iceberg).</td></tr></table>
<p>Esquema mental: <strong>fuentes → Spark → lake/Delta → DWH/BI</strong>, o un lakehouse único con SQL encima. Medidas: aditivas se suman en cualquier dimensión; semi-aditivas no en el tiempo (stock); no aditivas no se suman (ratios). Slice fija una dimensión; dice fija varias. Roll-up sube en la jerarquía; drill-down baja.</p>
<div class="trade"><b>Trade-off 9 · Limpiar de más.</b> Ganas: tokens y tópicos legibles. Pierdes: menciones, URLs y signos que a veces eran la señal. Y sin <code>persist</code> sobre <code>df_clean</code>, cada acción repite toda la regex.</div>
`,
mini:{q:'ELT moderno, en el resumen, significa…', opts:['Transformar todo antes de cargar','Cargar crudo al lago y transformar con Spark o dbt en el destino','Borrar el DWH','Quedarse en OLTP'], a:1, why:'La carga cruda va al lago. Spark (o dbt) transforma ya en el destino.'} }
];

const QUIZ = [
{tag:'CPU', c:'gold', q:'R y Python, en el contraste del notebook, usan por defecto…', opts:['Todos los núcleos','Un solo CPU aunque haya más','Solo la GPU','El cluster manager'], a:1, why:'El monitor del taller muestra un hilo en pandas y en numpy.'},
{tag:'CPU', c:'gold', q:'Los dos límites al escalar que marca el taller son…', opts:['Licencias y red','Memoria (no cabe en RAM) y tiempo (baja latencia)','Solo el disco','Solo el driver'], a:1, why:'Si no cabe en RAM, o si la latencia no da, una máquina se queda corta.'},
{tag:'Paralelo', c:'blue', q:'Procesamiento paralelo, en el sentido del notebook, es…', opts:['Siempre varias máquinas','Repartir el trabajo en los CPUs de una máquina','Solo MapReduce','Escribir en HDFS'], a:1, why:'Paralelo aprovecha los núcleos. Distribuido es cuando esas tareas cambian de computadora.'},
{tag:'Paralelo', c:'blue', q:'Procesamiento distribuido es…', opts:['Lo contrario de cualquier paralelismo','Paralelismo cuyas tareas corren en distintas computadoras del clúster','Un solo hilo','Solo SQL'], a:1, why:'Es un subconjunto del paralelismo, no otro universo.'},
{tag:'Paralelo', c:'blue', q:'Si cae el único nodo de un master local[*]…', opts:['Otro datacenter retoma el linaje solo','Cae el proceso entero','Solo se pierde un executor y el driver sigue en otra máquina','AQE lo evita'], a:1, why:'local no es un clúster. La tolerancia a un executor caído aparece cuando hay varios nodos.'},
{tag:'Spark', c:'purple', q:'Spark es más rápido que MapReduce en iteraciones porque…', opts:['Persiste cada paso en disco','Mantiene los intermedios en memoria','No tiene shuffle','Solo corre en un CPU'], a:1, why:'MapReduce escribe disco entre map y reduce. Spark evita ese viaje cuando la RAM alcanza.'},
{tag:'Spark', c:'purple', q:'Como sistema, Spark es…', opts:['Un almacén equivalente a HDFS','Un motor de procesamiento: lee HDFS, S3, JDBC, Kafka o Parquet','Una base OLTP','El reemplazo de todos los metadatos de Hadoop'], a:1, why:'No es almacenamiento. El dato vive en otro sistema.'},
{tag:'Spark', c:'purple', q:'Correr Spark sobre Hadoop significa sobre todo…', opts:['Borrar HDFS','Usar YARN + HDFS y reemplazar MapReduce como motor de cómputo','Que Spark es HDFS','Eliminar el driver'], a:1, why:'Se sustituye el motor, no necesariamente todo el ecosistema.'},
{tag:'Spark', c:'purple', q:'Motor unificado quiere decir…', opts:['Solo batch','Batch, SQL, streaming, ML y grafos en el mismo motor','Solo RDD','Solo Python'], a:1, why:'Una sola máquina de ejecución para esas modalidades.'},
{tag:'Stack', c:'teal', q:'Spark Core se encarga de…', opts:['Solo PageRank','Scheduling, memoria, fallos y RDD','Solo el catálogo Delta','El BI del DWH'], a:1, why:'Es la base. SQL, grafos y ML se apoyan ahí.'},
{tag:'Stack', c:'teal', q:'Quién convierte el programa en DAG y coordina las stages…', opts:['Cada executor por su cuenta','El driver','El archivo Parquet','StopWordsRemover'], a:1, why:'El driver planifica. Los executors ejecutan.'},
{tag:'Stack', c:'teal', q:'El cluster manager…', opts:['Guarda los Parquet','Asigna recursos (Standalone, YARN o Kubernetes)','Ejecuta el SQL línea a línea en Python','Es el shuffle'], a:1, why:'Reparte CPU y memoria. Mesos queda como nota deprecada.'},
{tag:'Stack', c:'teal', q:'En modo cluster el driver…', opts:['Vive en el laptop de quien lanzó el notebook','Corre dentro del clúster','No existe','Es un executor sin tasks'], a:1, why:'client lo deja en tu máquina. cluster lo mueve adentro. local lo mete todo en una JVM.'},
{tag:'Stack', c:'teal', q:'Los executors…', opts:['Solo dibujan el DAG','Ejecutan tasks, guardan cache y reportan al driver','Son el cluster manager','Infieren el esquema dos veces'], a:1, why:'Trabajo y caché local. La coordinación no es de ellos.'},
{tag:'Sesion', c:'orange', q:'La regla de oro de PySpark dice que…', opts:['Todo corre dentro del intérprete, fila a fila','El procesamiento va en otro entorno: piensa en ejecución remota, incluso con local[*]','collect es la forma correcta de traer millones de filas','Las UDF son siempre más rápidas que Spark SQL'], a:1, why:'local[*] no cancela la regla. El plan igual lo ejecuta el motor.'},
{tag:'Sesion', c:'orange', q:'collect() sobre un dataset grande…', opts:['Deja los datos en los executors','Trae todo al driver y puede tumbarlo','Es una transformación lazy','Equivale a cache()'], a:1, why:'El driver no es un almacén. Para mirar, limit o una muestra.'},
{tag:'Sesion', c:'orange', q:'Una UDF de Python frente a una función nativa de Spark SQL suele ser…', opts:['Más rápida','Más lenta','Obligatoria para filter','Una transformación narrow'], a:1, why:'Sale del código generado de Catalyst. Úsala cuando no haya función nativa.'},
{tag:'Quirk', c:'orange', q:'En el Colab, si el apt de OpenJDK 8 falla pero JAVA_HOME apunta a Java 21…', opts:['Spark no puede arrancar nunca','Puede funcionar con Java 21 si Spark ya está descomprimido','Hay que volver a pandas','Hay que borrar SPARK_HOME'], a:1, why:'El taller queda en Java 21. Forzar Java 8 solo si el runtime lo pide.'},
{tag:'DF', c:'pink', q:'Declarar el esquema al leer un CSV…', opts:['Obliga una segunda pasada para adivinar tipos','Evita la doble pasada de inferSchema y el "todo string"','Desactiva Catalyst','Crea un shuffle'], a:1, why:'inferSchema recorre el archivo para adivinar. El esquema declarado no.'},
{tag:'DF', c:'pink', q:'En una expresión de columnas con aritmética, la forma preferida es…', opts:['El atributo df.col cuando el nombre tiene espacios','F.col','toPandas en cada fila','collect y un for'], a:1, why:'El string y el atributo alcanzan para un nombre simple. F.col aguanta la expresión.'},
{tag:'DF', c:'pink', q:'createOrReplaceTempView…', opts:['Publica la tabla en el DWH para siempre','Crea una vista solo de esa sesión, sobre el mismo Catalyst','Escribe Parquet','Materializa el resultado en disco'], a:1, why:'Se va con la sesión. El SQL y el DataFrame comparten optimizador.'},
{tag:'DF', c:'pink', q:'En PySpark, la API recomendada hoy es…', opts:['RDD para todo','DataFrame. El Dataset tipado es de Scala o Java','Solo SQL, sin DataFrame','Solo pandas'], a:1, why:'El RDD no pasa por Catalyst. El Dataset tipado no es el modelo de Python.'},
{tag:'Lazy', c:'gold', q:'select, filter o groupBy…', opts:['Ejecutan el job al instante','Construyen el plan y esperan una acción','Siempre hacen shuffle','Llaman a spark.stop()'], a:1, why:'Son transformaciones. La acción es el gatillo.'},
{tag:'Lazy', c:'gold', q:'¿Cuál de estas es una acción?', opts:['select','withColumn','count','filter'], a:2, why:'count pide un resultado. Las otras tres alargan el plan.'},
{tag:'Lazy', c:'gold', q:'where y filter en un DataFrame…', opts:['where es wide y filter es narrow siempre','Son alias','where solo existe dentro de un string SQL','filter borra el linaje'], a:1, why:'Mismo método con dos nombres.'},
{tag:'Lazy', c:'gold', q:'explain() en el taller sirve para…', opts:['Disparar el write','Ver el plan físico; explain(True) añade lógico, optimizado y físico','Hacer cache','Elegir el cluster manager'], a:1, why:'Muestra el plan. No sustituye a show, count o write.'},
{tag:'Shuffle', c:'blue', q:'Una transformación narrow…', opts:['Siempre cruza la red','Hace que cada partición de salida dependa de una de entrada, sin shuffle','Es solo groupBy','Es solo orderBy'], a:1, why:'map, filter, select y un withColumn simple son narrow. groupBy y orderBy son wide.'},
{tag:'Shuffle', c:'blue', q:'La fórmula del resumen es…', opts:['1 transformación = 1 stage','1 acción = 1 job; stages entre shuffles; tasks por partición','1 executor = 1 job','1 cache = 1 DAG'], a:1, why:'El shuffle es la frontera de stage. La task suele ser una partición.'},
{tag:'Shuffle', c:'blue', q:'coalesce(n) frente a repartition(n)…', opts:['coalesce sube particiones con shuffle','coalesce solo baja particiones y evita un shuffle completo','Son idénticos','coalesce es un broadcast'], a:1, why:'Para subir o rebalancear de verdad, repartition. Para bajar al final, coalesce.'},
{tag:'Shuffle', c:'blue', q:'persist() sin argumentos usa por defecto… y cache() equivale a…', opts:['DISK_ONLY y MEMORY_AND_DISK','MEMORY_AND_DISK y persist(MEMORY_ONLY)','Solo GPU y solo disco','Ninguno guarda nada'], a:1, why:'El taller persiste tweets con el default de persist. cache es la variante solo memoria.'},
{tag:'Opt', c:'purple', q:'Catalyst…', opts:['Ejecuta bytes off-heap','Optimiza el plan: pushdown, column pruning y plan físico','Reparte chunks','Tokeniza tweets'], a:1, why:'Tungsten es la ejecución. Catalyst es el optimizador. AQE reoptimiza después.'},
{tag:'Opt', c:'purple', q:'AQE…', opts:['Se apaga al leer CSV','Reoptimiza en runtime con estadísticas reales, por ejemplo el join tras el shuffle','Es un formato de archivo','Reemplaza al driver'], a:1, why:'Usa tamaños medidos, no solo los estimados del plan inicial.'},
{tag:'Opt', c:'purple', q:'Un broadcast join conviene cuando…', opts:['Las dos tablas son enormes','Una tabla es pequeña y se copia a los executors','Hay que hacer repartition(1)','Se usa un RDD sin esquema'], a:1, why:'Típico en estrella: dimensión chica, hechos grandes, sin shuffle de los hechos.'},
{tag:'Opt', c:'purple', q:'Parquet se prefiere a CSV en Spark porque…', opts:['Es más fácil de leer en un editor de texto','Es columnar, comprimido, y permite predicate pushdown','No tiene tipos','Obliga un shuffle'], a:1, why:'CSV parsea todo. Parquet lee las columnas que el plan pide.'},
{tag:'Texto', c:'teal', q:'El CSV de tweets que abre el código (no el markdown) se llama…', opts:['traindata.csv','twitter_training.csv','california_housing_train.csv','ejemplo_escritura_1.csv'], a:1, why:'El markdown dice traindata.csv. El código usa twitter_training.csv.'},
{tag:'Texto', c:'teal', q:'Para una nube de palabras coherente hay que tokenizar…', opts:['La columna text original, sin limpiar','text_clean, y luego stops, explode y groupBy count','Solo el id','El sentiment, y LDA antes del Tokenizer'], a:1, why:'Tokenizer sobre text crudo arrastra URLs. Sin el count no hay frecuencias.'},
{tag:'Texto', c:'teal', q:'El orden del modelado de tópicos en el taller es…', opts:['LDA, luego IDF, luego Tokenizer','CountVectorizer, IDF, LDA','StopWords antes de leer el CSV','explode antes del Tokenizer'], a:1, why:'Bolsa de palabras, peso IDF, y recién entonces LDA con k temas.'},
{tag:'DWH', c:'gold', q:'En el puente del resumen, el papel típico de Spark es…', opts:['Reemplazar el modelo estrella por un OLTP','ETL o ELT del lago hacia tablas curadas, o consultar un lakehouse','Ser el almacén definitivo de los tweets en RAM','Eliminar la granularidad de Kimball'], a:1, why:'Prepara y transforma. El almacenamiento sigue siendo lago, Delta o el DWH.'},
{tag:'Shuffle', c:'blue', q:'Para sumar montos por clave, groupByKey().map(sum) frente a reduceByKey…', opts:['Es igual de barato en red','Manda todos los valores crudos y puede OOM','Evita el shuffle por completo','Solo corre en el driver'], a:1, why:'[Learning Spark] reduceByKey hace combine local antes del shuffle. groupByKey no.'},
{tag:'Lazy', c:'gold', q:'Si solo haces filter/select y print("listo") sin count/show/write…', opts:['Spark ya leyó el archivo entero','No se ejecutó nada: solo creció el plan lazy','Obligas un shuffle','Se dispara un job vacío'], a:1, why:'[Learning Spark] Sin acción no hay stages ni lectura. El print engaña.'},
{tag:'Shuffle', c:'blue', q:'Tras repartition/partitionBy de un dataset que reusas, si omites persist…', opts:['El shuffle queda materializado para siempre','Cada acción puede rehacer el shuffle desde el linaje','Catalyst lo cachea solo','coalesce deja de funcionar'], a:1, why:'[Learning Spark] partitionBy/repartition son lazy. Sin persist, cada acción reevalúa.'},
{tag:'Opt', c:'purple', q:'Un lago con CSV crudo + SELECT * pay-per-scan suele…', opts:['Aprovechar column pruning automáticamente','Romperse con cambios de esquema y disparar facturas altas','Dar ACID gratis','Ser el formato preferido de Catalyst'], a:1, why:'[Fundamentals] Schema-on-read con CSV es frágil; SELECT * anula pruning. Prefiere Parquet/particionado.'},
{tag:'Opt', c:'purple', q:'Si Parquet anota en el pie "edad 18–35" y filtras edad > 50…', opts:['Spark descarga el bloque igual','Puede saltar el bloque sin leer los datos','Obliga un shuffle wide','Convierte el archivo a CSV'], a:1, why:'[quiz16] Stats del footer + predicate pushdown = block skipping.'},
{tag:'DWH', c:'gold', q:'Carpetas /ventas/año=2026/mes=11/ en el lago sirven para…', opts:['Forzar un collect al driver','Que el WHERE por año/mes ignore el resto de carpetas','Reemplazar a Catalyst','Borrar Bronze cada noche'], a:1, why:'[quiz16] Partición física (Hive-style): menos archivos escaneados, menos costo.'},
{tag:'DWH', c:'teal', q:'En el medallón, ¿quién limpia nulos y tipos hacia Parquet?', opts:['La capa Gold sola, sin motor','Silver, típicamente con Spark','Solo el POS','El cluster manager'], a:1, why:'[quiz16] Bronze aterriza; Silver limpia; Gold agrega para BI.'}
];

const CASES = [
{ title:'Caso 1 · Java 8 que no instala', prompt:'En Colab la celda de openjdk-8 falla con 404 en apt, pero la siguiente fija JAVA_HOME en java-21-openjdk-amd64 y Spark ya está descomprimido. ¿Arrancas igual o reinsistes con Java 8?', solution:'<strong>Arranca con Java 21.</strong> El apt de Java 8 es un quirk del notebook, no un requisito si el runtime no lo exige. Revisa que <code>JAVA_HOME</code> y <code>SPARK_HOME</code> apunten a rutas reales y que <code>findspark.init()</code> corra antes de crear la sesión.', h1:'¿Qué variable lee el proceso de Java?', h2:'¿En qué orden van findspark y SparkSession?', rubric:'Rúbrica: 2 diagnóstico del quirk + 2 variables de entorno + 1 cuándo sí forzar Java 8.'},
{ title:'Caso 2 · El CSV que no aparece', prompt:'El markdown del taller dice abrir /content/traindata.csv. FileNotFoundError. El archivo que subiste se llama twitter_training.csv. ¿Qué haces?', solution:'<strong>Usa el nombre del código:</strong> <code>/content/twitter_training.csv</code>. El markdown está desfasado. La otra opción es renombrar el archivo al subirlo. El esquema sigue siendo <code>id long, user string, sentiment string, text string</code>, no inferSchema.', h1:'¿Por qué inferSchema falla en este CSV?', h2:'¿Qué cuenta una fila con id nulo?', rubric:'Rúbrica: 2 nombre correcto + 2 esquema explícito + 1 filas corruptas.'},
{ title:'Caso 3 · collect de los tweets', prompt:'Quieres ver "todos" los tweets en una variable Python y escribes df_twitter.collect() sobre ~1,6 millones de filas. El driver se queda sin memoria. ¿Qué rompiste y qué usas en su lugar?', solution:'<strong>La regla de oro.</strong> collect trae el dataset completo al proceso del driver. Para inspeccionar: <code>show</code>, <code>limit</code> o un <code>toPandas()</code> de una muestra chica (la nube puede ir con <code>word_counts.limit(500)</code>). Las agregaciones se quedan en el clúster.', h1:'¿Dónde corre el procesamiento?', h2:'¿Qué diferencia hay entre show y collect?', rubric:'Rúbrica: 2 regla de oro + 2 alternativa + 1 por qué el driver no es un almacén.'},
{ title:'Caso 4 · Un solo CSV o diez Parquet', prompt:'Vas a entregar housing. Alguien pide "un archivo que pueda abrir" y otra persona va a releerlo con Spark. Tienes repartition(1).csv y repartition(10).parquet. ¿Cuál eliges para cada quien?', solution:'<strong>repartition(1)</strong> y CSV: un solo archivo, fácil para un humano, pésimo para paralelismo. <strong>repartition(10)</strong> y Parquet: varios archivos columnares, mejor lectura distribuida y predicate pushdown. No uses el de un archivo como formato de producción.', h1:'¿repartition hace shuffle?', h2:'¿Por qué Parquet gana al CSV en el scan?', rubric:'Rúbrica: 2 efecto de repartition(1) + 2 Parquet + 1 cuándo coalesce bastaría.'},
{ title:'Caso 5 · Nulos raros en total_rooms', prompt:'El StructType de housing declara total_rooms como IntegerType y el resto como DoubleType. Tras el read aparecen nulos donde el CSV trae números con decimal, o columnas corridas. ¿Cómo lo corriges?', solution:'<strong>Esquema homogéneo en la lectura</strong> (todo double, como el CSV real) y el cast a entero después, en el select, con alias. La otra vía es <code>inferSchema=True</code> más un cast explícito. Mezclar tipos en el schema del CSV no "redondea": descarta o desplaza.', h1:'¿Qué evita declarar el esquema, además de los tipos?', h2:'¿Dónde hace el cast el pipeline corregido?', rubric:'Rúbrica: 2 causa + 2 esquema double + 1 cast posterior.'},
{ title:'Caso 6 · La nube sin frecuencias', prompt:'El Tokenizer apunta a text, las líneas de groupBy("token").count() están comentadas, y el WordCloud espera un dict count que no existe. ¿Qué pipeline dejas?', solution:'Limpia a <code>text_clean</code> (URLs, menciones, signos, minúsculas) y <code>persist</code>. Tokenizer sobre <code>text_clean</code>, StopWordsRemover, <code>explode</code>, y <strong>groupBy token + count</strong> ordenado. Recién una muestra con <code>limit</code> puede bajar a pandas para dibujar.', h1:'¿Por qué no tokenizar text crudo?', h2:'¿Qué hace explode?', rubric:'Rúbrica: 2 text_clean + 2 explode/count + 1 persist si hay varias acciones.'},
{ title:'Caso 7 · Hechos unidos a una dimensión chica', prompt:'Una tabla de hechos enorme se une a una dimensión de producto que cabe holgada en memoria. El plan muestra un shuffle de las dos. ¿Qué le pides a Spark y qué riesgo queda?', solution:'<strong>Broadcast</strong> de la dimensión: se copia a los executors y los hechos no viajan. Es el patrón estrella del resumen. El riesgo es declarar chica una tabla que no cabe: los executors se quedan sin memoria. AQE puede cambiar la estrategia al ver el tamaño real post-shuffle, pero no adivina si la dimensión ya no entra.', h1:'¿Qué optimizador reescribe el join?', h2:'¿Qué mide AQE que el plan inicial solo estima?', rubric:'Rúbrica: 2 broadcast + 2 hecho vs dimensión + 1 riesgo de memoria.'},
{ title:'Caso 8 · La limpieza corre tres veces', prompt:'df_clean alimenta el top de usuarios ya calculado aparte, luego la nube y luego el LDA, sin persist. Cada acción tarda como si releyera y reaplicara la regex. ¿Qué falta y cuándo lo sueltas?', solution:'<code>persist()</code> (default MEMORY_AND_DISK) después del filtro de limpieza, porque hay varias acciones sobre el mismo linaje. <code>cache()</code> sería solo memoria. Al terminar el ML, <code>unpersist()</code> para no dejar la copia ocupando el executor.', h1:'¿Cuántos jobs dispara cada acción?', h2:'¿Qué default tiene persist() sin argumentos?', rubric:'Rúbrica: 2 por qué se recomputa + 2 persist vs cache + 1 unpersist.'},
{ title:'Caso 9 · Suma por clave con groupByKey', prompt:'Tienes pares (producto_id, monto) de ~100 GB. Un compañero escribe groupByKey().mapValues(sum). La red se satura y un executor hace OOM en un producto popular. ¿Qué pedís en su lugar y por qué?', solution:'<strong>[Learning Spark] reduceByKey</strong> (o aggregate/combine con reduce local) suma dentro de cada partición antes del shuffle. groupByKey manda listas crudas y materializa todas las ventas de esa clave en un nodo. En DataFrame: <code>groupBy("producto_id").sum("monto")</code> ya va por Catalyst con agregación parcial. <strong>Trade-off:</strong> reduceByKey exige asociatividad; groupByKey es más general y más caro.', h1:'¿Qué es el map-side combine?', h2:'¿Cuál es el equivalente DataFrame?', rubric:'Rúbrica: 2 diagnóstico + 2 reduceByKey/DF + 1 trade-off.'},
{ title:'Caso 10 · MERGE cada 5 s sobre Parquet', prompt:'Un CDC dispara MERGE sobre tablas Parquet en S3 cada pocos segundos. El pipeline se atrasa horas y el cómputo se dispara. ¿Qué está pasando físicamente y qué cambiás?', solution:'<strong>[Fundamentals] Copy-on-Write:</strong> actualizar pocas filas reescribe archivos columnares enteros. Agrupa el MERGE en micro-lotes (minutos), compacta y VACUUM/optimize. No trates Parquet como un heap fila-a-fila de Postgres. <strong>Trade-off:</strong> latencia de frescura vs. costo de reescritura.', h1:'¿Por qué Parquet es inmutable a nivel archivo?', h2:'¿Qué problema de "archivos pequeños" aparece si insertás 1 fila por PUT?', rubric:'Rúbrica: 2 COW + 2 loteo + 1 trade-off.'}
];

const GLOSSARY = [
['CPU','Núcleo de cómputo. Pandas y numpy, por defecto, usan uno solo. (notebook)'],
['RAM','Memoria para datos e intermedios. Si el dataset no cabe, el límite es de memoria. (notebook)'],
['Procesamiento paralelo','Repartir el trabajo entre los CPUs de una máquina. (notebook)'],
['Procesamiento distribuido','Paralelismo en el que las tareas corren en distintas computadoras del clúster. (notebook)'],
['Apache Spark','Motor de procesamiento distribuido en memoria. No es un sistema de almacenamiento. (resumen)'],
['MapReduce','Motor batch de Hadoop que persiste en disco entre map y reduce. (resumen)'],
['Spark Core','Base del stack: scheduling, memoria, fallos y RDD. (notebook)'],
['Spark SQL','DataFrames y SQL sobre el mismo Catalyst. (notebook)'],
['GraphX','Biblioteca de grafos del stack (PageRank y similares). (notebook)'],
['SparkML','Pipelines de ML del taller: clasificación, clustering, LDA. En código, pyspark.ml. (notebook)'],
['Structured Streaming','Micro-batches: el stream se ve como una tabla que crece. (resumen)'],
['Driver','Proceso que crea la SparkSession, arma el DAG y coordina stages y tasks. (resumen)'],
['Executor','Proceso que ejecuta tasks, guarda cache y reporta al driver. (resumen)'],
['Cluster manager','Asigna recursos: Standalone, YARN o Kubernetes. Mesos está deprecado. (resumen)'],
['SparkSession','Punto de entrada de PySpark. Se cierra con spark.stop(). (notebook)'],
['PySpark','API Python de Spark. El cómputo no corre dentro del bucle de Python. (notebook)'],
['Regla de oro','Pensar en ejecución remota aunque el master sea local[*]. (notebook)'],
['RDD','Colección distribuida, inmutable y lazy, con linaje. Sin Catalyst. (resumen)'],
['DataFrame','Tabla con columnas nombradas y tipadas. API recomendada en PySpark. (resumen)'],
['Dataset','DataFrame tipado de Scala o Java. También pasa por Catalyst. (resumen)'],
['Transformación','Operación lazy que alarga el plan: select, filter, join, groupBy. (resumen)'],
['Acción','Operación que dispara un job: show, count, collect, write. (resumen)'],
['Narrow','La partición de salida depende de una sola de entrada. Sin shuffle. (resumen)'],
['Wide','La salida depende de muchas particiones. Hay shuffle. (resumen)'],
['Shuffle','Redistribución por red o disco. Es la operación cara y la frontera de stage. (resumen)'],
['reduceByKey','Agregación por clave con combine local antes del shuffle; más barata que groupByKey. (Learning Spark)'],
['groupByKey','Agrupa todos los valores por clave sin combine local; caro en red y RAM. (Learning Spark)'],
['Copy-on-Write','Al actualizar, se reescribe el archivo columnar entero; loteá MERGEs. (Fundamentals)'],
['Stage','Tramo del job entre dos shuffles. (resumen)'],
['Job','Unidad que dispara una acción. (resumen)'],
['Task','Unidad de trabajo de una stage, en lo típico una por partición. (resumen)'],
['DAG','Grafo de transformaciones que el driver construye antes de ejecutar. (resumen)'],
['Linaje','Historia de transformaciones con la que se reconstruye una partición perdida. (resumen)'],
['repartition','Cambia el número de particiones hacia arriba o abajo, con shuffle. (resumen)'],
['coalesce','Solo reduce particiones, sin un shuffle completo. (resumen)'],
['cache','Atajo de persist(MEMORY_ONLY). (resumen)'],
['persist','Guarda el DataFrame para reutilizarlo. Sin argumentos: MEMORY_AND_DISK. (notebook)'],
['Catalyst','Optimizador: predicate pushdown, column pruning y plan físico. (resumen)'],
['Tungsten','Ejecución eficiente: memoria off-heap y código generado. (resumen)'],
['AQE','Reoptimización en runtime con estadísticas reales. (resumen)'],
['Broadcast join','Copia una tabla pequeña a los executors para no shufflear la grande. (resumen)'],
['Parquet','Formato columnar comprimido. El preferido para leer y escribir en Spark. (resumen)'],
['Delta Lake','Capa ACID y time travel sobre Parquet. Pieza de un lakehouse. (resumen)'],
['Medallón','Bronze crudo, Silver limpio (Spark), Gold curado para BI. (quiz16)'],
['Block skipping','Saltar bloques de Parquet gracias a min/max en el footer. (quiz16)'],
['Tokenizer','Parte una columna de texto en una lista de palabras. En el taller, sobre text_clean. (notebook)'],
['StopWordsRemover','Quita artículos y preposiciones de esa lista de tokens. (notebook)'],
['LDA','Modelo de tópicos no supervisado. Va después de CountVectorizer e IDF. (notebook)'],
['Lakehouse','Lago de archivos (Parquet) más transacciones ACID, consultable con SQL. (resumen)'],
['Predicate pushdown','Empujar el filtro al lector, para no traer bloques que no pasan el WHERE. (resumen)'],
['UDF','Función Python registrada en Spark. Más lenta que una función nativa de Spark SQL. (notebook)'],
['collect','Acción que trae todas las filas al driver. Peligrosa en datasets grandes. (notebook)'],
['explain','Muestra el plan. explain(True) añade lógico, optimizado y físico. (notebook)'],
['ETL','Transformar antes de cargar al destino analítico. (resumen)'],
['ELT','Cargar crudo y transformar en el destino, con Spark o dbt. (resumen)'],
['Inmon','DWH integrado, orientado a temas, histórico y no volátil. (resumen)'],
['Kimball','Modelado dimensional: granularidad primero, estrella o copo, dimensiones conformadas. (resumen)']
];

const CHEATSHEET = `
<div class="card accent-gold"><h3 style="margin-top:0;">Recursos y modos</h3><p style="font-size:14px;">Un CPU por defecto en pandas/numpy. Límites: <strong>RAM</strong> (datos e intermedios) y <strong>tiempo</strong>. Paralelo = N núcleos. Distribuido = N máquinas. <code>local[*]</code> es una JVM, no un clúster.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">Spark vs MapReduce</h3><p style="font-size:14px;">Intermedios en <strong>memoria</strong>. Motor unificado: batch, SQL, streaming, ML, grafos. <strong>No es almacenamiento</strong>. Sobre Hadoop reemplaza el motor (YARN + HDFS), no todo el ecosistema.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Arquitectura</h3><p style="font-size:14px;"><strong>Driver</strong> arma el DAG. <strong>Cluster manager</strong> asigna (Standalone, YARN, K8s). <strong>Executors</strong> corren tasks y cachean. Modos: local, client (driver en tu máquina), cluster (driver adentro).</p></div>
<div class="card accent-orange"><h3 style="margin-top:0;">Regla de oro</h3><p style="font-size:14px;">Ejecución remota incluso en <code>local[*]</code>. Nada de bucles fila a fila. <code>collect</code> y <code>toPandas</code> solo para muestras. UDF más lenta que Spark SQL. Cerrar con <code>spark.stop()</code>. Java 21 alcanza en el Colab.</p></div>
<div class="card accent-pink"><h3 style="margin-top:0;">DataFrame</h3><p style="font-size:14px;">Schema DDL o StructType evita la doble pasada. <code>F.col</code> en expresiones. Vista temporal = solo esta sesión, mismo Catalyst. RDD sin optimizar; Dataset tipado es Scala/Java.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Lazy y shuffle</h3><p style="font-size:14px;"><strong>1 acción = 1 job → stages entre shuffles → tasks por partición.</strong> Narrow no mueve datos. Wide sí. <code>repartition</code> sube o baja con shuffle. <code>coalesce</code> solo baja. <code>persist()</code> = MEMORY_AND_DISK. <code>cache()</code> = MEMORY_ONLY.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">Optimización y archivos</h3><p style="font-size:14px;"><strong>Catalyst</strong> (pushdown, pruning) · <strong>Tungsten</strong> (off-heap, codegen) · <strong>AQE</strong> (stats reales). Broadcast si la dimensión cabe. Parquet columnar. Delta / Iceberg / Hudi = lakehouse.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Tweets y DWH</h3><p style="font-size:14px;">Archivo <code>twitter_training.csv</code>. Schema explícito. Tokenizar <code>text_clean</code>. Tokenizer → stops → explode → count. Luego CountVectorizer → IDF → LDA. Puente: fuentes → Spark → lake/Delta → DWH, o ELT en el destino.</p></div>
`;
