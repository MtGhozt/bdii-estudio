const MODULES = [
{ id:'m0', tag:'MÃ³dulo 0', accent:'gold', title:'Recursos: CPU, RAM y los dos lÃ­mites',
summary:'Un solo nÃºcleo por defecto, memoria para intermedios, y cuÃ¡ndo una mÃ¡quina no alcanza.',
html: `
<p class="lede">Antes de repartir el trabajo hay que ver con quÃ© se cuenta: nÃºcleos, memoria y disco. El taller arranca ahÃ­, con pandas y numpy en un hilo.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>En anÃ¡lisis de datos los recursos se agrupan en <strong>capacidad de procesamiento</strong> (CPUs; GPUs en casos especiales) y <strong>capacidad de memoria y disco</strong>. La RAM guarda los datos y tambiÃ©n los <strong>intermedios</strong> del cÃ³mputo. El disco entra cuando la RAM no alcanza.</div>
<table><tr><th>LimitaciÃ³n</th><th>CÃ³mo se manifiesta</th></tr>
<tr><td><strong>Memoria</strong></td><td>El dataset no cabe en la RAM de una sola mÃ¡quina.</td></tr>
<tr><td><strong>Tiempo</strong></td><td>Hace falta baja latencia, casi tiempo real, y un solo hilo no llega.</td></tr></table>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>R y Python <strong>por defecto usan un solo CPU</strong> aunque el equipo tenga mÃ¡s nÃºcleos. El notebook lo contrasta con dos demos: <code>pandas</code> sobre <code>california_housing_train.csv</code> (~17&nbsp;000 filas, barras por edad de la vivienda) y <code>numpy</code> sumando una matriz 800Ã—800, con un solo hilo visible en el monitor.</div>
<div class="callout info"><div class="lbl">[resumen]</div>Los DWH modernos y motores como Spark atacan el mismo problema: <strong>muchas filas y consultas pesadas</strong>, con paralelismo y, en clÃºster, <strong>MPP</strong>.</div>
<div class="trade"><b>Trade-off 0 Â· Quedarse en un proceso.</b> Ganas: el cÃ³digo de pandas o numpy es directo. Pierdes: el resto de nÃºcleos y cualquier dataset que no quepa en esa RAM.</div>
`,
mini:{q:'SegÃºn el taller, pandas y numpy por defecto usanâ€¦', opts:['Todos los nÃºcleos del equipo','Un solo CPU','La GPU siempre','Un executor por columna'], a:1, why:'El notebook lo muestra a propÃ³sito: un hilo, aunque haya mÃ¡s nÃºcleos.'} },
{ id:'m1', tag:'MÃ³dulo 1', accent:'blue', title:'Procesamiento paralelo vs distribuido',
summary:'Un nodo con N nÃºcleos frente a N mÃ¡quinas. local[*] no es un clÃºster.',
html: `
<p class="lede">Paralelo y distribuido no son sinÃ³nimos. Distribuido es el caso en que las tareas ya no viven en la misma computadora.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div><strong>Procesamiento paralelo:</strong> el cÃ³digo se divide en procesos o hilos que aprovechan los CPUs de una mÃ¡quina (o de varias, si hay red). <strong>Procesamiento distribuido:</strong> subconjunto de ese paralelismo en el que las tareas corren en <strong>distintas computadoras</strong> del clÃºster.</div>
<pre><code>rdd = spark.sparkContext.parallelize(range(800 * 800))</code></pre>
<div class="callout info"><div class="lbl">[resumen]</div>En clÃºster las particiones del dataset viven en varios nodos. Spark puede ir de una mÃ¡quina a miles; el modo dice dÃ³nde corren esas particiones.</div>
<table><tr><th></th><th>Paralelo (multiproceso)</th><th>Distribuido</th></tr>
<tr><td>Alcance</td><td>1 nodo, N cores</td><td>N nodos, NÃ—cores</td></tr>
<tr><td>Ejemplo Spark</td><td><code>local[*]</code></td><td>YARN / Kubernetes / Standalone</td></tr>
<tr><td>Fallo</td><td>Cae el nodo y cae todo</td><td>Puede tolerarse la caÃ­da de un executor (linaje)</td></tr></table>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div><code>local[*]</code> es paralelo dentro de <strong>una JVM</strong> (un hilo por nÃºcleo). No es un clÃºster: si esa mÃ¡quina muere, no hay otro nodo que retome el linaje.</div>
<div class="trade"><b>Trade-off 1 Â· Una mÃ¡quina vs un clÃºster.</b> Ganas en local: cero operaciÃ³n de clÃºster, ideal para el Colab. Pierdes: techo de RAM y un solo punto de fallo.</div>
`,
mini:{q:'Procesamiento distribuido, en el notebook, esâ€¦', opts:['Cualquier uso de mÃ¡s de un nÃºcleo','Tareas en distintas computadoras del clÃºster','Solo SQL','Escribir un CSV'], a:1, why:'Distribuido es el paralelismo que cruza de mÃ¡quina.'} },
{ id:'m2', tag:'MÃ³dulo 2', accent:'purple', title:'Spark frente a Hadoop MapReduce',
summary:'Memoria en vez de disco entre etapas, motor unificado, y Spark no guarda los datos.',
html: `
<p class="lede">Spark nace en UC Berkeley (AMPLab, 2009, Matei Zaharia) y pasa a la Apache Software Foundation. Es un motor de procesamiento distribuido, no un almacÃ©n.</p>
<div class="callout info"><div class="lbl">[resumen]</div>Procesa <strong>en memoria</strong>, asÃ­ que en iteraciones va mucho mÃ¡s rÃ¡pido que MapReduce, que <strong>persiste en disco</strong> entre map y reduce. Es un <strong>motor unificado</strong>: batch, SQL, streaming, ML y grafos. Lenguajes: Scala (nativo), Python (PySpark), Java, R y SQL. <strong>No es almacenamiento:</strong> lee HDFS, S3, Azure Blob, JDBC, Kafka, Parquet y otros.</div>
<table><tr><th>Aspecto</th><th>MapReduce</th><th>Spark</th></tr>
<tr><td>Intermedios</td><td>Disco</td><td>Memoria (disco si hace falta)</td></tr>
<tr><td>Operaciones</td><td>map + reduce</td><td>map, filter, join, groupBy, SQLâ€¦</td></tr>
<tr><td>Modalidades</td><td>Batch</td><td>Batch, streaming, ML, SQL, grafos</td></tr>
<tr><td>Iteraciones (ML)</td><td>Lentas</td><td>Eficientes</td></tr>
<tr><td>API</td><td>Verbosa (Java)</td><td>Alto nivel (DataFrame, SQL)</td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El notebook lo resume asÃ­: Spark reparte el trabajo en <strong>una o miles</strong> de mÃ¡quinas y aprieta memoria y CPUs.</div>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>Spark puede correr <strong>sobre</strong> Hadoop (YARN + HDFS). Reemplaza a MapReduce como motor de cÃ³mputo. No tiene que reemplazar todo el ecosistema Hadoop.</div>
<div class="trade"><b>Trade-off 2 Â· Memoria contra disco.</b> Ganas: iteraciones rÃ¡pidas y un solo API. Pierdes: si el working set no cabe, Spark igual derrama a disco y el mito de "siempre en RAM" se cae.</div>
<div class="callout warn"><div class="lbl">[resumen]</div>Error comÃºn: tratar Spark como base de datos. No guarda el dataset; lo lee de otro sistema y puede escribir el resultado de vuelta.</div>
`,
mini:{q:'Â¿Por quÃ© Spark gana a MapReduce en iteraciones?', opts:['Porque no tiene shuffle','Porque mantiene intermedios en memoria','Porque solo corre en un CPU','Porque es un sistema de archivos'], a:1, why:'MapReduce escribe disco entre map y reduce. Spark evita ese viaje cuando la RAM alcanza.'} },
{ id:'m3', tag:'MÃ³dulo 3', accent:'teal', title:'Stack, driver, executors y despliegue',
summary:'Core, SQL, GraphX, SparkML, mÃ¡s el trÃ­o driver / cluster manager / executor.',
html: `
<p class="lede">El ecosistema se apila sobre un cluster manager y un almacÃ©n. Quien arma el plan es el driver; quien lo corre son los executors.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Nombres del notebook (el ML del taller es <strong>SparkML</strong>):</div>
<table><tr><th>Componente</th><th>Rol</th></tr>
<tr><td><strong>Spark Core</strong></td><td>Motor base: scheduling, memoria, fallos y <strong>RDD</strong>.</td></tr>
<tr><td><strong>Spark SQL</strong></td><td>DataFrames y consultas SQL.</td></tr>
<tr><td><strong>GraphX</strong></td><td>Grafos (PageRank y similares).</td></tr>
<tr><td><strong>SparkML</strong></td><td>Pipelines de ML: clasificaciÃ³n, clustering, LDA.</td></tr>
<tr><td><strong>Structured Streaming</strong></td><td>Datos en tiempo casi real: <strong>micro-batches</strong>, el stream se trata como <strong>una tabla que crece</strong>.</td></tr>
<tr><td><strong>MLlib</strong></td><td>API de ML del resumen. En la prÃ¡ctica moderna mucho vive en <code>pyspark.ml</code>.</td></tr></table>
<div class="callout info"><div class="lbl">[resumen]</div>Por debajo hay un <strong>cluster manager</strong> y un <strong>almacenamiento</strong> (HDFS, S3, Parquet, Delta, JDBC, Kafka). El driver crea la <code>SparkSession</code>, convierte el programa en un <strong>DAG</strong>, lo corta en stages y tasks, y coordina. El cluster manager (Standalone, YARN, Kubernetes; Mesos deprecado) asigna recursos. Los executors corren tasks, guardan cache y reportan al driver.</div>
<table><tr><th>Modo</th><th>DÃ³nde vive el driver</th></tr>
<tr><td><strong>local</strong></td><td>Todo en una JVM. <code>local[*]</code> = un hilo por nÃºcleo. Sirve para pruebas.</td></tr>
<tr><td><strong>client</strong></td><td>Driver en la mÃ¡quina de quien lanza el trabajo (notebook, IDE).</td></tr>
<tr><td><strong>cluster</strong></td><td>Driver dentro del clÃºster.</td></tr></table>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>Mnemotecnia: <strong>driver piensa, CM reparte, executor trabaja</strong>. Si el driver estÃ¡ en tu laptop (client) y cierras la sesiÃ³n, el trabajo se queda sin coordinador.</div>
<div class="trade"><b>Trade-off 3 Â· client vs cluster.</b> Ganas en client: ves logs y depuras desde el notebook. Pierdes: el driver compite con tu mÃ¡quina y un corte de red tumba el job.</div>
`,
mini:{q:'Â¿QuiÃ©n convierte el programa en un DAG?', opts:['Cada executor','El driver','El archivo Parquet','El Tokenizer'], a:1, why:'El driver planifica. Los executors ejecutan tasks.'} },
{ id:'m4', tag:'MÃ³dulo 4', accent:'orange', title:'PySpark, SparkSession y la regla de oro',
summary:'EjecuciÃ³n remota aunque el master sea local, mÃ¡s el quirk de Java en Colab.',
html: `
<p class="lede">PySpark es la librerÃ­a Python para un clÃºster Spark. Muchas operaciones de pandas tienen anÃ¡logo, con otros mÃ©todos. El cÃ³mputo no ocurre en el ciclo <code>for</code> de Python.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div><strong>Regla de oro:</strong> los procesamientos ocurren en un entorno de ejecuciÃ³n distinto al intÃ©rprete Python. Hay que pensar en <strong>ejecuciÃ³n remota</strong>, incluso con <code>master("local[*]")</code>.</div>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>Consecuencias que caen en el examen: no recorras filas con bucles Python masivos; no hagas <code>collect()</code> de un dataset grande (trae todo al driver); una UDF es mÃ¡s lenta que una funciÃ³n nativa de Spark SQL; <code>toPandas()</code> solo para una muestra o un grÃ¡fico.</div>
<div class="callout info"><div class="lbl">[resumen]</div>La sesiÃ³n es la puerta de entrada a las APIs (DataFrame, SQL, y el resto del stack). Crearla y cerrarla con <code>spark.stop()</code> libera los recursos del proceso.</div>
<h3>Secuencia tÃ­pica en Colab</h3>
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
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de Java.</strong> La primera celda intenta <code>apt-get install openjdk-8</code> y a veces el apt responde 404. La celda siguiente apunta <code>JAVA_HOME</code> a <code>java-21-openjdk-amd64</code>. En la prÃ¡ctica <strong>funciona con Java 21</strong> si Spark ya estÃ¡ descomprimido. No hace falta forzar Java 8 salvo que el runtime lo exija. Otro quirk: varias celdas dicen "Escriba el cÃ³digo aquÃ­" y la soluciÃ³n ya estÃ¡ en la celda de abajo.</div>
<div class="trade"><b>Trade-off 4 Â· La comodidad de Python.</b> Ganas: el mismo lenguaje que el resto del anÃ¡lisis. Pierdes: cada ida y vuelta con el driver (collect, toPandas, UDF fila a fila) borra la ventaja del motor.</div>
`,
mini:{q:'La regla de oro pide pensar el cÃ³mputo comoâ€¦', opts:['Un bucle Python sobre cada fila','EjecuciÃ³n remota, incluso en local[*]','Siempre un collect al final','Una UDF obligatoria'], a:1, why:'El intÃ©rprete Python arma el plan. El motor lo corre en otro lado.'} },
{ id:'m5', tag:'MÃ³dulo 5', accent:'pink', title:'DataFrames: lectura, esquema, select y SQL',
summary:'Housing en California: schema, tres formas de nombrar columnas, y una vista temporal.',
html: `
<p class="lede">Si el archivo estÃ¡ donde Spark puede leerlo, la carga es del motor, no de pandas. El taller lo practica con el CSV de vivienda.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>APIs de lectura: <code>spark.read.csv</code>, <code>json</code>, <code>parquet</code> (el preferido en producciÃ³n), <code>text</code> (una columna por lÃ­nea) y <code>kafka</code>. Opciones frecuentes: <code>header=True</code>, <code>inferSchema=True</code>, <code>schema=...</code>, y <code>mode("overwrite")</code> al escribir.</div>
<p>Dos caminos para housing. <strong>Pandas primero</strong> y luego <code>spark.createDataFrame(pddf)</code>: Ãºtil en un prototipo chico, porque el driver carga todo. <strong>Directo</strong> con <code>spark.read.csv(path, schema=..., header=True)</code>: es el camino que escala.</p>
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
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>Declarar el esquema evita la <strong>doble pasada</strong> de <code>inferSchema</code> y la sorpresa de "todo string". Alinea los tipos con el CSV real. El atributo <code>df.total_rooms</code> no sirve si el nombre tiene espacios: ahÃ­ manda <code>F.col</code>.</div>
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
<tr><td>Catalyst</td><td>No</td><td>SÃ­</td><td>SÃ­</td></tr>
<tr><td>Hoy en PySpark</td><td>Legado</td><td><strong>La API a usar</strong></td><td>No es el camino Python</td></tr></table><div class="callout info"><div class="lbl">[resumen]</div>En Scala, <code>DataFrame = Dataset[Row]</code>. El Dataset tipado solo existe en Scala/Java. En PySpark el camino es el DataFrame.</div>
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de tipos.</strong> Un ejemplo del notebook mezcla <code>IntegerType</code> en <code>total_rooms</code> con <code>DoubleType</code> en otras columnas. Si el header no calza, aparecen nulos raros. Mejor un esquema homogÃ©neo (todo double en la lectura) y el cast explÃ­cito despuÃ©s, o <code>inferSchema=True</code> mÃ¡s un cast.</div>
<div class="trade"><b>Trade-off 5 Â· inferSchema vs esquema declarado.</b> Ganas con inferir: una lÃ­nea y a explorar. Pierdes: una pasada extra y tipos adivinados. En producciÃ³n se declara.</div>
<h3>Pipeline housing (corregido)</h3><pre><code>df_conv.repartition(4).write.mode(overwrite).parquet(output/housing_parquet)</code></pre>
`,
mini:{q:'Una vista temporal creada con createOrReplaceTempViewâ€¦', opts:['Queda publicada en el DWH','Vive solo en esa SparkSession','Escribe Parquet','Desactiva Catalyst'], a:1, why:'Misma sesiÃ³n, mismo Catalyst que el API DataFrame. Al cerrar, desaparece.'} },
{ id:'m6', tag:'MÃ³dulo 6', accent:'gold', title:'EjecuciÃ³n perezosa, map-reduce y acciones',
summary:'El plan espera. explain lo muestra. show, count y write lo disparan.',
html: `
<p class="lede">Nada corre cuando escribes <code>select</code> o <code>filter</code>. Spark acumula el plan para poder achicarlo. La acciÃ³n es el gatillo.</p>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Las transformaciones construyen un plan. Las acciones lo ejecutan: <code>show</code>, <code>count</code>, <code>collect</code>, <code>write</code>, y tambiÃ©n <code>take</code> o <code>first</code>. <code>explain()</code> muestra el plan fÃ­sico sin correr el cÃ³mputo. <code>explain(True)</code> extiende: lÃ³gico, optimizado y fÃ­sico.</div>
<pre><code>plan = df.select((F.col("housing_median_age") + F.col("total_rooms")).alias("Housing_3"))
plan.explain()
plan.explain(True)</code></pre>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>El beneficio de esperar es un plan entero: menos shuffles, proyecciones fusionadas y <strong>predicate pushdown</strong>. Si "no pasa nada" despuÃ©s de un <code>filter</code>, falta la acciÃ³n.</div>
<h3>Map y reduce, como idea</h3>
<table><tr><th>Fase</th><th>Idea</th><th>En DataFrame</th></tr>
<tr><td><strong>Map</strong></td><td>Transformar cada registro</td><td><code>select</code>, <code>withColumn</code>, tokenizar</td></tr>
<tr><td><strong>Reduce</strong></td><td>Agrupar y agregar</td><td><code>groupBy("user").count()</code>, <code>agg(avg(...))</code></td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El notebook tambiÃ©n lo muestra en Python puro: la suma de cuadrados de 0 a 99 da <strong>338350</strong>. En el API DataFrame no hay funciones llamadas map y reduce: el patrÃ³n son transformaciones mÃ¡s <code>groupBy</code> / <code>agg</code>.</div>
<pre><code>from functools import reduce
l = list(range(100))
reduce(lambda x, y: x + y, map(lambda x: x**2, l))  # 338350</code></pre>
<div class="callout info"><div class="lbl">[resumen]</div>La transformaciÃ³n alarga el plan. La acciÃ³n lo ejecuta.</div>
<table><tr><th>Transformaciones (lazy)</th><th>Acciones</th></tr>
<tr><td><code>select</code>, <code>filter</code> / <code>where</code>, <code>withColumn</code>, <code>join</code>, <code>groupBy</code>, <code>distinct</code>, <code>flatMap</code>, <code>union</code></td><td><code>show</code>, <code>count</code>, <code>collect</code>, <code>take</code>, <code>first</code>, <code>reduce</code>, <code>saveAsTextFile</code>, <code>write</code></td></tr></table>
<p><code>where</code> y <code>filter</code> son <strong>alias</strong>. <code>describe()</code> devuelve count, mean, stddev, min y max de las columnas numÃ©ricas: es una acciÃ³n de perfilado. Un <code>groupBy</code> con agregaciÃ³n y clave distinta es una transformaciÃ³n <strong>wide</strong> (hay shuffle).</p>
<pre><code>df_conversion.select("median_income").where("total_rooms &gt; 5000").show()
df_conversion.filter(F.col("total_rooms") &gt; 5000).count()
(df_conversion.groupBy("housing_median_age")
    .agg(F.avg("median_house_value").alias("promedio_valor"),
         F.sum("median_income").alias("suma_ingreso"))
    .orderBy(F.desc("housing_median_age"))
    .show())</code></pre>
<div class="callout warn"><div class="lbl">[didÃ¡ctico Â· Learning Spark]</div>Encadenar <code>filter</code>/<code>select</code> y hacer <code>print("listo")</code> <strong>sin acciÃ³n</strong> no lee el archivo: solo alarga el plan. El error de ruta o de datos aparece en el <code>count</code>/<code>show</code>/<code>write</code>, no en la lÃ­nea del filtro.</div>
<div class="trade"><b>Trade-off 6 Â· Pereza.</b> Ganas: el motor ve el plan completo y tira trabajo inÃºtil. Pierdes: el error de datos aparece en la acciÃ³n, lÃ­neas despuÃ©s de donde escribiste el filtro.</div>
`,
mini:{q:'Â¿CuÃ¡l de estas dispara la ejecuciÃ³n?', opts:['select','withColumn','count','filter'], a:2, why:'count es acciÃ³n. select, withColumn y filter solo alargan el plan.'} },
{ id:'m7', tag:'MÃ³dulo 7', accent:'blue', title:'Narrow, wide, stages, particiones y cachÃ©',
summary:'DÃ³nde estÃ¡ el shuffle, cÃ³mo se parten los jobs, y cuÃ¡ndo persistir.',
html: `
<p class="lede">El linaje permite rehacer una particiÃ³n perdida. El shuffle es lo que parte ese grafo en stages y, de paso, lo que mÃ¡s cuesta.</p>
<div class="callout info"><div class="lbl">[resumen]</div>Un RDD es <strong>resiliente</strong> (el linaje reconstruye cada partici, y por eso no hace falta replicar los datos);Ã³n), <strong>distribuido</strong>, <strong>inmutable</strong> (cada transformaciÃ³n produce otro) y <strong>lazy</strong>. <strong>Narrow:</strong> una particiÃ³n de salida depende de una de entrada (<code>map</code>, <code>filter</code>, <code>select</code>, <code>withColumn</code> simple): sin shuffle. <strong>Wide:</strong> la salida depende de muchas entradas (<code>groupBy</code>, <code>join</code>, <code>distinct</code>, <code>orderBy</code>, <code>repartition</code>): hay shuffle por red o disco.</div>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>FÃ³rmula: <strong>1 acciÃ³n = 1 job â†’ N stages (cortados en cada shuffle) â†’ M tasks (una por particiÃ³n, en lo tÃ­pico).</strong></div>
<table><tr><th>MÃ©todo</th><th>Particiones</th><th>Shuffle</th><th>CuÃ¡ndo</th></tr>
<tr><td><code>repartition(n)</code></td><td>Sube o baja</td><td>SÃ­</td><td>Balancear, o justo antes de una escritura pesada.</td></tr>
<tr><td><code>coalesce(n)</code></td><td>Solo baja</td><td>Sin shuffle completo</td><td>Reducir particiones al final, mÃ¡s barato.</td></tr></table>
<div class="callout info"><div class="lbl">[clase/notebook]</div>Al escribir housing el taller hace <code>repartition(1)</code> para un solo CSV (cÃ³modo de abrir, malo para paralelismo) y <code>repartition(10)</code> para unos diez Parquet (mejor si despuÃ©s se lee en distribuido).</div>
<pre><code>df_join.repartition(1).write.mode("overwrite").csv("ejemplo_escritura_1.csv")
df_join.repartition(10).write.mode("overwrite").parquet("ejemplo_escritura_1_parquet")
df_cached = df_datetime.persist()  # MEMORY_AND_DISK
df_cached.unpersist()</code></pre>
<p><code>cache()</code> equivale a <code>persist(MEMORY_ONLY)</code>. <code>persist()</code> sin argumentos usa <code>MEMORY_AND_DISK</code>. Niveles: <code>MEMORY_ONLY</code>, <code>MEMORY_AND_DISK</code>, <code>DISK_ONLY</code>, entre otros. Tiene sentido cuando el mismo DataFrame alimenta varias ramas: limpieza de tweets, agregaciones y ML. Si no, Spark recomputa el linaje en cada acciÃ³n.</p>
<div class="callout info"><div class="lbl">[didÃ¡ctico Â· Learning Spark]</div>En agregaciones por clave (RDD Pair o idea equivalente), preferÃ­ <code>reduceByKey</code> / <code>aggregate</code> con combine local frente a <code>groupByKey</code>+sumar: el primero reduce trÃ¡fico de red; el segundo manda listas crudas y puede OOM. Si particionas un dataset grande que reusas en varios joins, <code>repartition</code>/<code>partitionBy</code> + <code>persist</code>: sin persist, cada acciÃ³n re-shufflea. Tras particionar, transformar solo el valor (<code>mapValues</code> en RDD) conserva el partitioner; un <code>map</code> genÃ©rico lo borra y el siguiente join vuelve a shufflear.</div>
<div class="trade"><b>Trade-off 7 Â· Shuffle y cachÃ©.</b> Ganas con repartition: archivos balanceados. Pierdes: el movimiento de datos. Ganas con persist: no repites la limpieza. Pierdes: RAM (y disco, si el nivel lo permite) ocupada hasta el <code>unpersist</code>.</div>
`,
mini:{q:'coalesce(n) se diferencia de repartition porqueâ€¦', opts:['Siempre aumenta particiones con shuffle','Solo reduce particiones, sin shuffle completo','Es un broadcast','Borra el linaje'], a:1, why:'coalesce baja el nÃºmero y evita el shuffle completo. No sirve para subir particiones.'} },
{ id:'m8', tag:'MÃ³dulo 8', accent:'purple', title:'Catalyst, Tungsten, AQE y formatos',
summary:'QuiÃ©n optimiza el plan, quiÃ©n lo ejecuta, y por quÃ© Parquet gana al CSV.',
html: `
<p class="lede">El DataFrame no se ejecuta "como lo escribiste". Catalyst lo reescribe, Tungsten lo corre apretado y AQE puede cambiar de opiniÃ³n con los tamaÃ±os reales.</p>
<table><tr><th>Motor</th><th>QuÃ© hace</th></tr>
<tr><td><strong>Catalyst</strong></td><td>Cadena: plan lÃ³gico -> plan lA3gico <strong>optimizado</strong> (predicate pushdown, column pruning) -> <strong>varios planes fA-sicos</strong> -> elecciA3n por <strong>costos</strong> -> generaciA3n de cA3digo.</td></tr>Ã­sico.</td></tr>
<tr><td><strong>Tungsten</strong></td><td>Ejecuci�n: memoria <strong>off-heap</strong>, formato binario compacto y <strong>whole-stage code generation</strong>.</td></tr>
<tr><td><strong>AQE</strong></td><td>Reoptimiza <strong>en runtime</strong> con estadÃ­sticas reales (tamaÃ±o despuÃ©s del shuffle, otra estrategia de join).</td></tr></table>
<div class="callout info"><div class="lbl">[resumen]</div>Si una tabla es pequeÃ±a, Spark puede <strong>difundirla</strong> a todos los executors y no shufflear la grande. El caso de libro es hechos unidos a una dimensiÃ³n chica del modelo estrella.</div>
<div class="callout info"><div class="lbl">[resumen]</div><strong>Variables compartidas:</strong> <em>broadcast variables</em> = variables de solo lectura enviadas una vez a cada nodo (no confundir con el broadcast join). <em>Accumulators</em> = variables a las que los executors solo suman (contadores); el driver las lee. El linaje del RDD permite recalcular una particion perdida: por eso no hace falta replicar los datos.</div>
<table><tr><th>Formato</th><th>Naturaleza</th><th>Notas</th></tr>
<tr><td>CSV / JSON</td><td>Texto</td><td>Interoperables. El parseo es caro y los tipos son dÃ©biles.</td></tr>
<tr><td><strong>Parquet</strong></td><td>Columnar comprimido</td><td>El preferido en Spark. Entra el predicate pushdown.</td></tr>
<tr><td>ORC</td><td>Columnar</td><td>Ecosistema Hive.</td></tr>
<tr><td>Avro</td><td>Por filas</td><td>EvoluciÃ³n de esquema y streaming.</td></tr>
<tr><td>Delta / Iceberg / Hudi</td><td>Capa sobre Parquet</td><td>ACID y time travel: el <strong>lakehouse</strong>.</td></tr></table>
<div class="callout info"><div class="lbl">[quiz16]</div><strong>Por quÃ© Parquet acelera en el lago.</strong> Misma columna = mismo tipo â†’ compresiÃ³n fuerte. El pie del archivo guarda stats por bloque (ej. edad min 18 / mÃ¡x 35): si el filtro es <code>edad &gt; 50</code>, Spark <strong>salta el bloque</strong> sin bajarlo. AdemÃ¡s, particiÃ³n fÃ­sica en carpetas (<code>/ventas/aÃ±o=2026/mes=11/â€¦</code>): un <code>WHERE aÃ±o=2026 AND mes=11</code> ignora el resto de carpetas.</div>
<div class="callout info"><div class="lbl">[clase/notebook]</div>El taller escribe el mismo housing en CSV y en Parquet. Pandas puede leer solo dos columnas del Parquet de salida:</div>
<pre><code>import pandas as pd
pd.read_parquet("ejemplo_escritura_1_parquet", columns=["total_rooms", "total_bedrooms"])</code></pre>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>CSV para mirar el archivo con un humano. Parquet para que el clÃºster lea columnas y empuje filtros. Broadcast solo si la tabla chica <strong>cabe en cada executor</strong>.</div>
<div class="trade"><b>Trade-off 8 Â· Broadcast.</b> Ganas: la tabla grande no viaja por la red. Pierdes: una dimensiÃ³n que no era tan chica revienta la memoria de los executors.</div>
`,
mini:{q:'Â¿CuÃ¡ndo aplica un broadcast join?', opts:['Cuando una tabla es pequeÃ±a y se puede copiar a los executors','Cuando ambas tablas son enormes','Solo con RDD sin esquema','Solo al hacer coalesce'], a:0, why:'Se difunde la chica (tÃ­pico: dimensiÃ³n) y se evita el shuffle de la grande (hechos).'} },
{ id:'m9', tag:'MÃ³dulo 9', accent:'teal', title:'Tweets, texto y el puente al DWH',
summary:'Schema, regex, Tokenizer, LDA, y Spark entre el lago y el almacÃ©n.',
html: String.raw`
<p class="lede">El cierre del Colab son cerca de 1,6 millones de tweets: texto libre, usuarios y sentimiento. El resumen lo conecta con el lago y el DWH.</p>
<div class="callout warn"><div class="lbl">[clase/notebook]</div><strong>Quirk de archivo.</strong> El markdown dice <code>/content/traindata.csv</code>. El cÃ³digo abre <code>/content/twitter_training.csv</code>. Usa el nombre del cÃ³digo, o renombra al subir. <code>inferSchema=True</code> suele fallar: las comas del texto parten columnas de mÃ¡s. El esquema va declarado.</div>
<pre><code>schema_str = "id long, user string, sentiment string, text string"
df_twitter = spark.read.csv(path, header=True, schema=schema_str)
df_twitter.where(F.col("id").isNull()).count()  # filas corruptas</code></pre>
<pre><code>(df_twitter.groupBy("user").count().orderBy(F.desc("count")).limit(20).show())
(df_twitter.select("sentiment", F.length("text").alias("length"))
    .groupBy("sentiment").avg("length").show())</code></pre>
<p>Si existe <code>date</code> con forma <code>Mon Apr 06 22:19:45 PDT 2009</code>, el taller recorta el dÃ­a de la semana y parsea:</p>
<pre><code>df_datetime = (df_twitter
    .withColumn("date", F.substring("date", 5, 1000))
    .withColumn("date", F.to_timestamp("date", "MMM dd HH:mm:ss zz yyyy"))
    .persist())</code></pre>
<h3>Limpieza, tokens y tÃ³picos</h3>
<div class="callout tip"><div class="lbl">[didÃ¡ctico]</div>La primera menciÃ³n es <code>regexp_extract</code> del grupo 1 de <code>@usuario</code>. Para la nube de palabras hay que tokenizar <strong>text_clean</strong>, no el <code>text</code> crudo: el Tokenizer del notebook de ML apunta a <code>text</code>, y las lÃ­neas de <code>groupBy("token").count()</code> a veces vienen comentadas. Sin ese conteo, el dict de la nube no existe.</div>
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
<p>TÃ³picos, en este orden: <strong>CountVectorizer</strong> (bolsa dispersa, <code>rawFeatures</code>) â†’ <strong>IDF</strong> (pesa lo poco frecuente, <code>vectors</code>) â†’ <strong>LDA</strong> (<code>k</code> temas, no supervisado) â†’ <code>describeTopics</code>. La calidad depende de la limpieza y de <code>vocabSize</code>.</p>
<pre><code>cv = CountVectorizer(inputCol="filtered", outputCol="rawFeatures", vocabSize=200, minDF=2)
idf = IDF(inputCol="rawFeatures", outputCol="vectors")
lda = LDA(k=10, maxIter=10, featuresCol="vectors")</code></pre>
<h3>Puente con el DWH</h3>
<div class="callout info"><div class="lbl">[resumen]</div>Spark hace el <strong>ETL/ELT</strong>: lee crudo del data lake (S3 o HDFS), limpia, agrega y escribe al DWH o a tablas curadas. En un <strong>lakehouse</strong> consulta Parquet, Delta o Iceberg con ACID. TambiÃ©n arma hechos y dimensiones (Kimball) a partir de lo ya procesado. El ELT moderno carga crudo al lago y transforma con Spark o dbt en el destino. Snowflake, BigQuery o Redshift pueden ocupar partes del pipeline; Spark sigue siendo el motor de preparaciÃ³n.</div>
<div class="callout tip"><div class="lbl">[Fundamentals]</div>Un lake sin catÃ¡logo ni capa ACID degenera en <em>data swamp</em>. PreferÃ­ Parquet (no CSV) para schema-on-read; evitÃ¡ miles de archivos diminutos (un PUT por fila). Un MERGE/CDC fila a fila sobre columnar es Copy-on-Write caro: loteÃ¡. Lambda (batch+stream duplicados) solo si hace falta; Kappa unifica en un stream con replay.</div>
<div class="callout info"><div class="lbl">[quiz16]</div><strong>MedallÃ³n.</strong> Bronze = crudo con timestamp (inmutable). Silver = Spark limpia y tipa, escribe Parquet. Gold = agregados para BI/DWH. El log de transacciones (Delta/Iceberg) habilita cambios atÃ³micos y time travel sobre el lago de archivos.</div>
<table><tr><th>Tema</th><th>Idea para cuando el quiz mezcla modelo</th></tr>
<tr><td>Bronze / Silver / Gold</td><td>Crudo â†’ limpio â†’ curado. Spark suele vivir en Silver.</td></tr>
<tr><td>Inmon</td><td>DWH integrado, orientado a temas, histÃ³rico, no volÃ¡til.</td></tr>
<tr><td>Kimball</td><td>Estrella o copo. La granularidad se define primero. Dimensiones conformadas.</td></tr>
<tr><td>OLTP vs OLAP</td><td>Transacciones contra anÃ¡lisis agregado.</td></tr>
<tr><td>ETL vs ELT</td><td>Transformar antes de cargar, o despuÃ©s, ya en el destino.</td></tr>
<tr><td>SCD tipo 2</td><td>Una fila nueva conserva la historia. La llave subrogada identifica la versiÃ³n.</td></tr>
<tr><td>Lakehouse</td><td>Lago mÃ¡s transacciones ACID (Delta o Iceberg).</td></tr></table>
<p>Esquema mental: <strong>fuentes â†’ Spark â†’ lake/Delta â†’ DWH/BI</strong>, o un lakehouse Ãºnico con SQL encima. Medidas: aditivas se suman en cualquier dimensiÃ³n; semi-aditivas no en el tiempo (stock); no aditivas no se suman (ratios). Slice fija una dimensiÃ³n; dice fija varias. Roll-up sube en la jerarquÃ­a; drill-down baja.</p>
<div class="trade"><b>Trade-off 9 Â· Limpiar de mÃ¡s.</b> Ganas: tokens y tÃ³picos legibles. Pierdes: menciones, URLs y signos que a veces eran la seÃ±al. Y sin <code>persist</code> sobre <code>df_clean</code>, cada acciÃ³n repite toda la regex.</div>
`,
mini:{q:'ELT moderno, en el resumen, significaâ€¦', opts:['Transformar todo antes de cargar','Cargar crudo al lago y transformar con Spark o dbt en el destino','Borrar el DWH','Quedarse en OLTP'], a:1, why:'La carga cruda va al lago. Spark (o dbt) transforma ya en el destino.'} }
];

