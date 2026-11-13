# Data Warehouse — Fuente de estudio enriquecida

> Documento base para el **Study-desk DWH**. Cada bloque mayor está etiquetado como **[resumen]** (síntesis del curso), **[didáctico]** (aprendizaje desde cero) o **[DDIA]** (Martin Kleppmann, *Designing Data-Intensive Applications*, Capítulo 3 — sección Data Warehousing / analytics, ~pág. 90–101 del libro / PDF ~p.112–126).

---

## Fuente [DDIA] — Kleppmann Ch.3 (resumen de estudio)

| Idea | Qué dice DDIA (para el quiz) |
|------|------------------------------|
| Separar OLTP y analítica | Las consultas analíticas barren grandes porciones del dataset y **perjudican** transacciones concurrentes; por eso nace un almacén aparte. |
| Definición práctica de warehouse | Base **separada** donde los analistas consultan a gusto **sin afectar** el OLTP; suele ser una **copia de solo lectura** de varios sistemas. |
| ETL | Extraer de OLTP (dump periódico o stream de cambios), transformar/limpiar a un esquema analítico, cargar en el warehouse. |
| OLTP vs OLAP | OLTP: pocos registros por clave, writes de baja latencia, estado actual. OLAP: agregados sobre muchos registros, ETL masivo, historia de eventos, escala TB–PB. |
| Star schema | Tabla de **hechos** (eventos/medidas) + tablas de **dimensiones** (quién/qué/dónde/cuándo). Fig. 3-9. |
| Snowflake | Dimensiones normalizadas en subtablas; más joins, menos redundancia. |
| Column-oriented storage | Los warehouses suelen leer **pocas columnas** de muchas filas → almacenamiento columnar comprime y acelera agregados (frente a filas del OLTP). |

Citar en la web como `Fuente · [DDIA · p.N]` usando el número de página del PDF del repo.

---

## Módulo m0 — ¿Qué es un Data Warehouse?

### [resumen] Definición y propósito

Un **Data Warehouse (DWH)** es un repositorio centralizado orientado al análisis que integra datos de múltiples fuentes operacionales, los modela para consultas analíticas y mantiene **historial** consistente en el tiempo.

**Características clave (Bill Inmon):**

1. **Orientado al sujeto** — organizado por áreas de negocio (ventas, clientes, inventario), no por aplicación.
2. **Integrado** — nomenclatura, unidades y claves unificadas entre fuentes.
3. **Variación en el tiempo** — conserva estados pasados (no solo el valor actual).
4. **No volátil** — carga periódica; los datos analíticos no se actualizan como en OLTP.

El DWH responde preguntas del tipo: *¿Cuánto vendimos por región el último trimestre comparado con el año anterior?* — no *¿Cuál es el saldo actual de la cuenta X?*

### [didáctico] Analogía desde cero

Imagina una **tienda retail**:

- El **sistema de caja (POS)** registra cada venta en tiempo real → datos **operacionales**.
- El **almacén de análisis (DWH)** copia y reconcilia esas ventas cada noche, las une con catálogo de productos, tiendas y calendario fiscal → datos **analíticos**.

Sin DWH, cada gerente exportaría Excel desde sistemas distintos con definiciones distintas de “venta”. Con DWH, todos consultan **la misma verdad histórica**.

---

## Módulo m1 — Inmon, OLTP vs OLAP

### [resumen] Las 4 características de Inmon (detalle)

| # | Característica | Significado práctico |
|---|----------------|----------------------|
| 1 | Orientado al sujeto | Modelo por *Ventas*, *Cliente*, no por *Módulo ERP* |
| 2 | Integrado | Misma definición de `cliente_id`, moneda, zona horaria |
| 3 | Variación temporal | Snapshots diarios; SCD en dimensiones |
| 4 | No volátil | ETL batch; sin `UPDATE` masivo de hechos ya cargados |

### [resumen] OLTP vs OLAP

