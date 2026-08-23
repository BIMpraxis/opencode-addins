---
name: hoja-de-ruta
description: "Traduce el PRD, SPECS o documento similar junto al histórico git en una hoja de ruta didáctica centrada en valor. Úsala cuando el usuario diga hoja de ruta, roadmap, hoja-de-ruta, haz la hoja de ruta, muestra la hoja de ruta, genera hoja de ruta, enséñame la roadmap."
---

## Paso 0 — Alcance temporal y guion de tareas (OBLIGATORIO, antes de leer nada)

Haz al usuario **dos preguntas** con `question`, antes de leer el documento fuente (PRD, SPECS o similar) o git:

**Pregunta 1 — Alcance temporal:**

* **Opción A (Recomendada):** Solo lo pendiente — desde el siguiente hito no validado hasta el fondo del backlog del documento fuente y lo que git muestre por delante.
* **Opción B:** Timeline completo — desde el primer registro en `git log` y las secciones de estado/historia del documento fuente hasta el backlog.

Si duda, recomienda A.

**Pregunta 2 — Guion de tareas (opcional):** ¿quieres que cada hito incluya, antes de sus valoraciones, un *guion* con todas las tareas que lo componen?

* **Sí** (recomendado cuando los hitos proceden de un backlog ya desglosado): cada hito llevará su guion numerado; formato en el Paso 2.
* **No:** hoja más ligera, sin guion.

Si ya ha indicado en el mensaje de activación el alcance, el guion o ambos, no repreguntes lo ya indicado. No leas nada hasta tener ambas respuestas.

## Paso 1 — Lectura mínima verificada

Lee **solo** estas fuentes primarias, en este orden, delegando lo paralelizable en subagentes:

1. El documento fuente completo — `PRD.md`, `SPECS.md` o el nombre que use el proyecto (fuente de verdad). Localiza sus secciones de estado/historia, fases/backlog y limitaciones conocidas.
2. `git log --all --reverse --format="%H %aI %s %b"` y `git status` para situar lo validado vs. pendiente. Usa `%aI` (ISO con zona) para medir tiempos.
3. Las hojas de ruta previas ya generadas (por defecto en `human/roadmap/hoja-de-ruta-*.md`; si el proyecto las guarda en otra carpeta, usa esa), ordenadas por fecha ISO del nombre. De ahí toma la numeración estable de cada hito y los tiempos ya calculados.
4. Si el documento fuente alude a migraciones o decisiones con archivo:línea, verifica el archivo citado solo si condiciona el relato de valor.

Prohibido inventar fechas, hitos o métricas. Cita archivo:línea cuando afirmes un estado.

## Paso 1b — Cálculo de tiempos por hito (OBLIGATORIO si el alcance incluye tiempos)

La skill mide y estima tiempos por hito, aprende de sus errores y mantiene la numeración estable. Hazlo así:

1. **Catálogo canónico de hitos:** extrae del documento fuente (PRD, SPECS o similar): de sus viñetas de historial/sesiones —típicamente entradas del tipo «… validado…»— y de su sección de fases/backlog e ideas pendientes. Es la única lista autorizada. La numeración de las hojas previas manda para no re-numerar: si ya existe un título de hito, respétalo aunque el documento fuente haya añadido una entrada intermedia.
2. **Agrupación de commits en hitos (no es un commit = un hito):** para cada hito, agrupa el conjunto de commits que le pertenecen por heurística mixta, en este orden:
   * Por mensaje: las palabras clave que el propio documento fuente asocia a ese hito (nombre de fase, módulo o feature).
   * Por ficheros tocados: las rutas características del hito según lo que el documento fuente diga de él.
   * Por ventana de fecha de las sesiones registradas en el documento fuente: los commits sin palabra clave que caen dentro de la ventana de esa sesión heredan ese hito.
   * Lo no encajable va a `Otros/mantenimiento` y no distorsiona la media; si son muchos seguidos, proponlo como hito candidato nuevo.