const QUIZ = [
{tag:'CPU', c:'gold', q:'R y Python, en el contraste del notebook, usan por defectoâ€¦', opts:['Todos los nÃºcleos','Un solo CPU aunque haya mÃ¡s','Solo la GPU','El cluster manager'], a:1, why:'El monitor del taller muestra un hilo en pandas y en numpy.'},
{tag:'CPU', c:'gold', q:'Los dos lÃ­mites al escalar que marca el taller sonâ€¦', opts:['Licencias y red','Memoria (no cabe en RAM) y tiempo (baja latencia)','Solo el disco','Solo el driver'], a:1, why:'Si no cabe en RAM, o si la latencia no da, una mÃ¡quina se queda corta.'},
{tag:'Paralelo', c:'blue', q:'Procesamiento paralelo, en el sentido del notebook, esâ€¦', opts:['Siempre varias mÃ¡quinas','Repartir el trabajo en los CPUs de una mÃ¡quina','Solo MapReduce','Escribir en HDFS'], a:1, why:'Paralelo aprovecha los nÃºcleos. Distribuido es cuando esas tareas cambian de computadora.'},
{tag:'Paralelo', c:'blue', q:'Procesamiento distribuido esâ€¦', opts:['Lo contrario de cualquier paralelismo','Paralelismo cuyas tareas corren en distintas computadoras del clÃºster','Un solo hilo','Solo SQL'], a:1, why:'Es un subconjunto del paralelismo, no otro universo.'},
{tag:'Paralelo', c:'blue', q:'Si cae el Ãºnico nodo de un master local[*]â€¦', opts:['Otro datacenter retoma el linaje solo','Cae el proceso entero','Solo se pierde un executor y el driver sigue en otra mÃ¡quina','AQE lo evita'], a:1, why:'local no es un clÃºster. La tolerancia a un executor caÃ­do aparece cuando hay varios nodos.'},
{tag:'Spark', c:'purple', q:'Spark es mÃ¡s rÃ¡pido que MapReduce en iteraciones porqueâ€¦', opts:['Persiste cada paso en disco','Mantiene los intermedios en memoria','No tiene shuffle','Solo corre en un CPU'], a:1, why:'MapReduce escribe disco entre map y reduce. Spark evita ese viaje cuando la RAM alcanza.'},
{tag:'Spark', c:'purple', q:'Como sistema, Spark esâ€¦', opts:['Un almacÃ©n equivalente a HDFS','Un motor de procesamiento: lee HDFS, S3, JDBC, Kafka o Parquet','Una base OLTP','El reemplazo de todos los metadatos de Hadoop'], a:1, why:'No es almacenamiento. El dato vive en otro sistema.'},
{tag:'Spark', c:'purple', q:'Correr Spark sobre Hadoop significa sobre todoâ€¦', opts:['Borrar HDFS','Usar YARN + HDFS y reemplazar MapReduce como motor de cÃ³mputo','Que Spark es HDFS','Eliminar el driver'], a:1, why:'Se sustituye el motor, no necesariamente todo el ecosistema.'},
{tag:'Spark', c:'purple', q:'Motor unificado quiere decirâ€¦', opts:['Solo batch','Batch, SQL, streaming, ML y grafos en el mismo motor','Solo RDD','Solo Python'], a:1, why:'Una sola mÃ¡quina de ejecuciÃ³n para esas modalidades.'},
{tag:'Stack', c:'teal', q:'Spark Core se encarga deâ€¦', opts:['Solo PageRank','Scheduling, memoria, fallos y RDD','Solo el catÃ¡logo Delta','El BI del DWH'], a:1, why:'Es la base. SQL, grafos y ML se apoyan ahÃ­.'},
{tag:'Stack', c:'teal', q:'QuiÃ©n convierte el programa en DAG y coordina las stagesâ€¦', opts:['Cada executor por su cuenta','El driver','El archivo Parquet','StopWordsRemover'], a:1, why:'El driver planifica. Los executors ejecutan.'},
{tag:'Stack', c:'teal', q:'El cluster managerâ€¦', opts:['Guarda los Parquet','Asigna recursos (Standalone, YARN o Kubernetes)','Ejecuta el SQL lÃ­nea a lÃ­nea en Python','Es el shuffle'], a:1, why:'Reparte CPU y memoria. Mesos queda como nota deprecada.'},
{tag:'Stack', c:'teal', q:'En modo cluster el driverâ€¦', opts:['Vive en el laptop de quien lanzÃ³ el notebook','Corre dentro del clÃºster','No existe','Es un executor sin tasks'], a:1, why:'client lo deja en tu mÃ¡quina. cluster lo mueve adentro. local lo mete todo en una JVM.'},
{tag:'Stack', c:'teal', q:'Los executorsâ€¦', opts:['Solo dibujan el DAG','Ejecutan tasks, guardan cache y reportan al driver','Son el cluster manager','Infieren el esquema dos veces'], a:1, why:'Trabajo y cachÃ© local. La coordinaciÃ³n no es de ellos.'},
{tag:'Sesion', c:'orange', q:'La regla de oro de PySpark dice queâ€¦', opts:['Todo corre dentro del intÃ©rprete, fila a fila','El procesamiento va en otro entorno: piensa en ejecuciÃ³n remota, incluso con local[*]','collect es la forma correcta de traer millones de filas','Las UDF son siempre mÃ¡s rÃ¡pidas que Spark SQL'], a:1, why:'local[*] no cancela la regla. El plan igual lo ejecuta el motor.'},
{tag:'Sesion', c:'orange', q:'collect() sobre un dataset grandeâ€¦', opts:['Deja los datos en los executors','Trae todo al driver y puede tumbarlo','Es una transformaciÃ³n lazy','Equivale a cache()'], a:1, why:'El driver no es un almacÃ©n. Para mirar, limit o una muestra.'},
{tag:'Sesion', c:'orange', q:'Una UDF de Python frente a una funciÃ³n nativa de Spark SQL suele serâ€¦', opts:['MÃ¡s rÃ¡pida','MÃ¡s lenta','Obligatoria para filter','Una transformaciÃ³n narrow'], a:1, why:'Sale del cÃ³digo generado de Catalyst. Ãšsala cuando no haya funciÃ³n nativa.'},
{tag:'Quirk', c:'orange', q:'En el Colab, si el apt de OpenJDK 8 falla pero JAVA_HOME apunta a Java 21â€¦', opts:['Spark no puede arrancar nunca','Puede funcionar con Java 21 si Spark ya estÃ¡ descomprimido','Hay que volver a pandas','Hay que borrar SPARK_HOME'], a:1, why:'El taller queda en Java 21. Forzar Java 8 solo si el runtime lo pide.'},
{tag:'DF', c:'pink', q:'Declarar el esquema al leer un CSVâ€¦', opts:['Obliga una segunda pasada para adivinar tipos','Evita la doble pasada de inferSchema y el "todo string"','Desactiva Catalyst','Crea un shuffle'], a:1, why:'inferSchema recorre el archivo para adivinar. El esquema declarado no.'},
{tag:'DF', c:'pink', q:'En una expresiÃ³n de columnas con aritmÃ©tica, la forma preferida esâ€¦', opts:['El atributo df.col cuando el nombre tiene espacios','F.col','toPandas en cada fila','collect y un for'], a:1, why:'El string y el atributo alcanzan para un nombre simple. F.col aguanta la expresiÃ³n.'},
{tag:'DF', c:'pink', q:'createOrReplaceTempViewâ€¦', opts:['Publica la tabla en el DWH para siempre','Crea una vista solo de esa sesiÃ³n, sobre el mismo Catalyst','Escribe Parquet','Materializa el resultado en disco'], a:1, why:'Se va con la sesiÃ³n. El SQL y el DataFrame comparten optimizador.'},
{tag:'DF', c:'pink', q:'En PySpark, la API recomendada hoy esâ€¦', opts:['RDD para todo','DataFrame. El Dataset tipado es de Scala o Java','Solo SQL, sin DataFrame','Solo pandas'], a:1, why:'El RDD no pasa por Catalyst. El Dataset tipado no es el modelo de Python.'},
{tag:'Lazy', c:'gold', q:'select, filter o groupByâ€¦', opts:['Ejecutan el job al instante','Construyen el plan y esperan una acciÃ³n','Siempre hacen shuffle','Llaman a spark.stop()'], a:1, why:'Son transformaciones. La acciÃ³n es el gatillo.'},
{tag:'Lazy', c:'gold', q:'Â¿CuÃ¡l de estas es una acciÃ³n?', opts:['select','withColumn','count','filter'], a:2, why:'count pide un resultado. Las otras tres alargan el plan.'},
{tag:'Lazy', c:'gold', q:'where y filter en un DataFrameâ€¦', opts:['where es wide y filter es narrow siempre','Son alias','where solo existe dentro de un string SQL','filter borra el linaje'], a:1, why:'Mismo mÃ©todo con dos nombres.'},
{tag:'Lazy', c:'gold', q:'explain() en el taller sirve paraâ€¦', opts:['Disparar el write','Ver el plan fÃ­sico; explain(True) aÃ±ade lÃ³gico, optimizado y fÃ­sico','Hacer cache','Elegir el cluster manager'], a:1, why:'Muestra el plan. No sustituye a show, count o write.'},
{tag:'Shuffle', c:'blue', q:'Una transformaciÃ³n narrowâ€¦', opts:['Siempre cruza la red','Hace que cada particiÃ³n de salida dependa de una de entrada, sin shuffle','Es solo groupBy','Es solo orderBy'], a:1, why:'map, filter, select y un withColumn simple son narrow. groupBy y orderBy son wide.'},
{tag:'Shuffle', c:'blue', q:'La fÃ³rmula del resumen esâ€¦', opts:['1 transformaciÃ³n = 1 stage','1 acciÃ³n = 1 job; stages entre shuffles; tasks por particiÃ³n','1 executor = 1 job','1 cache = 1 DAG'], a:1, why:'El shuffle es la frontera de stage. La task suele ser una particiÃ³n.'},
{tag:'Shuffle', c:'blue', q:'coalesce(n) frente a repartition(n)â€¦', opts:['coalesce sube particiones con shuffle','coalesce solo baja particiones y evita un shuffle completo','Son idÃ©nticos','coalesce es un broadcast'], a:1, why:'Para subir o rebalancear de verdad, repartition. Para bajar al final, coalesce.'},
{tag:'Shuffle', c:'blue', q:'persist() sin argumentos usa por defectoâ€¦ y cache() equivale aâ€¦', opts:['DISK_ONLY y MEMORY_AND_DISK','MEMORY_AND_DISK y persist(MEMORY_ONLY)','Solo GPU y solo disco','Ninguno guarda nada'], a:1, why:'El taller persiste tweets con el default de persist. cache es la variante solo memoria.'},
{tag:'Opt', c:'purple', q:'Catalystâ€¦', opts:['Ejecuta bytes off-heap','Optimiza el plan: pushdown, column pruning y plan fÃ­sico','Reparte chunks','Tokeniza tweets'], a:1, why:'Tungsten es la ejecuciÃ³n. Catalyst es el optimizador. AQE reoptimiza despuÃ©s.'},
{tag:'Opt', c:'purple', q:'AQEâ€¦', opts:['Se apaga al leer CSV','Reoptimiza en runtime con estadÃ­sticas reales, por ejemplo el join tras el shuffle','Es un formato de archivo','Reemplaza al driver'], a:1, why:'Usa tamaÃ±os medidos, no solo los estimados del plan inicial.'},
{tag:'Opt', c:'purple', q:'Un broadcast join conviene cuandoâ€¦', opts:['Las dos tablas son enormes','Una tabla es pequeÃ±a y se copia a los executors','Hay que hacer repartition(1)','Se usa un RDD sin esquema'], a:1, why:'TÃ­pico en estrella: dimensiÃ³n chica, hechos grandes, sin shuffle de los hechos.'},
{tag:'Opt', c:'purple', q:'Parquet se prefiere a CSV en Spark porqueâ€¦', opts:['Es mÃ¡s fÃ¡cil de leer en un editor de texto','Es columnar, comprimido, y permite predicate pushdown','No tiene tipos','Obliga un shuffle'], a:1, why:'CSV parsea todo. Parquet lee las columnas que el plan pide.'},
{tag:'Texto', c:'teal', q:'El CSV de tweets que abre el cÃ³digo (no el markdown) se llamaâ€¦', opts:['traindata.csv','twitter_training.csv','california_housing_train.csv','ejemplo_escritura_1.csv'], a:1, why:'El markdown dice traindata.csv. El cÃ³digo usa twitter_training.csv.'},
{tag:'Texto', c:'teal', q:'Para una nube de palabras coherente hay que tokenizarâ€¦', opts:['La columna text original, sin limpiar','text_clean, y luego stops, explode y groupBy count','Solo el id','El sentiment, y LDA antes del Tokenizer'], a:1, why:'Tokenizer sobre text crudo arrastra URLs. Sin el count no hay frecuencias.'},
{tag:'Texto', c:'teal', q:'El orden del modelado de tÃ³picos en el taller esâ€¦', opts:['LDA, luego IDF, luego Tokenizer','CountVectorizer, IDF, LDA','StopWords antes de leer el CSV','explode antes del Tokenizer'], a:1, why:'Bolsa de palabras, peso IDF, y reciÃ©n entonces LDA con k temas.'},
{tag:'DWH', c:'gold', q:'En el puente del resumen, el papel tÃ­pico de Spark esâ€¦', opts:['Reemplazar el modelo estrella por un OLTP','ETL o ELT del lago hacia tablas curadas, o consultar un lakehouse','Ser el almacÃ©n definitivo de los tweets en RAM','Eliminar la granularidad de Kimball'], a:1, why:'Prepara y transforma. El almacenamiento sigue siendo lago, Delta o el DWH.'},
{tag:'Shuffle', c:'blue', q:'Para sumar montos por clave, groupByKey().map(sum) frente a reduceByKeyâ€¦', opts:['Es igual de barato en red','Manda todos los valores crudos y puede OOM','Evita el shuffle por completo','Solo corre en el driver'], a:1, why:'[Learning Spark] reduceByKey hace combine local antes del shuffle. groupByKey no.'},
{tag:'Lazy', c:'gold', q:'Si solo haces filter/select y print("listo") sin count/show/writeâ€¦', opts:['Spark ya leyÃ³ el archivo entero','No se ejecutÃ³ nada: solo creciÃ³ el plan lazy','Obligas un shuffle','Se dispara un job vacÃ­o'], a:1, why:'[Learning Spark] Sin acciÃ³n no hay stages ni lectura. El print engaÃ±a.'},
{tag:'Shuffle', c:'blue', q:'Tras repartition/partitionBy de un dataset que reusas, si omites persistâ€¦', opts:['El shuffle queda materializado para siempre','Cada acciÃ³n puede rehacer el shuffle desde el linaje','Catalyst lo cachea solo','coalesce deja de funcionar'], a:1, why:'[Learning Spark] partitionBy/repartition son lazy. Sin persist, cada acciÃ³n reevalÃºa.'},
{tag:'Opt', c:'purple', q:'Un lago con CSV crudo + SELECT * pay-per-scan sueleâ€¦', opts:['Aprovechar column pruning automÃ¡ticamente','Romperse con cambios de esquema y disparar facturas altas','Dar ACID gratis','Ser el formato preferido de Catalyst'], a:1, why:'[Fundamentals] Schema-on-read con CSV es frÃ¡gil; SELECT * anula pruning. Prefiere Parquet/particionado.'},
{tag:'Opt', c:'purple', q:'Si Parquet anota en el pie â€œedad 18â€“35â€ y filtras edad > 50â€¦', opts:['Spark descarga el bloque igual','Puede saltar el bloque sin leer los datos','Obliga un shuffle wide','Convierte el archivo a CSV'], a:1, why:'[quiz16] Stats del footer + predicate pushdown = block skipping.'},
{tag:'DWH', c:'gold', q:'Carpetas /ventas/aÃ±o=2026/mes=11/ en el lago sirven paraâ€¦', opts:['Forzar un collect al driver','Que el WHERE por aÃ±o/mes ignore el resto de carpetas','Reemplazar a Catalyst','Borrar Bronze cada noche'], a:1, why:'[quiz16] ParticiÃ³n fÃ­sica (Hive-style): menos archivos escaneados, menos costo.'},
{tag:'DWH', c:'teal', q:'En el medallÃ³n, Â¿quiÃ©n limpia nulos y tipos hacia Parquet?', opts:['La capa Gold sola, sin motor','Silver, tÃ­picamente con Spark','Solo el POS','El cluster manager'], a:1, why:'[quiz16] Bronze aterriza; Silver limpia; Gold agrega para BI.'}
];