| Aspecto | OLTP | OLAP |
|---------|------|------|
| Propósito | Transacciones del día a día | Análisis, reportes, KPI |
| Operaciones | INSERT/UPDATE/DELETE frecuentes | SELECT agregados, pocos writes |
| Normalización | Alta (3FN+) | Desnormalizada (estrella) |
| Usuarios | Operadores, apps | Analistas, BI, dirección |
| Latencia | Milisegundos | Segundos a minutos (aceptable) |
| Ejemplo | Pedido en e-commerce | Ventas por categoría YTD |

**Regla práctica:** no mezclar cargas analíticas pesadas en la misma base OLTP de producción; por eso existe el DWH.

### [didáctico] Preguntas que van a cada mundo

- **OLTP:** “¿Hay stock del SKU 8842 en la tienda Central?”
- **OLAP:** “¿Qué categoría creció más en Q3 en la zona Norte?”

---

## Módulo m2 — Arquitectura del DWH

### [resumen] Flujo: fuentes → staging → DWH → marts → BI

```text
[Fuentes OLTP / APIs / archivos]
        │
        ▼ ETL/ELT
   [Staging / Landing]
   (crudo, poco transformado)
        │
        ▼
   [Enterprise DWH]
   (Inmon: 3NF integrado | Kimball: puede ser bus de hechos)
        │
        ├──────────┬──────────┐
        ▼          ▼          ▼
   [Mart Ventas] [Mart Inv.] [Mart CRM]
        │
        ▼
   [BI: dashboards, cubes, ML features]
```

- **Staging:** zona de aterrizaje; calidad mínima, trazabilidad de archivos y lotes.
- **DWH:** capa integrada corporativa.
- **Data marts:** subconjuntos orientados a departamento o caso de uso.
- **BI:** consumo final.

### [resumen] Marts dependientes vs independientes

| Tipo | Definición | Ventaja | Riesgo |
|------|------------|---------|--------|
| **Dependiente** | Sale del DWH corporativo | Consistencia, gobernanza | Cuellos de botella en el DWH central |
| **Independiente** | Construido directo desde fuentes | Rapidez para un departamento | Silos, métricas inconsistentes |

**Kimball** suele favorecer marts **dependientes** con dimensiones **conformadas** compartidas. **Inmon** pone el énfasis en el **DWH 3NF** primero; los marts son vistas o extracciones.

### [resumen] Metadatos

- **Metadatos técnicos:** esquemas, linaje, jobs ETL, SLAs.
- **Metadatos de negocio:** definición de “venta neta”, dueño del dato, políticas.
- **Metadatos operacionales:** logs de carga, filas rechazadas, watermark de extracción.

Sin metadatos no hay confianza ni impacto ante cambios de esquema en origen.

### [didáctico] Caso retail — mapa mental de arquitectura

**Fuentes:** POS, WMS (inventario), OMS (pedidos), HR (empleados).

**Staging:** tablas `stg_pos_ventas`, `stg_inv_snapshot`, sin joins de negocio aún.

**DWH / bus:** `fact_ventas`, `fact_inventario`, `fact_pedidos` + dimensiones conformadas.

**Marts:** “Retail operaciones” (gerente de tienda), “Finanzas” (margen).

**BI:** Power BI / Looker sobre marts o vistas semánticas.

### [didáctico] Checklist de staging

- [ ] Nombre de lote / `batch_id` y timestamp de extracción
- [ ] Fuente y zona horaria documentadas
- [ ] Tipos alineados o cast explícito (fechas, decimales)
- [ ] Duplicados detectados (clave natural + hash)
- [ ] Registros nulos en claves obligatorias → tabla de rechazos
- [ ] Sin reglas de negocio complejas (eso va en la capa DWH)
- [ ] Retención en staging acotada (días/semanas)
- [ ] Linaje: `source_system`, `source_file` o `source_pk`

---

## Módulo m3 — ETL vs ELT, Inmon vs Kimball

### [resumen] ETL vs ELT

| | **ETL** (Extract–Transform–Load) | **ELT** (Extract–Load–Transform) |
|---|----------------------------------|-----------------------------------|
| Transformación | Motor ETL / fuera del DWH | Dentro del motor SQL del DWH/lake |
| Cuándo brilla | Orígenes heterogéneos, reglas complejas | Cloud DWH escalable (Snowflake, BigQuery) |
| Staging | Muy usado | Landing en object storage + tablas raw |

