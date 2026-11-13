# Resumen: Data Warehouse y Apache Spark

Nov 12, 2026 · @Susket

## Parte 1: Data Warehouse

Un Data Warehouse (DWH) es un repositorio centralizado que integra datos de muchas fuentes para análisis y toma de decisiones, no para operar el día a día del negocio.

### Definición de Inmon (4 características)

| Característica | Significado |
| --- | --- |
| Orientado a temas (subject-oriented) | Se organiza por áreas del negocio (ventas, clientes, inventario), no por aplicaciones |
| Integrado | Unifica formatos, códigos y nombres de distintas fuentes (ej. "M/F" vs "1/0" → un solo estándar) |
| Variante en el tiempo (time-variant) | Guarda historia; cada dato está asociado a un momento |
| No volátil | Los datos se cargan y consultan, pero normalmente no se actualizan ni borran |

### OLTP vs OLAP

| Aspecto | OLTP (operacional) | OLAP (DWH) |
| --- | --- | --- |
| Propósito | Operar el negocio (transacciones) | Analizar el negocio |
| Operaciones | INSERT, UPDATE, DELETE frecuentes | Mayormente SELECT complejos |
| Datos | Actuales | Históricos |
| Diseño | Normalizado (3FN) | Desnormalizado (estrella) |
| Consultas | Cortas, pocas filas | Largas, agregan millones de filas |
| Usuarios | Muchos (cajeros, apps) | Pocos (analistas, gerentes) |
| Ejemplo | Sistema de facturación | Reporte de ventas por región y año |

### Arquitectura típica

1. Fuentes: ERP, CRM, archivos, APIs.
2. Staging area: zona temporal donde se limpian y transforman los datos.
3. Data Warehouse: datos integrados e históricos.
4. Data Marts: subconjuntos por departamento (ej. Marketing).
5. BI: reportes y dashboards (Power BI, Tableau).

- **Data mart dependiente**: se alimenta del DWH. **Independiente**: se alimenta directo de las fuentes.
- **Metadatos**: datos sobre los datos (origen, transformaciones, significado de cada campo).

### ETL vs ELT

| ETL | ELT |
| --- | --- |
| Extract → Transform → Load | Extract → Load → Transform |
| Se transforma antes de cargar, en un servidor ETL | Se carga crudo y se transforma dentro del DWH |
| Enfoque tradicional (Informatica, SSIS) | Enfoque moderno en la nube (Snowflake, BigQuery + dbt) |
| Útil cuando el DWH tiene poca capacidad de cómputo | Aprovecha el cómputo escalable del DWH en la nube |

### Inmon vs Kimball

|  | Inmon (Top-Down) | Kimball (Bottom-Up) |
| --- | --- | --- |
| Enfoque | Primero el DWH empresarial, luego los data marts | Primero los data marts, que juntos forman el DWH |
| Modelo del DWH | Normalizado (3FN) | Dimensional (estrella) |
| Integración | En el DWH central | Con dimensiones conformadas y la bus matrix |
| Tiempo y costo inicial | Mayor | Menor, entrega valor más rápido |
| Ventaja | Alta consistencia | Más ágil |

## Modelado dimensional

El modelado dimensional organiza los datos en tablas de hechos (medidas) y tablas de dimensiones (contexto). Es el corazón del enfoque de Kimball.

- **Tabla de hechos**: contiene las medidas numéricas del proceso (cantidad, monto, costo) y las llaves foráneas a las dimensiones. Muchas filas, pocas columnas.
- **Tabla de dimensiones**: contexto descriptivo: quién, qué, dónde, cuándo y cómo (Cliente, Producto, Tienda, Fecha). Muchas columnas, menos filas.
- **Granularidad (grain)**: el nivel de detalle de una fila de hechos (ej. "una fila por producto en cada línea de ticket"). Es la decisión más importante y se declara antes de elegir dimensiones y hechos.

### Proceso de diseño de 4 pasos (Kimball)