const CASES = [
{ title:'Caso 1 Â· Java 8 que no instala', prompt:'En Colab la celda de openjdk-8 falla con 404 en apt, pero la siguiente fija JAVA_HOME en java-21-openjdk-amd64 y Spark ya estÃ¡ descomprimido. Â¿Arrancas igual o reinsistes con Java 8?', solution:'<strong>Arranca con Java 21.</strong> El apt de Java 8 es un quirk del notebook, no un requisito si el runtime no lo exige. Revisa que <code>JAVA_HOME</code> y <code>SPARK_HOME</code> apunten a rutas reales y que <code>findspark.init()</code> corra antes de crear la sesiÃ³n.', h1:'Â¿QuÃ© variable lee el proceso de Java?', h2:'Â¿En quÃ© orden van findspark y SparkSession?', rubric:'RÃºbrica: 2 diagnÃ³stico del quirk + 2 variables de entorno + 1 cuÃ¡ndo sÃ­ forzar Java 8.'},
{ title:'Caso 2 Â· El CSV que no aparece', prompt:'El markdown del taller dice abrir /content/traindata.csv. FileNotFoundError. El archivo que subiste se llama twitter_training.csv. Â¿QuÃ© haces?', solution:'<strong>Usa el nombre del cÃ³digo:</strong> <code>/content/twitter_training.csv</code>. El markdown estÃ¡ desfasado. La otra opciÃ³n es renombrar el archivo al subirlo. El esquema sigue siendo <code>id long, user string, sentiment string, text string</code>, no inferSchema.', h1:'Â¿Por quÃ© inferSchema falla en este CSV?', h2:'Â¿QuÃ© cuenta una fila con id nulo?', rubric:'RÃºbrica: 2 nombre correcto + 2 esquema explÃ­cito + 1 filas corruptas.'},
{ title:'Caso 3 Â· collect de los tweets', prompt:'Quieres ver "todos" los tweets en una variable Python y escribes df_twitter.collect() sobre ~1,6 millones de filas. El driver se queda sin memoria. Â¿QuÃ© rompiste y quÃ© usas en su lugar?', solution:'<strong>La regla de oro.</strong> collect trae el dataset completo al proceso del driver. Para inspeccionar: <code>show</code>, <code>limit</code> o un <code>toPandas()</code> de una muestra chica (la nube puede ir con <code>word_counts.limit(500)</code>). Las agregaciones se quedan en el clÃºster.', h1:'Â¿DÃ³nde corre el procesamiento?', h2:'Â¿QuÃ© diferencia hay entre show y collect?', rubric:'RÃºbrica: 2 regla de oro + 2 alternativa + 1 por quÃ© el driver no es un almacÃ©n.'},
{ title:'Caso 4 Â· Un solo CSV o diez Parquet', prompt:'Vas a entregar housing. Alguien pide "un archivo que pueda abrir" y otra persona va a releerlo con Spark. Tienes repartition(1).csv y repartition(10).parquet. Â¿CuÃ¡l eliges para cada quien?', solution:'<strong>repartition(1)</strong> y CSV: un solo archivo, fÃ¡cil para un humano, pÃ©simo para paralelismo. <strong>repartition(10)</strong> y Parquet: varios archivos columnares, mejor lectura distribuida y predicate pushdown. No uses el de un archivo como formato de producciÃ³n.', h1:'Â¿repartition hace shuffle?', h2:'Â¿Por quÃ© Parquet gana al CSV en el scan?', rubric:'RÃºbrica: 2 efecto de repartition(1) + 2 Parquet + 1 cuÃ¡ndo coalesce bastarÃ­a.'},
{ title:'Caso 5 Â· Nulos raros en total_rooms', prompt:'El StructType de housing declara total_rooms como IntegerType y el resto como DoubleType. Tras el read aparecen nulos donde el CSV trae nÃºmeros con decimal, o columnas corridas. Â¿CÃ³mo lo corriges?', solution:'<strong>Esquema homogÃ©neo en la lectura</strong> (todo double, como el CSV real) y el cast a entero despuÃ©s, en el select, con alias. La otra vÃ­a es <code>inferSchema=True</code> mÃ¡s un cast explÃ­cito. Mezclar tipos en el schema del CSV no "redondea": descarta o desplaza.', h1:'Â¿QuÃ© evita declarar el esquema, ademÃ¡s de los tipos?', h2:'Â¿DÃ³nde hace el cast el pipeline corregido?', rubric:'RÃºbrica: 2 causa + 2 esquema double + 1 cast posterior.'},
{ title:'Caso 6 Â· La nube sin frecuencias', prompt:'El Tokenizer apunta a text, las lÃ­neas de groupBy("token").count() estÃ¡n comentadas, y el WordCloud espera un dict count que no existe. Â¿QuÃ© pipeline dejas?', solution:'Limpia a <code>text_clean</code> (URLs, menciones, signos, minÃºsculas) y <code>persist</code>. Tokenizer sobre <code>text_clean</code>, StopWordsRemover, <code>explode</code>, y <strong>groupBy token + count</strong> ordenado. ReciÃ©n una muestra con <code>limit</code> puede bajar a pandas para dibujar.', h1:'Â¿Por quÃ© no tokenizar text crudo?', h2:'Â¿QuÃ© hace explode?', rubric:'RÃºbrica: 2 text_clean + 2 explode/count + 1 persist si hay varias acciones.'},
{ title:'Caso 7 Â· Hechos unidos a una dimensiÃ³n chica', prompt:'Una tabla de hechos enorme se une a una dimensiÃ³n de producto que cabe holgada en memoria. El plan muestra un shuffle de las dos. Â¿QuÃ© le pides a Spark y quÃ© riesgo queda?', solution:'<strong>Broadcast</strong> de la dimensiÃ³n: se copia a los executors y los hechos no viajan. Es el patrÃ³n estrella del resumen. El riesgo es declarar chica una tabla que no cabe: los executors se quedan sin memoria. AQE puede cambiar la estrategia al ver el tamaÃ±o real post-shuffle, pero no adivina si la dimensiÃ³n ya no entra.', h1:'Â¿QuÃ© optimizador reescribe el join?', h2:'Â¿QuÃ© mide AQE que el plan inicial solo estima?', rubric:'RÃºbrica: 2 broadcast + 2 hecho vs dimensiÃ³n + 1 riesgo de memoria.'},
{ title:'Caso 8 Â· La limpieza corre tres veces', prompt:'df_clean alimenta el top de usuarios ya calculado aparte, luego la nube y luego el LDA, sin persist. Cada acciÃ³n tarda como si releyera y reaplicara la regex. Â¿QuÃ© falta y cuÃ¡ndo lo sueltas?', solution:'<code>persist()</code> (default MEMORY_AND_DISK) despuÃ©s del filtro de limpieza, porque hay varias acciones sobre el mismo linaje. <code>cache()</code> serÃ­a solo memoria. Al terminar el ML, <code>unpersist()</code> para no dejar la copia ocupando el executor.', h1:'Â¿CuÃ¡ntos jobs dispara cada acciÃ³n?', h2:'Â¿QuÃ© default tiene persist() sin argumentos?', rubric:'RÃºbrica: 2 por quÃ© se recomputa + 2 persist vs cache + 1 unpersist.'},
{ title:'Caso 9 Â· Suma por clave con groupByKey', prompt:'Tienes pares (producto_id, monto) de ~100 GB. Un compaÃ±ero escribe groupByKey().mapValues(sum). La red se satura y un executor hace OOM en un producto popular. Â¿QuÃ© pedÃ­s en su lugar y por quÃ©?', solution:'<strong>[Learning Spark] reduceByKey</strong> (o aggregate/combine con reduce local) suma dentro de cada particiÃ³n antes del shuffle. groupByKey manda listas crudas y materializa todas las ventas de esa clave en un nodo. En DataFrame: <code>groupBy("producto_id").sum("monto")</code> ya va por Catalyst con agregaciÃ³n parcial. <strong>Trade-off:</strong> reduceByKey exige asociatividad; groupByKey es mÃ¡s general y mÃ¡s caro.', h1:'Â¿QuÃ© es el map-side combine?', h2:'Â¿CuÃ¡l es el equivalente DataFrame?', rubric:'RÃºbrica: 2 diagnÃ³stico + 2 reduceByKey/DF + 1 trade-off.'},
{ title:'Caso 10 Â· MERGE cada 5 s sobre Parquet', prompt:'Un CDC dispara MERGE sobre tablas Parquet en S3 cada pocos segundos. El pipeline se atrasa horas y el cÃ³mputo se dispara. Â¿QuÃ© estÃ¡ pasando fÃ­sicamente y quÃ© cambiÃ¡s?', solution:'<strong>[Fundamentals] Copy-on-Write:</strong> actualizar pocas filas reescribe archivos columnares enteros. Agrupa el MERGE en micro-lotes (minutos), compacta y VACUUM/optimize. No trates Parquet como un heap fila-a-fila de Postgres. <strong>Trade-off:</strong> latencia de frescura vs. costo de reescritura.', h1:'Â¿Por quÃ© Parquet es inmutable a nivel archivo?', h2:'Â¿QuÃ© problema de â€œarchivos pequeÃ±osâ€ aparece si insertÃ¡s 1 fila por PUT?', rubric:'RÃºbrica: 2 COW + 2 loteo + 1 trade-off.'}
];