En la nube, **ELT** es común: se cargan datos crudos y las transformaciones son SQL versionado (dbt, etc.).

### [resumen] Inmon vs Kimball

| | **Inmon** | **Kimball** |
|---|-----------|-------------|
| Modelo central | DWH **relacional 3NF** integrado | **Dimensional** (estrella) en todo el bus |
| Enfoque | Top-down: primero enterprise DWH | Bottom-up: marts con dimensiones conformadas |
| Normalización | Alta en el núcleo | Baja en hechos/dims de presentación |
| Tiempo de valor | Mayor latencia inicial | Entregas iterativas por mart |
| Ideal cuando | Gobierno fuerte, muchas fuentes heterogéneas | BI ágil, analítica por procesos de negocio |

No son excluyentes: muchas organizaciones usan **Inmon para integración** y **Kimball para consumo**.

### [didáctico] ¿Cómo elegir en el caso retail?

- Si el TEC pide “modelo estrella y FactVentas” → **Kimball** es el hilo del curso.
- Si la empresa exige un único modelo 3NF antes de cualquier dashboard → matiz **Inmon**.

---

## Módulo m4 — Granularidad y los 4 pasos de Kimball

### [resumen] Granularity (grano)

El **grano** de una tabla de hechos define **qué representa una fila**. Ejemplos:

- Una fila = **una línea de ticket** de venta.
- Una fila = **ventas diarias por tienda y SKU** (agregado; grano más grueso).

**Regla de oro:** declarar el grano por escrito antes de diseñar dimensiones y medidas. Cambiar el grano después obliga a reconstruir hechos.

### [resumen] Método en 4 pasos (Kimball)

1. **Elegir el proceso de negocio** — p. ej. “registrar venta en caja”.
2. **Declarar el grano** — p. ej. línea de detalle del ticket.
3. **Identificar las dimensiones** — fecha, tienda, producto, cliente, empleado, promoción.
4. **Identificar los hechos (medidas)** — cantidad, importe bruto, descuento, costo, margen.

Iterar por cada proceso: inventario diario, pedido web, devolución.

### [didáctico] Retail — declaración de grano escrita

**Proceso:** Ventas POS.  
**Grano:** Una fila en `fact_ventas` = una línea del ticket (un SKU en un ticket en un instante de cobro).  
**Implicación:** un ticket con 5 productos → 5 filas en `fact_ventas` (no 1 fila por ticket, salvo que el grano sea explícitamente “ticket”).

---

## Módulo m5 — Esquema estrella, copo, galaxia y FactVentas

### [resumen] Star, snowflake, galaxy

| Esquema | Descripción | Pros / contras |
|---------|-------------|----------------|
| **Estrella (star)** | Hechos al centro; dimensiones desnormalizadas | Consultas simples, joins pocos |
| **Copo de nieve (snowflake)** | Dimensiones normalizadas (jerarquías en tablas hijas) | Ahorro storage; más joins |
| **Galaxia (constellation)** | Varios hechos compartiendo dimensiones | Bus de datos Kimball |

### [resumen] Ejemplo conceptual FactVentas

**Tabla `fact_ventas` (hecho):**

| Columna | Rol |
|---------|-----|
| `fecha_key` | FK → `dim_fecha` |
| `tienda_key` | FK → `dim_tienda` |
| `producto_key` | FK → `dim_producto` |
| `cliente_key` | FK → `dim_cliente` |
| `empleado_key` | FK → `dim_empleado` |
| `ticket_id` | Dimensión degenerada |
| `cantidad` | Medida aditiva |
| `venta_bruta` | Medida aditiva |
| `descuento` | Medida aditiva |
| `costo` | Medida aditiva |
| `margen` | Medida semi-aditiva o derivada |

**Dimensiones típicas:** `dim_fecha`, `dim_tienda`, `dim_producto`, `dim_cliente`, `dim_empleado`.

### [didáctico] SQL de consulta estrella (ejemplo)