1. Seleccionar el proceso de negocio (ej. ventas).
2. Declarar la granularidad.
3. Identificar las dimensiones.
4. Identificar los hechos (medidas).

### Estrella vs copo de nieve

| Estrella (Star) | Copo de nieve (Snowflake) |
| --- | --- |
| Hechos al centro, dimensiones desnormalizadas alrededor | Dimensiones normalizadas en subtablas (Producto → Categoría → Departamento) |
| Menos JOINs, consultas más rápidas | Más JOINs, consultas más lentas |
| Más redundancia | Menos redundancia, ahorra espacio |
| Recomendado por Kimball | Se usa con dimensiones enormes |

La **constelación de hechos** (galaxy schema) tiene varias tablas de hechos que comparten dimensiones.

Ejemplo de esquema estrella: FactVentas(fecha\_key, cliente\_key, producto\_key, tienda\_key, cantidad, monto\_venta, costo), unida a DimFecha, DimCliente, DimProducto y DimTienda.

### Tipos de medidas

| Tipo | Regla | Ejemplo |
| --- | --- | --- |
| Aditiva | Se suma en todas las dimensiones | Monto de venta |
| Semi-aditiva | Se suma en algunas, no en el tiempo | Saldo de cuenta, inventario |
| No aditiva | No se suma; se guardan sus componentes | Porcentajes, ratios, precio unitario |

### Tipos de tablas de hechos

| Tipo | Descripción | Ejemplo |
| --- | --- | --- |
| Transaccional | Una fila por evento | Cada venta |
| Snapshot periódico | Foto del estado cada periodo | Inventario al cierre de cada día |
| Snapshot acumulativo | Una fila por proceso con varias fechas de hito que se actualizan | Pedido: orden, envío, entrega |
| Sin hechos (factless) | Registra que algo ocurrió, sin medidas | Asistencia de estudiantes |

### Llaves

- **Llave natural (de negocio)**: viene del sistema fuente (cédula, código de producto).
- **Llave subrogada (surrogate key)**: entero secuencial generado en el DWH, sin significado de negocio. Permite manejar historia (SCD), independiza el DWH de las fuentes y hace los JOIN más eficientes.

### Tipos especiales de dimensiones

- **Conformada**: compartida entre varios marts o tablas de hechos con el mismo significado (DimFecha, DimCliente). Base de la integración en Kimball.
- **Degenerada**: atributo que vive en la tabla de hechos sin tabla propia (número de factura).
- **Junk**: agrupa banderas de baja cardinalidad (sí/no, tipo de pago) en una sola dimensión.
- **Role-playing**: una dimensión con varios roles (DimFecha como fecha de pedido y de envío).
- **Dimensión de fecha**: casi siempre existe, con día, mes, trimestre, año, día de la semana y feriado.

### Slowly Changing Dimensions (SCD)

Definen cómo manejar cambios en atributos de dimensiones (ej. un cliente se muda de provincia).

| Tipo | Qué hace | Historia |
| --- | --- | --- |
| Tipo 0 | Nunca cambia (valor original) | No aplica |
| Tipo 1 | Sobrescribe el valor viejo | Se pierde |
| Tipo 2 | Agrega una fila nueva con nueva llave subrogada, fechas de vigencia y bandera de actual | Completa |
| Tipo 3 | Agrega una columna "valor anterior" | Solo el valor previo |
| Tipo 4 | Historia en una tabla separada (mini-dimensión) | En otra tabla |
| Tipo 6 | Combinación de 1 + 2 + 3 | Completa más valor actual |

Ejemplo de SCD tipo 2:

| cliente\_key | cedula | nombre | provincia | inicio | fin | actual |
| --- | --- | --- | --- | --- | --- | --- |
| 101 | 1-234 | Ana | Cartago | 2020-01-01 | 2025-06-30 | N |
| 245 | 1-234 | Ana | San José | 2025-07-01 | 9999-12-31 | S |

### Bus Matrix

Tabla con procesos de negocio en filas y dimensiones en columnas, que marca qué dimensiones usa cada proceso. Sirve para planear las dimensiones conformadas.