3. **Recorre TODO `git log` aunque hayas reusado tiempos de hojas pasadas.** Es obligatorio para no dejar commits huérfanos. Si la hoja pasada decía `Real: 4 días` pero git muestra dos commits nuevos del mismo hito, recalcula.
4. **Tiempo real (hito validado por el humano, con fecha registrada en el documento fuente):**
   * `first = min(aI de sus commits)`, `last = max(aI)`.
   * `días naturales = (last - first) en días +1` (misma jornada =1).
   * `días con commits = días distintos con al menos un commit del hito`.
   * Si la fecha de validación anotada en el documento fuente es posterior a `last`, anótalo como `+ lag validación` pero no lo cuentes como desarrollo.
5. **Estimación (hito pendiente):**
   * `base = media de días con commits de hitos validados de complejidad similar` (usa tu valoración `Dificultad *` + `Tiempo *` del hito).
   * `estimado = base * (puntos_hito / puntos_histórico_medio)`.
   * **Auto-calibración:** compara, para hitos con dos hojas, `estimado en hoja N` vs `real en hoja N+1`. Calcula `factor_error = media(real/estimado)`. Multiplica la nueva estimación por ese factor y anota `calibrado con error +X%`. Si no hay histórico, marca `confianza: baja`.
6. **Salida por hito:** añade bajo la valoración una línea `Tiempo: Real 3 días (22–24/08, 2 días con commits)` o `Tiempo: Estimado 5 días (≈1 semana) · calibrado +15% · confianza media`.

## Paso 2 — Redacción didáctica (valor por delante, pocos tecnicismos)

Responde **por el chat** con la hoja de ruta, sin crear aún ningún fichero, siguiendo este esquema exacto y en castellano normativo:

1. **Idea central en una frase** — qué es el proyecto y por qué compensa dedicarle tiempo.

2. **MVP** — hitos que necesitas para que te sirva a ti hoy con fiabilidad. Cada hito con: título clarificador, qué resuelve, por qué merece el tiempo, valoración y tiempo al pie.

3. **Más allá del MVP** — hitos que lo hacen escalable para terceros (clientes/suscriptores) y más inteligente.

4. **Marca explícita** — indica con una línea destacada en qué hito deja de ser solo personal y pasa a gobernar lo que ven terceros (suscriptores/clientes).

5. **Guion de tareas por hito (SOLO si se pidió en el Paso 0)** — tras el «Por qué» y antes de las valoraciones, lista numerada con **todas** las tareas que componen el hito:
   
   * Extrae las tareas de los puntos que el documento fuente asigne a ese hito; no inventes ninguna ni mezcles las de otros hitos.
   
   * Ordénalas por dependencia de ejecución.
   
   * Redáctalas como frases completas con verbo, en llano (mismo criterio anti-jerga del resto de la hoja).
   
   * Formato:
     
     **Guion de tareas:**
     
     1. Primera tarea, con su verbo y su objetivo claro.
     2. Segunda tarea, indicando si depende de la anterior.
     3. Tarea final que cierra el hito dejándolo usable.

6. **Valoración por hito** — al final de cada hito, añade en líneas separadas:
   
   * Dificultad: * a ***** (1-5)
   * Tiempo de desarrollo: * a ***** (1-5)
   * Propensión a fallos: * a ***** (1-5)
   * Valor que aporta: * a ***** (1-5)
   * Nota general (0-10 honesta del modelo): `X/10`
   * Tiempo: `Real …` o `Estimado …` (del Paso 1b)

7. **¡Guau! por hito** — una idea creativa y breve que mejore ese hito con efecto sorpresa.

8. **Valoración general del proyecto** — párrafo sintético justo antes de «Nuevos hitos que yo propondría…» que balancee lo ya conseguido (con datos de Paso 1b) y la foto finish cuando todo esté, tono honesto y motivador.