```sql
-- Ventas por mes y categoría de producto (retail)
SELECT
    d.anio,
    d.mes,
    p.categoria,
    SUM(f.venta_bruta)   AS venta_bruta,
    SUM(f.descuento)     AS descuento_total,
    SUM(f.venta_bruta - f.descuento) AS venta_neta,
    SUM(f.cantidad)      AS unidades
FROM fact_ventas AS f
INNER JOIN dim_fecha    AS d ON f.fecha_key    = d.fecha_key
INNER JOIN dim_producto AS p ON f.producto_key = p.producto_key
INNER JOIN dim_tienda   AS t ON f.tienda_key   = t.tienda_key
WHERE d.anio = 2025
  AND t.region = 'Norte'
GROUP BY d.anio, d.mes, p.categoria
ORDER BY d.anio, d.mes, p.categoria;
```

### [didáctico] Mini caso retail — narrativa

**Tienda “Moda Norte”** abre caja: cliente compra 2 camisas y 1 pantalón. En OLTP hay 1 cabecera de ticket y 3 líneas. En DWH con grano línea:

- 3 filas en `fact_ventas`
- Misma `dim_fecha` (fecha de negocio del cierre)
- `ticket_id` repetido en las 3 filas (degenerada)
- Si el cliente cambia de segmento “VIP” el mes siguiente, **SCD Type 2** en `dim_cliente` preserva el histórico en análisis.

---

## Módulo m6 — Medidas, tipos de hechos, claves y dimensiones especiales

### [resumen] Tipos de medidas

| Tipo | Comportamiento al sumar | Ejemplo |
|------|-------------------------|---------|
| **Aditiva** | Suma en todas las dimensiones | `cantidad`, `venta_bruta` |
| **Semi-aditiva** | Suma en algunas dims, no en tiempo | `saldo_inventario`, `cuentas por cobrar` |
| **No aditiva** | No sumar; promediar o recalcular | `porcentaje_margen`, ratios |

### [resumen] Tipos de tablas de hechos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Transaccional** | Una fila por evento de negocio | `fact_ventas` línea de ticket |
| **Snapshot periódico** | Estado al cierre del período | Inventario fin de día |
| **Acumulativo (accumulating)** | Hitos de un proceso largo | Pedido: creado → enviado → entregado |
| **Sin hechos (factless)** | Solo claves, conteos de eventos | Asistencia promoción, elegibilidad |

### [resumen] Claves naturales vs surrogates

- **Natural:** identificador del origen (`sku`, `cedula`, `num_ticket`).
- **Surrogate (`*_key` entero o UUID):** clave técnica del DWH, inmutable ante cambios en origen.

**Buena práctica:** FKs en hechos apuntan a **surrogate keys** en dimensiones; la natural key vive en la dim como atributo con índice.

### [resumen] Dimensiones especiales

| Dimensión | Uso |
|-----------|-----|
| **Conformada (conformed)** | Misma definición compartida entre hechos (misma `dim_fecha`, `dim_producto`) |
| **Degenerada** | Atributo de transacción sin tabla dim propia (`ticket_id`, `numero_linea`) |
| **Junk** | Agrupa flags/códigos de baja cardinalidad en una sola dim |
| **Role-playing** | Una dim física, varios roles en el hecho (`fecha_venta_key`, `fecha_envio_key` → misma `dim_fecha`) |
| **Fecha (date / time)** | Jerarquías día → semana → mes → trimestre → año; atributos fiscales |

### [didáctico] Ejemplo dimensión junk

En POS llegan: `tipo_pago`, `canal`, `flag_promo` como códigos sueltos. En lugar de 3 mini-dimensiones, `dim_junk_transaccion` combina combinaciones frecuentes para reducir ancho del hecho.

---

## Módulo m7 — SCD y Bus Matrix

### [resumen] Slowly Changing Dimensions (SCD) tipos 0–6 (énfasis 1–3)