## OLAP, cubos y DWH en la nube

Un cubo OLAP representa los datos en varias dimensiones (ej. Producto × Tiempo × Región), con medidas en las celdas.

### Operaciones OLAP

| Operación | Qué hace | Ejemplo |
| --- | --- | --- |
| Roll-up | Sube de nivel, agrega | De ventas por mes a ventas por año |
| Drill-down | Baja de nivel, más detalle | De año a trimestre a mes |
| Slice | Fija una dimensión en un valor | Solo el año 2025 |
| Dice | Filtra varias dimensiones (subcubo) | 2025, región Central, categoría Lácteos |
| Pivot | Rota los ejes de la vista | Cambiar filas por columnas |

### Tipos de servidores OLAP

- **MOLAP**: almacenamiento multidimensional propio. Rápido, pero escala menos.
- **ROLAP**: sobre base de datos relacional. Escala más, pero es más lento.
- **HOLAP**: híbrido de los dos.

### DWH moderno en la nube

- Ejemplos: Snowflake, Google BigQuery, Amazon Redshift, Azure Synapse, Databricks SQL.
- **Almacenamiento columnar**: guarda por columna en vez de por fila; lee solo las columnas necesarias y comprime mejor.
- **Separación de cómputo y almacenamiento**: cada uno escala por separado.
- **MPP (Massively Parallel Processing)**: la consulta se divide entre muchos nodos.
- **Lakehouse**: combina un data lake (barato, cualquier formato) con capacidades de DWH (transacciones ACID, esquema), usando Delta Lake, Apache Iceberg o Hudi. Conecta con el tema de Data Lakes.

## Parte 2: Apache Spark

Apache Spark es un motor de procesamiento distribuido de datos a gran escala, open source. Nació en UC Berkeley (AMPLab, 2009, Matei Zaharia) y hoy es proyecto de la Apache Software Foundation.

- Procesa datos **en memoria**, por eso es mucho más rápido que Hadoop MapReduce, que escribe a disco entre pasos.
- Es un **motor unificado**: batch, SQL, streaming, machine learning y grafos.
- Lenguajes: Scala (nativo), Python (PySpark), Java, R y SQL.
- **No es una base de datos ni almacenamiento**: lee de HDFS, S3, Azure Blob, bases de datos, Kafka, etc.

### Spark vs Hadoop MapReduce

| MapReduce | Spark |
| --- | --- |
| Escribe resultados intermedios a disco | Mantiene datos en memoria |
| Solo map y reduce | Muchas operaciones (map, filter, join, groupBy…) |
| Solo batch | Batch, streaming, ML, SQL, grafos |
| Lento en algoritmos iterativos (ML) | Muy eficiente en iteraciones |
| API verbosa (Java) | APIs de alto nivel |

Spark puede correr sobre Hadoop (YARN y HDFS). Reemplaza a MapReduce como motor de cómputo, no necesariamente a Hadoop completo.

### Componentes

- **Spark Core**: motor base; maneja tareas, memoria, tolerancia a fallos y RDDs.
- **Spark SQL**: datos estructurados con DataFrames y SQL.
- **Structured Streaming**: datos en tiempo casi real; trata el stream como una tabla que crece, usando micro-batches.
- **MLlib**: machine learning (regresión, clasificación, clustering, recomendación).
- **GraphX**: procesamiento de grafos (ej. PageRank).
- Por debajo: un **cluster manager** y el **almacenamiento** (HDFS, S3, Parquet, Delta, JDBC, Kafka).

### Arquitectura

- **Driver**: proceso principal que ejecuta tu programa. Crea la **SparkSession** (antes SparkContext), convierte el código en un DAG, lo divide en tareas y las programa en los executors.
- **Cluster Manager**: asigna recursos. Opciones: Standalone, YARN, Kubernetes (Mesos está deprecado).
- **Executors**: procesos en los nodos worker que ejecutan las tareas, guardan datos en caché y reportan al driver.
- **Modos de despliegue**: client mode (driver en tu máquina), cluster mode (driver dentro del clúster) y local mode (todo en una máquina, para pruebas).