9. **Nuevos hitos propuestos** — 1 a 3 ideas que por sí mismas podrían constituir un hito propio, con una frase de valor.

Estilo y nivel de detalle (OBLIGATORIO, aprendido en iteraciones con el humano):

* **Títulos de hito clarificadores, no telegráficos.** El título debe ser una frase con verbo que explique el objetivo humano, no una etiqueta corta. Mal: `Hito 9 — Consola nueva`. Bien: `Hito 9 — Conseguir reunir lo que hoy exige dos pantallas en una sola titulada «X» (Fase 2, pendiente)`.
* **Qué resuelve y Por qué, siempre con frases completas con verbo.** Mal telegráfico: `Tabla desplegable, todo con interruptor`. Bien: `Se presenta una única tabla desplegable con los elementos agrupados dentro, todo con interruptor a la derecha, alta habilitada por defecto, y el dato de última actualización con el detalle de cambios sin abrir la ficha`. Igual para `Por qué: Se evita que tengas que hacerlo a mano…`.
* **Breve pero no esquelético.** Mantente en longitud breve —3 a 5 líneas por «Qué resuelve» y 1-2 por «Por qué»— pero prima la amenidad y la claridad sobre la brevedad máxima. Mejor una línea más que un hito críptico.
* Sin jerga de implementación (nombres de tablas o columnas internas; términos técnicos solo si son imprescindibles y explicados en llano). Enfócate en fricción que quita, dinero que ahorra y puerta que abre. Pocos tecnicismos.

## Paso 3 — Pregunta de materialización (OBLIGATORIA tras mostrar)

Inmediatamente después de mostrar la hoja de ruta, pregunta **en el mismo turno** con `question`:

> ¿Quieres que guarde esta hoja de ruta como documento `.md`?

* Si dice que sí, guárdala en una carpeta **claramente redundante** que los agentes **no** lean cuando se les pida leer el documento fuente y los handoffs. Por defecto: `human/roadmap/` (alternativa: `docs/roadmap-humana/`). La carpeta es solo para humanos; no es fuente de verdad.
* Nombre: `hoja-de-ruta-YYYY-MM-DD.md` donde `YYYY-MM-DD` es la fecha local ISO del día de generación (sufijo, sin hora). Si existe, añade `-2`, `-3`.
* La hoja guardada debe incluir todo lo mostrado en el chat —incluidos los guiones de tareas si se pidieron, la valoración general y los tiempos por hito del Paso 1b— más una cabecera que explique que es traducción redundante del documento fuente y de los handoffs.
* Codificación UTF-8 sin BOM. No hagas commit ni push salvo orden expresa (regla del AGENTS.md aplicable).
* Si dice que no, no crees fichero.

## Paso 4 — Pregunta de incorporación al documento fuente (OBLIGATORIA tras Paso 3)

En el siguiente turno, pregunta también con `question`:

* ¿Quieres que alguna de las **nuevas ideas** (mejoras ¡guau! o hitos completos nuevos) se incorpore al documento fuente (`PRD.md`, `SPECS.md` o similar)?
* ¿Tienes tú alguna idea nueva que quieras que incorpore?

Reglas:

* Si el usuario señala una idea, sugiere **tú** en qué punto del timeline/documento se intercala (ej.: «tras la fase X, antes de la idea Y») y el texto exacto en formato viñeta de la sección de ideas/backlog del documento fuente, y ejecuta solo con su visto bueno.
* Si no indica nada, no toques el documento fuente.
* Nunca inventes la ubicación: basa la sugerencia en la sección de orden vigente del documento fuente.

## Reglas transversales

* No dupliques secretos ni claves. Cita fuentes primarias con enlace trazable si condicionan una afirmación.
* Si la hoja de ruta es redundante con el documento fuente o los handoffs, dilo explícitamente al guardarla: es una traducción amable para humano, no duplica la fuente de verdad.
* Solo el humano declara completado. No auto-valides el hito.