| Tipo | Nombre usual | Comportamiento |
|------|--------------|----------------|
| **0** | Retain original | Nunca actualiza; histórico fijo |
| **1** | Overwrite | Sobrescribe; pierde historial |
| **2** | Add new row | Nueva fila + `effective_date` / `is_current` |
| **3** | Add new column | Columna “valor anterior” (historial limitado) |
| **4** | Mini-dim | Histórico en tabla aparte para atributos volátiles |
| **5** | 1 + 4 híbrido | Perfil actual + mini-dim |
| **6** | 1 + 2 + 3 combinado | Raro; casos enterprise |

### [resumen] Ejemplo tabla Type 2 — `dim_cliente`

Supongamos `cliente_natural_id = 'C-1001'`, surrogate `cliente_key`.

| cliente_key | cliente_natural_id | nombre | segmento | ciudad | effective_from | effective_to | is_current |
|-------------|-------------------|--------|----------|--------|----------------|--------------|------------|
| 501 | C-1001 | Ana López | Standard | San José | 2024-01-01 | 2025-06-30 | N |
| 502 | C-1001 | Ana López | VIP | San José | 2025-07-01 | 9999-12-31 | Y |

- Ventas antiguas siguen con `cliente_key = 501`.
- Nuevas cargas resuelven a `502` cuando `is_current = Y`.
- Hechos **no se reescriben**; el contexto histórico vive en la dimensión.

### [resumen] Bus Matrix (matriz del bus)

Filas = **procesos / tablas de hechos**. Columnas = **dimensiones conformadas**. Una **X** indica que el hecho usa esa dimensión.

### [didáctico] Bus Matrix retail — cuadrícula completa

| Hecho \ Dimensión | Fecha | Cliente | Producto | Tienda | Empleado |
|-------------------|:-----:|:-------:|:--------:|:------:|:--------:|
| **Ventas** | X | X | X | X | X |
| **Inventario** | X | | X | X | |
| **Pedidos** | X | X | X | X | X |

**Lectura:**

- **Ventas:** todas las dimensiones (línea de caja).
- **Inventario:** snapshot por fecha, producto y tienda (sin cliente ni empleado en el grano típico).
- **Pedidos:** similar a ventas; puede añadir rol-playing de fechas (pedido vs entrega).

**Beneficio:** planificar una sola `dim_producto` conformada para Ventas, Inventario y Pedidos.

---

## Módulo m8 — OLAP, MOLAP/ROLAP/HOLAP y cloud + lakehouse

### [resumen] Operaciones OLAP

| Operación | Idea | Ejemplo |
|-----------|------|---------|
| **Roll-up (drill-up)** | Subir jerarquía, más agregado | Día → mes |
| **Drill-down** | Bajar jerarquía, más detalle | Mes → día |
| **Slice** | Fijar una dimensión | Solo región “Norte” |
| **Dice** | Subcubo: varias dimensiones fijas | 2025 + categoría “Ropa” |
| **Pivot** | Rotar ejes fila/columna | Tienda en columnas, mes en filas |

### [resumen] MOLAP, ROLAP, HOLAP

| Arquitectura | Almacenamiento | Velocidad | Flexibilidad |
|--------------|----------------|-----------|--------------|
| **MOLAP** | Cubos pre-agregados | Consultas muy rápidas en cubos definidos | Menos ad hoc |
| **ROLAP** | Relacional (estrella en RDBMS) | Depende del motor SQL | Muy flexible |
| **HOLAP** | Híbrido cubo + RDBMS | Balance | Compromiso histórico |

Hoy muchos productos **cloud** combinan SQL masivo (ROLAP-like) con caches y agregados automáticos.

### [resumen] DWH en la nube y lakehouse (intro)

- **Cloud DWH:** Snowflake, BigQuery, Redshift, Synapse — compute/storage separados, escalado elástico, **ELT** nativo.
- **Data lake:** object storage (S3, ADLS) con Parquet/Delta/Iceberg; datos crudos y curated.
- **Lakehouse:** une lake económico + transacciones ACID + SQL en tablas (Delta Lake, Iceberg) para analítica y ML sin duplicar todo en un DWH clásico.

**Patrón moderno:** landing lake → capa curated → servir a BI desde DWH o lakehouse según SLA.

### [didáctico] Dónde encaja el curso