const GLOSSARY = [
['CPU','NÃºcleo de cÃ³mputo. Pandas y numpy, por defecto, usan uno solo. (notebook)'],
['RAM','Memoria para datos e intermedios. Si el dataset no cabe, el lÃ­mite es de memoria. (notebook)'],
['Procesamiento paralelo','Repartir el trabajo entre los CPUs de una mÃ¡quina. (notebook)'],
['Procesamiento distribuido','Paralelismo en el que las tareas corren en distintas computadoras del clÃºster. (notebook)'],
['Apache Spark','Motor de procesamiento distribuido en memoria. No es un sistema de almacenamiento. (resumen)'],
['MapReduce','Motor batch de Hadoop que persiste en disco entre map y reduce. (resumen)'],
['Spark Core','Base del stack: scheduling, memoria, fallos y RDD. (notebook)'],
['Spark SQL','DataFrames y SQL sobre el mismo Catalyst. (notebook)'],
['GraphX','Biblioteca de grafos del stack (PageRank y similares). (notebook)'],
['SparkML','Pipelines de ML del taller: clasificaciÃ³n, clustering, LDA. En cÃ³digo, pyspark.ml. (notebook)'],
['Structured Streaming','Micro-batches: el stream se ve como una tabla que crece. (resumen)'],
['Driver','Proceso que crea la SparkSession, arma el DAG y coordina stages y tasks. (resumen)'],
['Executor','Proceso que ejecuta tasks, guarda cache y reporta al driver. (resumen)'],
['Cluster manager','Asigna recursos: Standalone, YARN o Kubernetes. Mesos estÃ¡ deprecado. (resumen)'],
['SparkSession','Punto de entrada de PySpark. Se cierra con spark.stop(). (notebook)'],
['PySpark','API Python de Spark. El cÃ³mputo no corre dentro del bucle de Python. (notebook)'],
['Regla de oro','Pensar en ejecuciÃ³n remota aunque el master sea local[*]. (notebook)'],
['RDD','ColecciÃ³n distribuida, inmutable y lazy, con linaje. Sin Catalyst. (resumen)'],
['DataFrame','Tabla con columnas nombradas y tipadas. API recomendada en PySpark. (resumen)'],
['Dataset','DataFrame tipado de Scala o Java. TambiÃ©n pasa por Catalyst. (resumen)'],
['TransformaciÃ³n','OperaciÃ³n lazy que alarga el plan: select, filter, join, groupBy. (resumen)'],
['AcciÃ³n','OperaciÃ³n que dispara un job: show, count, collect, write. (resumen)'],
['Narrow','La particiÃ³n de salida depende de una sola de entrada. Sin shuffle. (resumen)'],
['Wide','La salida depende de muchas particiones. Hay shuffle. (resumen)'],
['Shuffle','RedistribuciÃ³n por red o disco. Es la operaciÃ³n cara y la frontera de stage. (resumen)'],
['reduceByKey','AgregaciÃ³n por clave con combine local antes del shuffle; mÃ¡s barata que groupByKey. (Learning Spark)'],
['groupByKey','Agrupa todos los valores por clave sin combine local; caro en red y RAM. (Learning Spark)'],
['Copy-on-Write','Al actualizar, se reescribe el archivo columnar entero; loteÃ¡ MERGEs. (Fundamentals)'],
['Stage','Tramo del job entre dos shuffles. (resumen)'],
['Job','Unidad que dispara una acciÃ³n. (resumen)'],
['Task','Unidad de trabajo de una stage, en lo tÃ­pico una por particiÃ³n. (resumen)'],
['DAG','Grafo de transformaciones que el driver construye antes de ejecutar. (resumen)'],
['Linaje','Historia de transformaciones con la que se reconstruye una particiÃ³n perdida. (resumen)'],
['repartition','Cambia el nÃºmero de particiones hacia arriba o abajo, con shuffle. (resumen)'],
['coalesce','Solo reduce particiones, sin un shuffle completo. (resumen)'],
['cache','Atajo de persist(MEMORY_ONLY). (resumen)'],
['persist','Guarda el DataFrame para reutilizarlo. Sin argumentos: MEMORY_AND_DISK. (notebook)'],
['Catalyst','Optimizador: predicate pushdown, column pruning y plan fÃ­sico. (resumen)'],
['Tungsten','EjecuciÃ³n eficiente: memoria off-heap y cÃ³digo generado. (resumen)'],
['AQE','ReoptimizaciÃ³n en runtime con estadÃ­sticas reales. (resumen)'],
['Broadcast join','Copia una tabla pequeÃ±a a los executors para no shufflear la grande. (resumen)'],
['Parquet','Formato columnar comprimido. El preferido para leer y escribir en Spark. (resumen)'],
['Delta Lake','Capa ACID y time travel sobre Parquet. Pieza de un lakehouse. (resumen)'],
['MedallÃ³n','Bronze crudo, Silver limpio (Spark), Gold curado para BI. (quiz16)'],
['Block skipping','Saltar bloques de Parquet gracias a min/max en el footer. (quiz16)'],
['Tokenizer','Parte una columna de texto en una lista de palabras. En el taller, sobre text_clean. (notebook)'],
['StopWordsRemover','Quita artÃ­culos y preposiciones de esa lista de tokens. (notebook)'],
['LDA','Modelo de tÃ³picos no supervisado. Va despuÃ©s de CountVectorizer e IDF. (notebook)'],
['Lakehouse','Lago de archivos (Parquet) mÃ¡s transacciones ACID, consultable con SQL. (resumen)'],
['Predicate pushdown','Empujar el filtro al lector, para no traer bloques que no pasan el WHERE. (resumen)'],
['UDF','FunciÃ³n Python registrada en Spark. MÃ¡s lenta que una funciÃ³n nativa de Spark SQL. (notebook)'],
['collect','AcciÃ³n que trae todas las filas al driver. Peligrosa en datasets grandes. (notebook)'],
['explain','Muestra el plan. explain(True) aÃ±ade lÃ³gico, optimizado y fÃ­sico. (notebook)'],
['ETL','Transformar antes de cargar al destino analÃ­tico. (resumen)'],
['ELT','Cargar crudo y transformar en el destino, con Spark o dbt. (resumen)'],
['Inmon','DWH integrado, orientado a temas, histÃ³rico y no volÃ¡til. (resumen)'],
['Kimball','Modelado dimensional: granularidad primero, estrella o copo, dimensiones conformadas. (resumen)']
];