## RDDs, transformaciones y ejecución

El RDD (Resilient Distributed Dataset) es la abstracción fundamental de Spark: una colección distribuida e inmutable de objetos, particionada entre los nodos.

- **Resilient**: tolerante a fallos. Si se pierde una partición, se recalcula con el **linaje** (lineage), el registro de transformaciones que la generaron. No necesita replicar datos.
- **Distributed**: dividido en particiones repartidas en el clúster.
- **Inmutable**: cada transformación crea un RDD nuevo.
- **Lazy**: se evalúa de forma perezosa.

### Transformaciones vs acciones

| Transformaciones | Acciones |
| --- | --- |
| Crean un nuevo RDD o DataFrame a partir de otro | Devuelven un resultado al driver o escriben a almacenamiento |
| Son lazy: solo se registran en el plan | Disparan la ejecución de todo el plan |
| map, filter, flatMap, select, where, groupBy, join, distinct, union | count, collect, show, take, first, reduce, saveAsTextFile, write |

La evaluación perezosa permite a Spark ver el plan completo y optimizarlo: combina pasos, aplica filtros antes y evita trabajo innecesario.

### Narrow vs wide

- **Narrow (estrechas)**: cada partición de salida depende de una sola partición de entrada; no hay movimiento entre nodos (map, filter).
- **Wide (anchas)**: una partición de salida depende de muchas de entrada; requieren **shuffle**, redistribuir datos por la red (groupByKey, reduceByKey, join, distinct, orderBy).
- El shuffle es la operación más costosa en Spark (red y disco).

### DAG, jobs, stages y tasks

1. Las transformaciones construyen un **DAG** (grafo acíclico dirigido).
2. Cada **acción** crea un **job**.
3. El DAG Scheduler divide el job en **stages**, cortando en cada shuffle.
4. Cada stage se divide en **tasks**, una por partición.
5. Las tasks se envían a los executors.

Resumen: 1 acción = 1 job → N stages (separados por shuffles) → tantas tasks por stage como particiones.

### Particiones

- Son la unidad de paralelismo: más particiones, más tareas en paralelo.
- `repartition(n)`: cambia el número de particiones con shuffle; puede subir o bajar.
- `coalesce(n)`: reduce particiones sin shuffle completo; más eficiente para bajar.

### Caché y persistencia

- `cache()` / `persist()`: guarda un RDD o DataFrame en memoria (o disco) para reutilizarlo sin recalcularlo; clave en algoritmos iterativos.
- Niveles: MEMORY\_ONLY, MEMORY\_AND\_DISK, DISK\_ONLY, entre otros.
- `unpersist()` libera la memoria.

## DataFrames, optimización y uso práctico

El DataFrame es la API recomendada hoy: una colección distribuida organizada en columnas con nombre, como una tabla SQL distribuida.

### RDD vs DataFrame vs Dataset

|  | RDD | DataFrame | Dataset |
| --- | --- | --- | --- |
| Estructura | Objetos sin esquema | Tabla con columnas y esquema | Como DataFrame pero tipado |
| Optimización | No (tú optimizas) | Sí (Catalyst + Tungsten) | Sí |
| Lenguajes | Todos | Todos | Solo Scala/Java |
| Nivel | Bajo | Alto | Alto |

En Scala, DataFrame = Dataset\[Row\].

### Optimizadores

- **Catalyst**: optimiza consultas de DataFrames y SQL. Va de plan lógico, a plan lógico optimizado (predicate pushdown, column pruning), a varios planes físicos, al mejor plan según costos, y genera código.
- **Tungsten**: optimiza la ejecución física: memoria fuera del heap de la JVM, formato binario compacto y whole-stage code generation.
- **AQE (Adaptive Query Execution)**: reoptimiza el plan durante la ejecución con estadísticas reales (ajusta particiones tras un shuffle, cambia el tipo de join).

