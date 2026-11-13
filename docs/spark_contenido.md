# Apache Spark / PySpark — Study-desk

**Fuente enriquecida** para estudio del curso BDII: fusiona teoría del **Resumen Data Warehouse y Apache Spark** con el arco práctico del notebook **Pyspark[Sin_Código].ipynb** (Colab).

| Leyenda de bloques | Uso |
| --- | --- |
| `[resumen]` | Teoría condensada del resumen de curso |
| `[clase/notebook]` | Contenido y práctica del taller / notebook |
| `[didáctico]` | Síntesis, comparaciones y mnemotecnia para examen |

**Fuentes locales:** `docs/Resumen Data Warehouse y Apache Spark.md`, `docs/Pyspark[Sin_Código].ipynb`.

---

## Índice rápido

1. [Mapa de módulos m0–m9](#mapa-de-módulos-m0m9)
2. [Quirks conocidos del notebook](#quirks-conocidos-del-notebook)
3. [m0 — Recursos computacionales](#m0--recursos-computacionales)
4. [m1 — Paralelo vs distribuido](#m1--procesamiento-paralelo-vs-distribuido)
5. [m2 — Spark vs MapReduce](#m2--spark-vs-hadoop-mapreduce)
6. [m3 — Stack, componentes y arquitectura](#m3--stack-componentes-y-arquitectura)
7. [m4 — PySpark, sesión y entorno](#m4--pyspark-sparksession-y-entorno)
8. [m5 — Lectura, esquema, select y SQL](#m5--dataframes-lectura-esquema-select-sql)
9. [m6 — Lazy execution, map-reduce, filtros y agregaciones](#m6--ejecución-perezosa-transformaciones-y-acciones)
10. [m7 — DAG, shuffle, particiones, caché](#m7--narrow-wide-shuffle-stages-particiones-cache)
11. [m8 — Catalyst, Tungsten, AQE y formatos](#m8--optimización-y-formatos-de-archivo)
12. [m9 — Texto (tweets), ML y puente DWH](#m9--datos-no-estructurados-y-puente-dwh)
13. [Pipelines PySpark corregidos](#pipelines-pyspark-corregidos-clasenotebook)
14. [Checklist quiz](#checklist-quiz)

---

## Mapa de módulos m0–m9

| Módulo | Tema | Resumen | Notebook |
| --- | --- | --- | --- |
| **m0** | Recursos computacionales | OLAP/MPP como contexto de escala | Recursos CPU/RAM; demo pandas housing |
| **m1** | Paralelo vs distribuido | Particiones en clúster | `parallelize`; diagramas paralelo/distribuido |
| **m2** | Spark vs MapReduce | Memoria, motor unificado | Intro «¿Qué es Spark?» |
| **m3** | Stack + arquitectura | Driver, executors, CM, modos | Core/SQL/GraphX/SparkML |
| **m4** | PySpark + SparkSession | APIs y despliegue | `findspark`, init/stop, regla de oro |
| **m5** | DataFrames: read/schema/select/SQL | DF vs RDD | California housing, `createOrReplaceTempView` |
| **m6** | Lazy, transforms vs actions | MapReduce clásico | `explain`, filter, `describe`, `groupBy`/`agg` |
| **m7** | Narrow/wide, shuffle, stages | `repartition` vs `coalesce`, cache | `repartition` al escribir; `persist` en tweets |
| **m8** | Catalyst/Tungsten/AQE + formatos | Parquet, Delta, lakehouse | CSV vs Parquet escritura |
| **m9** | Texto + DWH bridge | Spark en ETL/lakehouse | Tweets, tokenización, LDA, resumen DWH |

---

## Quirks conocidos del notebook

`[clase/notebook]` Detalles que conviene anticipar al reproducir el taller:

1. **Java 8 (`apt-get install openjdk-8`) vs `JAVA_HOME` apuntando a Java 21**  
   La primera celda intenta instalar OpenJDK 8 (a veces falla el `apt` con 404 en Colab). La celda siguiente fija `JAVA_HOME` a `java-21-openjdk-amd64`. En la práctica **funciona con Java 21** si Spark ya está descomprimido; no hace falta forzar Java 8 salvo que el runtime lo exija.

2. **Celdas de ejercicio vacías**  
   Varias secciones dicen «Escriba el código aquí» pero la solución ya está en la celda siguiente (p. ej. top usuarios por `user`). Úsalas como guía autocalificada.

3. **`traindata.csv` vs `twitter_training.csv`**  
   El markdown dice abrir `/content/traindata.csv`; el código usa `/content/twitter_training.csv`. **Usar el nombre del código** o renombrar el archivo al subirlo a Colab.

4. **Word cloud sin `groupby('token').count()`**  
   En el notebook, las líneas de conteo por token están comentadas; el snippet de visualización asume un dict `count` que puede no existir. Ver [pipeline tweets corregido](#pipeline-tweets-limpieza-y-nube-de-palabras).

5. **Esquema housing con mezcla de tipos**  
   Un ejemplo con `StructType` mezcla `IntegerType` en `total_rooms` con `DoubleType` en otras columnas y puede dejar NULLs raros si el `header` no alinea con el tipo. Preferir esquema homogéneo o `inferSchema=True` + cast explícito (ver pipeline housing).

6. **Tokenizer sobre columna `text` sin limpiar en ML**  
   Tokenizer usa `text` original; la limpieza va en `text_clean`. Para nubes de palabras coherente, tokenizar **`text_clean`**.

---

## m0 — Recursos computacionales

### Procesamiento y almacenamiento

`[clase/notebook]` En análisis de datos, los recursos se agrupan en:

- **Capacidad de procesamiento:** CPUs (velocidad, cantidad), GPUs para casos especiales.
- **Capacitad de memoria y disco:** RAM para datos e **intermedios** durante el cómputo; disco cuando la RAM no alcanza.

### Límites al escalar

`[clase/notebook]`

| Limitación | Manifestación |
| --- | --- |
| **Memoria** | El dataset no cabe en RAM de una sola máquina |
| **Tiempo** | Requisitos de baja latencia (casi tiempo real) |

`[didáctico]` R y Python **por defecto** usan un solo CPU aunque el equipo tenga más núcleos. El notebook contrasta:

- `pandas`: `california_housing_train.csv` (~17 000 filas) — bar chart por edad de vivienda.
- `numpy`: matriz 800×800 y suma — un solo hilo visible en el monitor.

`[resumen]` Los DWH modernos y motores como Spark atacan el mismo problema: **muchas filas + consultas pesadas** mediante paralelismo y (en clúster) **MPP**.

---

## m1 — Procesamiento paralelo vs distribuido

### Paralelo

`[clase/notebook]` **Procesamiento paralelo:** el código se divide en varios procesos/hilos que aprovechan **todos los CPUs** de una máquina (o varias si hay red).

```python
# [clase/notebook] — idea RDD local
rdd = spark.sparkContext.parallelize(range(800 * 800))
```

### Distribuido

`[clase/notebook]` **Procesamiento distribuido:** subconjunto del paralelismo donde las tareas corren en **distintas computadoras/servidores** del clúster.

`[didáctico]`

| | Paralelo (multiproceso) | Distribuido |
| --- | --- | --- |
| Alcance | 1 nodo, N cores | N nodos, N×cores |
| Ejemplo Spark | `local[*]` | YARN / K8s / Standalone |
| Fallo | Caída del nodo = todo cae | Pueden tolerarse fallos de executor (linaje RDD) |

---

## m2 — Spark vs Hadoop MapReduce

`[resumen]` Apache Spark (AMPLab ~2009, ASF) es un **motor de procesamiento distribuido** open source:

- Procesa **en memoria** → mucho más rápido que MapReduce que **persiste en disco** entre map y reduce.
- **Motor unificado:** batch, SQL, streaming, ML, grafos.
- Lenguajes: Scala (nativo), **Python (PySpark)**, Java, R, SQL.
- **No es almacenamiento:** lee HDFS, S3, JDBC, Kafka, Parquet, etc.

### Tabla comparativa

`[resumen]` `[didáctico]`

| Aspecto | MapReduce | Spark |
| --- | --- | --- |
| Intermedios | Disco | Memoria (y disco si hace falta) |
| Operaciones | map + reduce | map, filter, join, groupBy, SQL… |
| Modalidades | Batch | Batch, streaming, ML, SQL, grafos |
| Iteraciones (ML) | Lentas | Eficientes |
| API | Verbosa (Java) | Alto nivel (DataFrame, SQL) |

`[resumen]` Spark puede ejecutarse **sobre** Hadoop (YARN + HDFS): reemplaza MapReduce como motor de cómputo, no necesariamente todo el ecosistema Hadoop.

`[clase/notebook]` El notebook resume: Spark distribuye trabajo en **una o miles** de máquinas maximizando memoria y CPUs.

---

## m3 — Stack, componentes y arquitectura

### Componentes del ecosistema

`[clase/notebook]` Nombres del notebook (equivalen al resumen; ML = **SparkML** en el taller):

| Componente | Rol |
| --- | --- |
| **Spark Core** | Motor base, scheduling, memoria, fallos, **RDD** |
| **Spark SQL** | Tablas **DataFrames**, consultas SQL |
| **GraphX** | Análisis en **grafos** (PageRank, etc.) |
| **SparkML** | Pipelines ML (clasificación, clustering, LDA…) |
| *(resumen añade)* **Structured Streaming** | Micro-batches, stream como tabla que crece |
| *(resumen añade)* **MLlib** | API de ML (en la práctica moderna mucho vive en `pyspark.ml`) |

`[resumen]` Por debajo: **cluster manager** + **almacenamiento** (HDFS, S3, Parquet, Delta, JDBC, Kafka).

### Arquitectura de ejecución

`[resumen]`

```text
                    ┌─────────────┐
                    │   Driver    │  SparkSession, DAG, programa tareas
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Executor │ │ Executor │ │ Executor │  Tasks, cache local
        └──────────┘ └──────────┘ └──────────┘
                           ▲
                    Cluster Manager
              (Standalone | YARN | Kubernetes)
```

| Rol | Función |
| --- | --- |
| **Driver** | Proceso principal; crea `SparkSession`; convierte programa en **DAG**; divide en **stages/tasks**; coordina |
| **Cluster Manager** | Asigna recursos (Standalone, YARN, K8s; Mesos deprecado) |
| **Executors** | Ejecutan tasks, guardan datos en **cache**, reportan al driver |

### Modos de despliegue

`[resumen]`

| Modo | Driver |
| --- | --- |
| **local** | Todo en una JVM (pruebas); `local[*]` = un hilo por core |
| **client** | Driver en la máquina del usuario (notebook, IDE) |
| **cluster** | Driver dentro del clúster |

---

## m4 — PySpark, SparkSession y entorno

### PySpark y regla de oro

`[clase/notebook]`

- Librería Python para ejecutar sobre un clúster Spark.
- Integración con el flujo de ciencia de datos (Pandas ↔ Spark).
- Muchas operaciones de Pandas tienen análogo en PySpark con cambio de métodos.

**Regla de oro** (citar en examen):

> Los procesamientos ocurren en un **entorno de ejecución distinto** al intérprete Python: hay que pensar en **ejecución remota**, incluso con `master("local[*]")`.

Implicaciones prácticas:

- No iterar fila a fila con bucles Python masivos.
- Evitar `collect()` en datasets grandes (trae todo al driver).
- Las UDF son más lentas que funciones nativas de Spark SQL.
- `toPandas()` solo para muestras pequeñas o visualización.

### Preparación Colab (referencia)

`[clase/notebook]` Secuencia típica del notebook:

1. Descargar y descomprimir Spark (ej. `spark-4.3.0-bin-hadoop3`).
2. `pip install findspark pyspark`.
3. Variables `JAVA_HOME`, `SPARK_HOME`.
4. `findspark.init()` → `SparkSession`.

### Inicialización y cierre

`[clase/notebook]` `[resumen]`

```python
import os
import findspark

# Windows (local): ajustar rutas; Colab usa /content/...
os.environ["JAVA_HOME"] = "/usr/lib/jvm/java-21-openjdk-amd64"  # ejemplo Colab
os.environ["SPARK_HOME"] = "/content/spark-4.3.0-bin-hadoop3"

findspark.init()

from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .master("local[*]")
    .appName("BDII-PySpark")
    .getOrCreate()
)

# Al terminar (libera recursos):
# spark.stop()
```

---

## m5 — DataFrames: lectura, esquema, select, SQL

### Lectura de datos

`[clase/notebook]` Delegar la carga al motor cuando el archivo está donde Spark puede leerlo:

| API | Uso |
| --- | --- |
| `spark.read.csv` | Texto delimitado |
| `spark.read.json` | JSON líneas o multilínea |
| `spark.read.parquet` | Columnar (preferido en producción) |
| `spark.read.text` | Una columna por línea |
| `spark.read.kafka` | Streaming desde Kafka |

Opciones frecuentes: `header=True`, `inferSchema=True`, `schema=...`, `mode('overwrite')` al escribir.

### Dos caminos de carga (housing)

`[clase/notebook]`

1. **Pandas primero** → `spark.createDataFrame(pddf)` (útil en prototipos pequeños; el driver carga todo).
2. **Directo Spark** → `spark.read.csv(path, schema=..., header=True)` (escalable).

### Esquema: string DDL y StructType

`[clase/notebook]` Dos formas equivalentes:

**String DDL:**

```python
schema_str = """
    longitude double, latitude double, housing_median_age double,
    total_rooms double, total_bedrooms double, population double,
    households double, median_income double, median_house_value double
"""
df = spark.read.csv(path, header=True, schema=schema_str)
```

**StructType:**

```python
from pyspark.sql.types import StructType, StructField, DoubleType

schema = StructType([
    StructField("longitude", DoubleType(), True),
    StructField("latitude", DoubleType(), True),
    # ... resto de columnas con tipos consistentes
])
df = spark.read.csv(path, header=True, schema=schema)
```

`[didáctico]` Declarar esquema evita **doble pasada** para inferir tipos y previene sorpresas (`everything string`). Conviene alinear tipos con el CSV real.

### select, col, alias

`[clase/notebook]` Tres formas de referenciar columnas:

1. String: `'housing_median_age'`
2. Atributo: `df.housing_median_age` (no sirve si el nombre tiene espacios o caracteres raros)
3. `F.col('housing_median_age')` — preferido en expresiones complejas

```python
from pyspark.sql import functions as F

(
    df.select(
        "housing_median_age",
        df.total_rooms,
        (F.col("housing_median_age") + F.col("total_rooms")).alias("edad_mas_habitaciones"),
    )
    .limit(10)
)
```

### Vista temporal y SQL

`[clase/notebook]` `[resumen]`

```python
df.createOrReplaceTempView("Housing")

spark.sql("SELECT housing_median_age FROM Housing LIMIT 10").show()
```

`[didáctico]` Las vistas temporales existen **solo en la sesión** actual; alimentan el mismo motor Catalyst que el API DataFrame.

### RDD vs DataFrame vs Dataset

`[resumen]`

| | RDD | DataFrame | Dataset |
| --- | --- | --- | --- |
| Estructura | Objetos sin esquema | Columnas con nombre/tipo | DataFrame tipado (Scala/Java) |
| Optimización Catalyst | No | Sí | Sí |
| API recomendada hoy | Casos legacy | **Sí (PySpark)** | Scala/Java |

---

## m6 — Ejecución perezosa, transformaciones y acciones

### Lazy execution

`[clase/notebook]` `[resumen]`

- Las **transformaciones** no ejecutan trabajo de inmediato; construyen un plan.
- Las **acciones** disparan la ejecución (`show`, `count`, `collect`, `write`, etc.).
- Beneficio: optimizar el plan completo (menos shuffles, fusionar proyecciones, **predicate pushdown**).

```python
plan = df.select((F.col("housing_median_age") + F.col("total_rooms")).alias("Housing_3"))
plan.explain()      # ver plan físico sin ejecutar
plan.explain(True)  # extended: logical + optimized + physical
```

### Map-Reduce como idea pedagógica

`[clase/notebook]`

| Fase | Idea | Ejemplo Spark |
| --- | --- | --- |
| **Map** | Transformación **por registro** | `select` con expresiones, `withColumn`, tokenizar texto |
| **Reduce** | Agrupar + agregar | `groupBy("user").count()`, `agg(avg(...))` |

En Python puro (celda del notebook):

```python
from functools import reduce

l = list(range(100))
reduce(lambda x, y: x + y, map(lambda x: x**2, l))  # 338350
```

En Spark, map/reduce no son funciones con ese nombre en DataFrame API; el patrón se expresa con transformaciones + `groupBy`/`agg`.

### Transformaciones vs acciones (resumen)

`[resumen]`

| Transformaciones (lazy) | Acciones (eager) |
| --- | --- |
| `select`, `filter`/`where`, `withColumn`, `join`, `groupBy`, `distinct` | `show`, `count`, `collect`, `take`, `first`, `write` |

### Conversión de tipos (map sobre columnas)

`[clase/notebook]`

```python
from pyspark.sql.types import IntegerType
from pyspark.sql.functions import struct

df_conversion = df.select(
    "latitude",
    "longitude",
    df.housing_median_age.cast(IntegerType()),
    df.total_rooms.cast("int"),
  # ...
    struct("longitude", "latitude").alias("location"),
)
```

### Filtros: filter / where

`[clase/notebook]`

```python
df_conversion.select("median_income").where("total_rooms > 5000").show()
df_conversion.filter(F.col("total_rooms") > 5000).count()
df_conversion.where(F.col("location.longitude") > -114.6).select("location").show()
```

`where` y `filter` son **alias** en DataFrames.

### describe — estadísticas básicas

`[clase/notebook]`

```python
df_conversion.describe().show()
# count, mean, stddev, min, max por columna numérica
```

### Agregaciones: groupBy + agg

`[clase/notebook]`

```python
(
    df_conversion.groupBy("housing_median_age")
    .agg(
        F.avg("median_house_value").alias("promedio_valor"),
        F.sum("median_income").alias("suma_ingreso"),
    )
    .orderBy(F.desc("housing_median_age"))
    .show()
)

(
    df_conversion.groupBy("total_bedrooms")
    .agg(
        F.avg("median_house_value"),
        F.sum("median_income"),
    )
    .show()
)
```

`groupBy` + agregación con clave distinta → transformación **wide** (shuffle).

---

## m7 — Narrow, wide, shuffle, stages, particiones, cache

### RDD: resilient + lineage

`[resumen]`

- **Resilient:** tolerancia a fallos vía **linaje** (grafo de transformaciones que generaron cada partición).
- **Distributed:** particiones en nodos.
- **Immutable:** cada transformación produce nuevo RDD/DataFrame.
- **Lazy:** evaluación diferida.

### Narrow vs wide

`[resumen]` `[didáctico]`

| Tipo | Dependencia | ¿Shuffle? | Ejemplos |
| --- | --- | --- | --- |
| **Narrow** | 1 partición salida ← 1 entrada | No | `map`, `filter`, `select`, `withColumn` simple |
| **Wide** | Salida depende de muchas entradas | **Sí** | `groupBy`, `join`, `distinct`, `orderBy`, `repartition` |

El **shuffle** redistribuye datos por red/disco → operación más cara.

### DAG → Job → Stage → Task

`[resumen]`

1. Transformaciones forman un **DAG**.
2. Cada **acción** → un **job**.
3. El scheduler corta **stages** en cada **shuffle boundary**.
4. Cada stage → **tasks** (típicamente una por partición).

Fórmula mnemotécnica: **1 acción = 1 job → N stages (entre shuffles) → M tasks (particiones).**

### repartition vs coalesce

`[resumen]`

| Método | Particiones | Shuffle | Cuándo |
| --- | --- | --- | --- |
| `repartition(n)` | Sube o baja | Sí (redistribuye) | Balancear carga, antes de escritura pesada |
| `coalesce(n)` | Solo baja | Sin shuffle completo | Reducir particiones al final, más barato |

`[clase/notebook]` Al escribir:

```python
df_join.repartition(1).write.mode("overwrite").csv("ejemplo_escritura_1.csv")
df_join.repartition(10).write.mode("overwrite").parquet("ejemplo_escritura_1_parquet")
```

- `repartition(1)` → un solo archivo CSV (cómodo para humanos, mal para paralelismo).
- `repartition(10)` → ~10 archivos Parquet (mejor para lectura distribuida).

### cache / persist

`[resumen]` `[clase/notebook]`

```python
df_cached = df_datetime.persist()  # default MEMORY_AND_DISK
# ...
df_cached.unpersist()
```

Útil cuando un DataFrame se reutiliza en **varias ramas** (limpieza de tweets + agregaciones + ML). `cache()` ≡ `persist(MEMORY_ONLY)` con eviction a disco según config.

---

## m8 — Optimización y formatos de archivo

### Catalyst, Tungsten, AQE

`[resumen]`

| Motor | Qué hace |
| --- | --- |
| **Catalyst** | Optimizador de consultas SQL/DataFrame: plan lógico → reglas (predicate pushdown, column pruning) → plan físico |
| **Tungsten** | Ejecución eficiente: gestión de memoria off-heap, código generado por etapas |
| **AQE** | Reoptimiza **en runtime** con estadísticas reales (tamaño post-shuffle, cambio de estrategia de join) |

### Broadcast join

`[resumen]` Si una tabla es **pequeña**, Spark la **difunde** a todos los executors y evita shuffle de la tabla grande. Típico: hechos ⨝ dimensión pequeña (modelo estrella DWH).

### Formatos

`[resumen]` `[didáctico]`

| Formato | Naturaleza | Notas |
| --- | --- | --- |
| **CSV / JSON** | Texto | Interoperables; parsing costoso; sin tipos fuertes |
| **Parquet** | Columnar comprimido | **Preferido en Spark**; predicate pushdown |
| **ORC** | Columnar | Ecosistema Hive |
| **Avro** | Por filas | Evolución de esquema, streaming |
| **Delta / Iceberg / Hudi** | Capa sobre Parquet | ACID, time travel → **lakehouse** |

Lectura columnar con Pandas del output Parquet del notebook:

```python
import pandas as pd
pd.read_parquet("ejemplo_escritura_1_parquet", columns=["total_rooms", "total_bedrooms"])
```

---

## m9 — Datos no estructurados y puente DWH

### Contexto: tweets

`[clase/notebook]` Ejercicio con ~1.6M tweets: texto libre, fechas, usuarios, sentimiento.

### Esquema corregido

`[clase/notebook]` `inferSchema=True` suele fallar en columnas de texto con comas. Usar DDL:

```python
schema_str = "id long, user string, sentiment string, text string"
df_twitter = spark.read.csv(path, header=True, schema=schema_str)
```

Validación: `df_twitter.where(F.col("id").isNull()).count()` — filas corruptas.

### Top usuarios

`[clase/notebook]`

```python
(
    df_twitter.groupBy("user")
    .count()
    .orderBy(F.desc("count"))
    .limit(20)
    .show()
)
```

### Sentimiento y longitud de texto

```python
(
    df_twitter
    .select("sentiment", F.length("text").alias("length"))
    .groupBy("sentiment")
    .avg("length")
    .show()
)
```

### Fechas (si existe columna `date`)

`[clase/notebook]` Formato ejemplo: `Mon Apr 06 22:19:45 PDT 2009`

```python
df_datetime = (
    df_twitter
    .withColumn("date", F.substring("date", 5, 1000))
    .withColumn("date", F.to_timestamp("date", "MMM dd HH:mm:ss zz yyyy"))
    .persist()
)
```

### Regex: menciones y limpieza de URLs

`[clase/notebook]`

```python
# Primera mención @usuario
F.regexp_extract("text", r"@(\w+)", 1)

# Pipeline de limpieza
df_clean = (
    df_datetime
    .withColumn("text_clean", F.regexp_replace("text", r"https?://[^\s]+", ""))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"[\?_\"()\]=:;,.!\\-]", ""))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"@\w+", " "))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"\s+", " "))
    .withColumn("text_clean", F.lower(F.trim("text_clean")))
    .filter(F.length("text_clean") > 1)
    .persist()
)
```

### Tokenizer, StopWords, explode, conteo

`[clase/notebook]` Pipeline ML para nube de palabras:

1. **Tokenizer** — separa en palabras.
2. **StopWordsRemover** — quita artículos/preposiciones.
3. **explode** — una fila por token.
4. **groupBy + count** — frecuencias.

### TF-IDF y LDA (intro topic modeling)

`[clase/notebook]`

1. **CountVectorizer** — bolsa de palabras dispersa (`rawFeatures`).
2. **IDF** — pondera términos poco frecuentes (`vectors`).
3. **LDA** (`k` temas) — modelado de tópicos no supervisado.

```python
from pyspark.ml.feature import CountVectorizer, IDF
from pyspark.ml.clustering import LDA

cv = CountVectorizer(inputCol="filtrados", outputCol="rawFeatures", vocabSize=200)
featurized = cv.fit(filtrados).transform(filtrados)

idf = IDF(inputCol="rawFeatures", outputCol="vectors")
rescaled = idf.fit(featurized).transform(featurized)

lda = LDA(k=10, maxIter=10, featuresCol="vectors")
model = lda.fit(rescaled)
model.describeTopics(10).show()
```

`[didáctico]` LDA en Spark asume documentos como vectores de términos; la calidad depende de limpieza previa y `vocabSize`.

### Puente Spark ↔ DWH / Lake / Lakehouse

`[resumen]`

| Rol de Spark | Descripción |
| --- | --- |
| **ETL/ELT** | Lee crudo del **data lake** (S3/HDFS), limpia, agrega, escribe al **DWH** o tablas curadas |
| **Lakehouse** | Consulta Parquet/Delta/Iceberg con garantías ACID (Databricks, etc.) |
| **Modelado dimensional** | Construcción de **hechos** y **dimensiones** (Kimball) desde datos procesados |

Conexión con Parte 1 del resumen:

- **DWH (Inmon/Kimball):** integración, historia, OLAP.
- **ELT moderno:** carga cruda al lago, transforma con Spark/dbt en el destino.
- **MPP en la nube** (Snowflake, BigQuery, Redshift) complementa o reemplaza partes del pipeline; Spark sigue siendo motor de preparación.

`[didáctico]` Esquema mental: **Fuentes → (Spark ETL) → Lake/Delta → DWH/BI** o **Lakehouse único** con SQL encima.

---

## Pipelines PySpark corregidos [clase/notebook]

### Pipeline housing (California)

Flujo completo alineado con el notebook, con correcciones de esquema y buenas prácticas:

```python
import findspark
findspark.init()

import os
from pyspark.sql import SparkSession, functions as F
from pyspark.sql.types import (
    StructType, StructField, DoubleType, IntegerType,
)

spark = (
    SparkSession.builder
    .master("local[*]")
    .appName("housing-pipeline")
    .getOrCreate()
)

PATH = "./sample_data/california_housing_train.csv"

schema = StructType([
    StructField("longitude", DoubleType(), True),
    StructField("latitude", DoubleType(), True),
    StructField("housing_median_age", DoubleType(), True),
    StructField("total_rooms", DoubleType(), True),
    StructField("total_bedrooms", DoubleType(), True),
    StructField("population", DoubleType(), True),
    StructField("households", DoubleType(), True),
    StructField("median_income", DoubleType(), True),
    StructField("median_house_value", DoubleType(), True),
])

df = spark.read.csv(PATH, header=True, schema=schema)

# Map: conversión + columna compuesta
df_conv = df.select(
    F.col("latitude"),
    F.col("longitude"),
    F.col("housing_median_age").cast(IntegerType()).alias("housing_median_age"),
    F.col("total_rooms").cast(IntegerType()).alias("total_rooms"),
    F.col("total_bedrooms").cast(IntegerType()).alias("total_bedrooms"),
    F.col("population").cast(IntegerType()).alias("population"),
    F.col("households").cast(IntegerType()).alias("households"),
    F.col("median_income"),
    F.col("median_house_value"),
    F.struct("longitude", "latitude").alias("location"),
)

# SQL
df_conv.createOrReplaceTempView("housing")
spark.sql("""
    SELECT housing_median_age,
           AVG(median_house_value) AS avg_value
    FROM housing
    WHERE total_rooms > 1000
    GROUP BY housing_median_age
    ORDER BY housing_median_age DESC
    LIMIT 10
""").show()

# Acción de perfilado
df_conv.describe().show()

# Escritura
(
    df_conv.repartition(4)
    .write.mode("overwrite")
    .parquet("output/housing_parquet")
)

# spark.stop()
```

### Pipeline tweets: limpieza y nube de palabras

```python
from pyspark.sql import functions as F
from pyspark.ml.feature import Tokenizer, StopWordsRemover

PATH = "/content/twitter_training.csv"  # no traindata.csv

schema = "id long, user string, sentiment string, text string"
df = spark.read.csv(PATH, header=True, schema=schema)

# Reduce: top usuarios
(
    df.groupBy("user")
    .count()
    .orderBy(F.desc("count"))
    .limit(20)
    .show(truncate=False)
)

# Limpieza
df_clean = (
    df
    .withColumn("text_clean", F.regexp_replace("text", r"https?://[^\s]+", ""))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"@\w+", " "))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"[^\w\s]", " "))
    .withColumn("text_clean", F.regexp_replace("text_clean", r"\s+", " "))
    .withColumn("text_clean", F.lower(F.trim("text_clean")))
    .filter(F.length("text_clean") > 1)
    .persist()
)

tokenizer = Tokenizer(inputCol="text_clean", outputCol="tokens")
stop = StopWordsRemover(inputCol="tokens", outputCol="filtered")

tokens = tokenizer.transform(df_clean)
filtered = stop.transform(tokens)

word_counts = (
    filtered
    .select(F.explode("filtered").alias("token"))
    .groupBy("token")
    .count()
    .orderBy(F.desc("count"))
)

word_counts.show(20)

# Opcional: muestra pequeña a Pandas para WordCloud
# wc_sample = word_counts.limit(500).toPandas()
```

### Topic modeling (fragmento corregido)

```python
from pyspark.ml.feature import CountVectorizer, IDF
from pyspark.ml.clustering import LDA

cv = CountVectorizer(inputCol="filtered", outputCol="rawFeatures", vocabSize=200, minDF=2)
feat = cv.fit(filtered).transform(filtered)

idf = IDF(inputCol="rawFeatures", outputCol="vectors")
rescaled = idf.fit(feat).transform(feat)

lda = LDA(k=10, maxIter=10, featuresCol="vectors")
lda_model = lda.fit(rescaled)
lda_model.describeTopics(10).show(truncate=False)
```

---

## Conceptos DWH (mini-resumen para m9) [resumen]

Útil cuando el quiz mezcla Spark con modelado:

| Tema | Idea clave |
| --- | --- |
| Inmon | DWH integrado, orientado a temas, histórico, no volátil |
| Kimball | Estrella/copo, granularidad primero, dimensiones conformadas |
| OLTP vs OLAP | Transacciones vs análisis agregado |
| ETL vs ELT | Transformar antes vs después de cargar |
| SCD | Tipo 2 = nueva fila con historia |
| Lakehouse | Lago + transacciones ACID (Delta/Iceberg) |

---

## Checklist quiz

Marcar al repasar. Incluye ítems del resumen y del arco PySpark.

### Data Warehouse y modelado

- [ ] Cuatro características de un DWH según **Inmon**
- [ ] Diferencias **OLTP** vs **OLAP**
- [ ] Qué es la **granularidad** y por qué definirla primero (Kimball)
- [ ] **Estrella** vs **copo de nieve**
- [ ] **SCD** tipos 1, 2 y 3 con ejemplo
- [ ] Para qué sirve una **llave subrogada**
- [ ] Medidas **aditivas**, **semi-aditivas**, **no aditivas**
- [ ] **Inmon** vs **Kimball** (top-down vs bottom-up)
- [ ] **Slice** vs **dice**; **roll-up** vs **drill-down**
- [ ] **ETL** vs **ELT**

### Spark: fundamentos

- [ ] Por qué Spark es más rápido que **MapReduce** en iteraciones
- [ ] Componentes: **Spark Core**, **SQL**, **GraphX**, **ML** (SparkML)
- [ ] Roles: **driver**, **executors**, **cluster manager**
- [ ] Modos: **local**, **client**, **cluster**
- [ ] Spark **no** es base de datos ni almacenamiento

### RDD, ejecución y rendimiento

- [ ] Qué significa **resiliente** (linaje)
- [ ] **Transformaciones** vs **acciones**; evaluación **perezosa**
- [ ] **Narrow** vs **wide**; qué es un **shuffle**
- [ ] Cómo un **job** se divide en **stages** y **tasks**
- [ ] **repartition** vs **coalesce**
- [ ] **cache** / **persist** / **unpersist**

### APIs y optimización

- [ ] **RDD** vs **DataFrame** vs **Dataset**
- [ ] Qué hace **Catalyst** (pushdown, pruning)
- [ ] **Tungsten** y **AQE** a alto nivel
- [ ] **Broadcast join** — cuándo aplica

### Formatos y arquitectura de datos

- [ ] Ventajas de **Parquet** vs CSV
- [ ] **ORC**, **Avro**, **Delta/Iceberg** — uso típico
- [ ] Spark en **ETL**, **data lake**, **lakehouse**, **DWH**

### PySpark práctico (notebook)

- [ ] **Regla de oro** de ejecución remota
- [ ] Inicializar y cerrar **SparkSession**
- [ ] `read.csv` / `read.parquet`; **schema** string y **StructType**
- [ ] `select`, `F.col`, **alias**; `filter` / `where`
- [ ] `createOrReplaceTempView` + `spark.sql`
- [ ] `explain()` y lazy execution
- [ ] Idea **map** (por fila) vs **reduce** (`groupBy`/`agg`)
- [ ] `describe()`; agregaciones con `agg`
- [ ] Escribir con `write`; efecto de **repartition**
- [ ] Tweets: corregir **schema**, top **user**, **regex** URLs/menciones
- [ ] **Tokenizer**, **StopWordsRemover**, **explode**, conteo
- [ ] **CountVectorizer**, **IDF**, **LDA** — orden del pipeline

### Quirks (preguntas trampa)

- [ ] Java 8 apt vs **JAVA_HOME 21** en Colab
- [ ] Archivo **`twitter_training.csv`** vs texto `traindata.csv`
- [ ] Celdas de ejercicio **vacías** con solución debajo

---

## Referencias sugeridas (curso)

| Tema | Libro | Lectura |
| --- | --- | --- |
| DWH | *The Data Warehouse Toolkit* (Kimball & Ross) | Caps. 1–3 |
| Spark | *Learning Spark* 2ª ed. | Caps. 1–3; 7 y 9 si hay tiempo |
| RDD profundo | *Spark: The Definitive Guide* | Caps. 12–13 solo si el profe enfatiza RDDs |

---

*Documento generado para study-desk BDII · Nov 2026. Complementa, no reemplaza, el notebook ni el resumen originales.*