const CHEATSHEET = `
<div class="card accent-gold"><h3 style="margin-top:0;">Recursos y modos</h3><p style="font-size:14px;">Un CPU por defecto en pandas/numpy. LÃ­mites: <strong>RAM</strong> (datos e intermedios) y <strong>tiempo</strong>. Paralelo = N nÃºcleos. Distribuido = N mÃ¡quinas. <code>local[*]</code> es una JVM, no un clÃºster.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">Spark vs MapReduce</h3><p style="font-size:14px;">Intermedios en <strong>memoria</strong>. Motor unificado: batch, SQL, streaming, ML, grafos. <strong>No es almacenamiento</strong>. Sobre Hadoop reemplaza el motor (YARN + HDFS), no todo el ecosistema.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Arquitectura</h3><p style="font-size:14px;"><strong>Driver</strong> arma el DAG. <strong>Cluster manager</strong> asigna (Standalone, YARN, K8s). <strong>Executors</strong> corren tasks y cachean. Modos: local, client (driver en tu mÃ¡quina), cluster (driver adentro).</p></div>
<div class="card accent-orange"><h3 style="margin-top:0;">Regla de oro</h3><p style="font-size:14px;">EjecuciÃ³n remota incluso en <code>local[*]</code>. Nada de bucles fila a fila. <code>collect</code> y <code>toPandas</code> solo para muestras. UDF mÃ¡s lenta que Spark SQL. Cerrar con <code>spark.stop()</code>. Java 21 alcanza en el Colab.</p></div>
<div class="card accent-pink"><h3 style="margin-top:0;">DataFrame</h3><p style="font-size:14px;">Schema DDL o StructType evita la doble pasada. <code>F.col</code> en expresiones. Vista temporal = solo esta sesiÃ³n, mismo Catalyst. RDD sin optimizar; Dataset tipado es Scala/Java.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Lazy y shuffle</h3><p style="font-size:14px;"><strong>1 acciÃ³n = 1 job â†’ stages entre shuffles â†’ tasks por particiÃ³n.</strong> Narrow no mueve datos. Wide sÃ­. <code>repartition</code> sube o baja con shuffle. <code>coalesce</code> solo baja. <code>persist()</code> = MEMORY_AND_DISK. <code>cache()</code> = MEMORY_ONLY.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">OptimizaciÃ³n y archivos</h3><p style="font-size:14px;"><strong>Catalyst</strong> (pushdown, pruning) Â· <strong>Tungsten</strong> (off-heap, codegen) Â· <strong>AQE</strong> (stats reales). Broadcast si la dimensiÃ³n cabe. Parquet columnar. Delta / Iceberg / Hudi = lakehouse.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Tweets y DWH</h3><p style="font-size:14px;">Archivo <code>twitter_training.csv</code>. Schema explÃ­cito. Tokenizar <code>text_clean</code>. Tokenizer â†’ stops â†’ explode â†’ count. Luego CountVectorizer â†’ IDF â†’ LDA. Puente: fuentes â†’ Spark â†’ lake/Delta â†’ DWH, o ELT en el destino.</p></div>
`;