### Joins y variables compartidas

- **Broadcast join**: si una tabla es pequeña, se copia a cada executor y se evita el shuffle de la grande. Típico al unir una tabla de hechos con una dimensión pequeña.
- **Broadcast variables**: variables de solo lectura enviadas una vez a cada nodo.
- **Accumulators**: variables a las que los executors solo suman (contadores) y que el driver lee.

### Formatos de archivo

| Formato | Tipo | Uso |
| --- | --- | --- |
| Parquet | Columnar, comprimido, con esquema | Formato preferido de Spark |
| ORC | Columnar | Común en el ecosistema Hive |
| Avro | Por filas | Streaming y evolución de esquema |
| CSV / JSON | Texto | Comunes, menos eficientes |
| Delta Lake / Iceberg | Capa sobre Parquet | Transacciones ACID y time travel; base del Lakehouse |

### Ejemplo en PySpark

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum as _sum

spark = SparkSession.builder.appName("Ventas").getOrCreate()

ventas = spark.read.parquet("s3://datos/ventas/")      # transformación (lazy)
productos = spark.read.parquet("s3://datos/productos/")

resultado = (ventas
    .filter(col("anio") == 2025)                       # narrow
    .join(productos, "producto_id")                    # wide (o broadcast si es pequeña)
    .groupBy("categoria")                              # wide → shuffle
    .agg(_sum("monto").alias("total_ventas"))
    .orderBy(col("total_ventas").desc()))

resultado.show()                                        # ACCIÓN → se ejecuta todo
```

Lo mismo en Spark SQL:

```python
ventas.createOrReplaceTempView("ventas")
spark.sql("SELECT categoria, SUM(monto) FROM ventas GROUP BY categoria").show()
```

### Relación Spark, DWH y Data Lake

- Spark se usa mucho como motor ETL/ELT: lee datos crudos del data lake, los limpia y transforma, y los carga al DWH o los deja en tablas Delta o Iceberg.
- En el Lakehouse (ej. Databricks), Spark consulta directamente el data lake con capacidades de DWH.
- Con Spark se pueden construir tablas de hechos y dimensiones (modelo estrella).

## Preguntas de repaso para el quiz

- [ ] ¿Cuáles son las 4 características de un DWH según Inmon?
- [ ] Diferencias entre OLTP y OLAP.
- [ ] ¿Qué es la granularidad y por qué se define primero?
- [ ] Diferencia entre esquema estrella y copo de nieve.
- [ ] Explique SCD tipo 1, 2 y 3 con un ejemplo.
- [ ] ¿Para qué sirve una llave subrogada?
- [ ] Medidas aditivas, semi-aditivas y no aditivas.
- [ ] Diferencias entre Inmon y Kimball.
- [ ] Diferencia entre slice y dice; entre roll-up y drill-down.
- [ ] ETL vs ELT.
- [ ] ¿Por qué Spark es más rápido que MapReduce?
- [ ] Componentes de la arquitectura de Spark (driver, executors, cluster manager).
- [ ] ¿Qué significa que un RDD sea "resiliente"? (linaje)
- [ ] Transformaciones vs acciones; ¿qué es la evaluación perezosa?
- [ ] Narrow vs wide transformations; ¿qué es un shuffle?
- [ ] ¿Cómo divide Spark un job en stages?
- [ ] RDD vs DataFrame; ¿qué hace Catalyst?
- [ ] repartition vs coalesce; cache vs persist.

### Libros recomendados (O'Reilly)

| Tema | Libro | Qué leer |
| --- | --- | --- |
| DWH | The Data Warehouse Toolkit, 3rd Ed. (Kimball & Ross) | Capítulos 1 a 3 |
| Spark | Learning Spark, 2nd Ed. (Damji et al.) | Capítulos 1 a 3; si sobra tiempo, 7 y 9 (Data Lakes) |
| Spark (RDDs) | Spark: The Definitive Guide (Chambers & Zaharia) | Capítulos 12 y 13, solo si el profe enfatiza RDDs |
