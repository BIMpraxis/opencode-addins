---
name: traspaso
description: "Genera o retoma un documento de traspaso efímero. Usa cuando el usuario diga: haz un traspaso, genera traspaso, retoma traspaso, retoma el traspaso, recupera traspaso, continúa desde el traspaso, sigue con el traspaso, lee el traspaso, retoma sesión, retoma el hilo, sigue el hilo, sigue el hilo de la sesión anterior, o cualquier variante de generar/retomar handoff efímero."
---

## Paso 0 — Determina el modo (OBLIGATORIO, antes de hacer nada)

Examina el mensaje del usuario que activó esta skill:

| Condición                                                                                                                                                                                                                                                     | Modo                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| El mensaje contiene "retoma", "recupera", "continúa", "sigue", "retoma el hilo", "sigue el hilo", "sigue el hilo de la sesión anterior", "recupera traspaso", "lee el traspaso", "retoma sesión", o cualquier variante de *retomar/continuar sesión anterior* | **MODO RETOMA** → salta directamente a la sección "MODO RETOMA" abajo. **NO generes un traspaso nuevo.** |
| El mensaje describe un foco, tarea, o pide generar/crear un traspaso                                                                                                                                                                                          | **MODO GENERA** → continúa con las instrucciones siguientes.                                             |

Si tienes cualquier duda sobre si el usuario quiere retomar o generar, **pregunta al usuario** antes de actuar. Nunca asumas que quiere generar cuando podría querer retomar.

---

# MODO GENERA

Escribe un documento de traspaso que resuma la conversación actual para que un agente nuevo pueda continuar el trabajo sin pérdida de contexto.

Esta skill es **efímera e intra-jornada** en lo que toca al traspaso, pero **sí actualiza los documentos permanentes del proyecto** (PRD, glosario, ADRs, AGENTS…) para volcar en ellos las decisiones duraderas. No hace commit ni push (eso es del cierre de ciclo). Pensada para limpiar contexto cuando éste se degrada o se ralentiza, y retomar el trabajo en una sesión nueva a los pocos minutos u horas. 

## Paso previo obligatorio — Barrido de la conversación

Antes de redactar nada, recorre la conversación **mensaje a mensaje** y extrae un inventario con estas categorías:

1. **Preguntas del agente**: cada pregunta que planteó el agente y la respuesta que dio el humano.
2. **Decisiones tomadas**: qué se decidió y, si el humano dio el motivo, cuál fue.
3. **Órdenes, prioridades y criterios de aceptación**: qué pidió el humano, en qué orden y bajo qué condiciones.
4. **Preferencias del humano**: forma de responder, de trabajar, de usar herramientas y de cerrar ciclos.
5. **Hechos verificados e investigaciones hechas**: resultados ya comprobados, para no repetir el trabajo ni las pruebas.
6. **Configuraciones y credenciales aportadas**: solo **nombres** de variables, ficheros o servicios (jamás valores), y las acciones pendientes con su estado.

Regla terminante: **si un mensaje del humano contiene una decisión, una respuesta o una orden, debe quedar reflejado**. No hay mensajes «de paso» que puedan ignorarse.

## Carpeta de guardado

Guarda el documento en la raíz del actual repositorio (workingdir).

## Nombre del archivo

Patrón:

```
handoff_YYYY-MM-DD_HH-mm.md
```

- `YYYY-MM-DD_HH-mm`: fecha y hora **local** del sistema en el momento de generar el traspaso.
- Ejemplo: `handoff_2026-07-03_16-45.md`

## No sobrescritura

Nunca sobrescribas un traspaso previo. Si ya existe un archivo con el mismo nombre (mismo repo y mismo minuto), añade un sufijo numérico: `-2`, `-3`, etc.

Ejemplo: `handoff_2026-07-03_16-45-2.md`

Codifica el archivo en UTF-8 sin BOM.

## Plantilla del documento

Usa esta estructura:

La estructura sigue la misma taxonomía que usa OpenCode al compactar sesiones (Objective / Important Details / Work State / Next Move / Relevant Files): así, tanto un agente nuevo como una compactación posterior reconstruyen el estado con máxima fidelidad.

```markdown
# Traspaso — <repo> — <YYYY-MM-DD HH:mm>

## Objetivo de la próxima sesión
<argumento del usuario, o "continuar el trabajo en curso">

## Estado del trabajo
### Completado — validado por el humano
<solo lo que el usuario declaró completado>
### Completado — pendiente de validación
<hecho pero aún sin el visto bueno del usuario: NO darlo por cerrado>
### En curso
<lo que quedó a medias, con el punto exacto donde se dejó>
### Bloqueado
<qué lo bloquea y qué se necesita para desbloquear>

## Detalles importantes
<rutas exactas, símbolos, comandos, mensajes de error literales, URLs e identificadores que la próxima sesión necesitará>

## Decisiones y respuestas del humano
### Decisiones tomadas
<cada decisión del humano, con su motivo si lo dio; indica entre paréntesis su destino: ya volcada a los documentos permanentes o pendiente de volcar>
### Respuestas a preguntas del agente
<la pregunta y la respuesta que dio el humano>
### Instrucciones y preferencias
<órdenes de comportamiento, de proceso, de comunicación y de herramientas>
### Preguntas sin responder
<preguntas del agente que quedaron sin respuesta del humano>

## Decisiones abiertas
<pendientes que el siguiente agente debe resolver>

## Próximos pasos
<lista accionable ordenada>

## Archivos relevantes
<rutas de los archivos tocados o clave para continuar>

## Comportamiento del agente
<órdenes explícitas dadas por el usuario como informar de los pasos que da o cuando parar y pedirle aprobación al usuario o cualquier otra orden dada en la sesión>

## Skills sugeridas
- <skill> — por qué

## Referencias externas
- PRD: <ruta/URL>
- spec <ruta/URL>
- ADRs: <ruta/URL>
- Issues: <URLs>
- Commits: <hashes/rutas>

## Notas
<resto, sin secretos>
```

## Reglas

- **Nada relevante vive solo en el chat.** Toda decisión duradera se vuelca a los documentos permanentes del proyecto (PRD, glosario, ADRs, AGENTS…) **y** se refleja en el traspaso. Distingue siempre **decisión duradera** (va a los dos: documento permanente y traspaso) de **estado efímero** (solo en el traspaso). Si por la razón que sea no puedes volcarla ahora (p. ej. el proyecto exige aprobación previa), márcala en el traspaso como pendiente de volcar.
- **Criterio de relevancia.** Es relevante todo lo que cambiaría lo que la siguiente sesión hace, decide o da por supuesto; todo lo que el humano tuvo que explicar una vez; todo hecho ya verificado; y toda preferencia que afecte al comportamiento. Prueba práctica: un desconocido que leyera el traspaso debería poder continuar **sin volver a preguntar nada que el humano ya haya respondido**.
- **No dupliques** contenido ya capturado en otros artifacts (PRDs, planes, ADRs, issues, commits, diffs): referéncialos por ruta o URL. Excepción: las decisiones, respuestas e instrucciones del humano se **enumeran** siempre en el traspaso (aunque se referencien), para que la continuidad no dependa de documentos externos.
- **Redacta** cualquier información sensible: API keys, contraseñas, datos personales.
- **Argumento del usuario**: si el usuario pasó un argumento, trátalo como descripción del foco de la próxima sesión y adapta el documento a ello.
- **Actualiza los documentos permanentes** (incluido el PRD) con las decisiones duraderas de la sesión, respetando las reglas de cada proyecto sobre cómo se editan (qué se puede podar, qué exige aprobación, quién es responsable de qué). Lo efímero se queda en el traspaso; lo duradero va también al documento permanente. No hagas commit ni push: eso es del cierre de ciclo.
- **Antes de la compactación**: genera el traspaso ANTES de que una compactación automática pise el contexto (en proyectos con `compaction.auto` activo, no esperes al límite). Si la sesión ya contiene un resumen de compactación, úsalo como base, pero verifica cada dato contra el estado real del repo antes de escribirlo.
- **`.gitignore`**: comprueba si el `.gitignore` del repo ignora `handoff_*.md`. Si no lo ignora (o no existe `.gitignore`), propón al usuario añadir la entrada y hazlo solo con su visto bueno: los handoffs son efímeros por diseño y no deben commitearse por accidente.