Para el examen, domina **estrella + Kimball + SCD 2 + Bus Matrix + OLTP/OLAP**. La nube es contexto: mismos conceptos, otra plataforma de ejecución.

---

## Referencia rápida — glosario

| Término | Una línea |
|---------|-----------|
| Staging | Aterrizaje temporal pre-DWH |
| Mart | Subconjunto analítico para un dominio |
| Grano | Qué significa una fila de hecho |
| Conformed dim | Dimensión compartida entre hechos |
| ELT | Transformar dentro del destino analítico |

---

## Checklist de repaso (preguntas tipo examen)

Marca cuando puedas responder **sin mirar notas**:

### Fundamentos
- [ ] Enumerar las **4 características de Inmon** y dar un ejemplo de cada una.
- [ ] Comparar **OLTP vs OLAP** en propósito, modelo y tipo de consultas.
- [ ] Definir **Data Warehouse** en una oración orientada al negocio.

### Arquitectura
- [ ] Dibujar el flujo **fuentes → staging → DWH → marts → BI**.
- [ ] Explicar **mart dependiente vs independiente** y un riesgo de cada uno.
- [ ] Citar tres tipos de **metadatos** (técnico, negocio, operacional).

### ETL / enfoques
- [ ] Diferenciar **ETL y ELT** con un caso cloud.
- [ ] Tabla comparativa **Inmon vs Kimball** (al menos 3 filas).

### Modelado dimensional
- [ ] Definir **grano** y por qué no debe cambiarse a la ligera.
- [ ] Listar los **4 pasos de Kimball** aplicados a “ventas”.
- [ ] Diferenciar **estrella, copo de nieve y galaxia**.
- [ ] Nombrar columnas típicas de **FactVentas** (FKs + medidas).

### Medidas, hechos y claves
- [ ] Clasificar medidas: **aditiva, semi-aditiva, no aditiva** con ejemplos.
- [ ] Tipos de hechos: **transaccional, snapshot, acumulativo, factless**.
- [ ] **Natural vs surrogate key** — ¿qué lleva el hecho como FK?
- [ ] Dimensiones: **conformada, degenerada, junk, role-playing, fecha**.

### SCD y Bus Matrix
- [ ] Describir **SCD Type 1 vs Type 2**; cuándo usar cada una.
- [ ] Interpretar una fila de **dim_cliente Type 2** con `effective_from` / `is_current`.
- [ ] Completar mentalmente la **Bus Matrix** retail (Ventas, Inventario, Pedidos).

### OLAP y plataformas
- [ ] Definir **roll-up, drill-down, slice, dice, pivot**.
- [ ] Comparar **MOLAP, ROLAP, HOLAP** en una frase cada uno.
- [ ] Qué aporta un **lakehouse** frente a solo data lake o solo DWH.

### Aplicación integrada
- [ ] Escribir un **SELECT** estrella que agrupe ventas por mes y categoría.
- [ ] Recorrer el **caso retail**: POS → staging → `fact_ventas` → dashboard.

---

## Mapa sugerido de módulos (m0–m8)

| Módulo | Título | Contenido principal en este documento |
|--------|--------|----------------------------------------|
| **m0** | Qué es DWH | Definición, 4 Inmon (intro), analogía retail |
| **m1** | Inmon + OLTP/OLAP | Tabla OLTP/OLAP, características Inmon |
| **m2** | Arquitectura | Pipeline, marts, metadatos, checklist staging |
| **m3** | ETL/ELT + Inmon/Kimball | Comparativas y elección de enfoque |
| **m4** | Grano + 4 pasos | Granularidad, método Kimball |
| **m5** | Estrella + FactVentas | Star/snowflake/galaxy, ejemplo SQL |
| **m6** | Medidas, facts, keys, dims | Tipos de medidas/hechos, dims especiales |
| **m7** | SCD + Bus Matrix | Type 0–6 (1–3), ejemplo Type 2, matriz retail |
| **m8** | OLAP + cloud | Ops OLAP, MOLAP/ROLAP/HOLAP, lakehouse |

---

*Fin del documento — Study-desk DWH. Revisa el checklist antes del parcial.*