## Autocomprobación obligatoria (antes de dar el traspaso por terminado)

Relee la conversación y comprueba, una por una:

1. ¿Cada mensaje del humano con una decisión, una respuesta o una orden está reflejado en el traspaso?
2. ¿Cada decisión duradera tiene destino en un documento permanente, o queda marcada como pendiente de volcar?
3. ¿Cada hecho verificado y cada investigación hecha constan, para no repetirlos?
4. ¿Cada pendiente tiene dueño y estado, y cada pregunta sin responder aparece como tal?
5. ¿Alguna credencial se ha colado con su valor? (Debe aparecer solo el nombre.)

Si alguna respuesta es «no», el traspaso no está terminado: corrígelo. Lo que no puedas verificar, decláralo explícitamente.

## Aviso al usuario

Tras generar el traspaso, informa al usuario con este patrón:

> Handoff efímero guardado en `<ruta>`, con las decisiones duraderas ya volcadas a los documentos permanentes que correspondan. El handoff es efímero: al retomarlo en una sesión nueva se propondrá su eliminación.

---

# MODO RETOMA

Si el Paso 0 determinó modo retoma, ejecuta estos pasos **en orden y sin desviaciones**:

1. **Localiza el archivo de traspaso**:
   
   - Debería estar en el workingdir actual. Si no está, dilo.

2. **Busca archivos** que coincidan con `handoff_*.md`.

3. **Selecciona el más reciente** (orden alfabético descendente: el patrón `YYYY-MM-DD_HH-mm` ya ordena cronológicamente).

4. **Lee el documento completo**.

5. **Confirma al usuario** qué traspaso has encontrado (nombre del archivo y fecha/hora). Y resume su contenido.

6. **Retoma el trabajo** siguiendo estrictamente lo indicado en el documento:
   
   - Empieza por la sección "Próximos pasos".
   - Respeta las instrucciones de "Comportamiento del agente".
   - Consulta las "Referencias externas" si el traspaso las menciona.
   - Usa las "Skills sugeridas" si son necesarias para la tarea.
   - Trata como no cerrado todo lo que figure "pendiente de validación": solo el humano declara completado.

7. **Verifica la cobertura del traspaso**: comprueba que trae las decisiones, respuestas e instrucciones del humano, los hechos ya verificados y los pendientes con su estado. Si detectas huecos, o decisiones que siguen sin destino en un documento permanente, **avísalo antes de continuar** y propón volcarlas.

8. **Propón eliminar el handoff**: una vez cargado su contenido, propone al usuario borrarlo (es efímero por diseño) y elimínalo **solo con su confirmación expresa**. Borrar es una acción destructiva: nunca lo hagas por tu cuenta.

9. **Si no existe ningún traspaso** para el repo actual:
   
   - **Si hay documentación alternativa**: preséntasela al usuario y pregúntale cuál tomar como referencia.
   - **Si no hay documentación pero sí código** pregúntale al usuario si quiere o no aceptar la siguiente propuesta **"No he encontrado documentación alternativa que explique el repositorio. Propongo analizar el codebase ¿Te parece bien?"** y si el usuario acepta, si hay algún mcp como codebase-memory o similar, utilízalo para conocer el repositorio. Si no hay ningún mcp para ello, recorre todo el codebase para entenderlo. 
   
   
