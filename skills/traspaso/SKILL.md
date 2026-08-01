---
name: traspaso
license: MIT
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

Esta skill es **efímera e intra-jornada**: no toca otros documentos ni hace commit ni push. Pensada para limpiar contexto cuando éste se degrada o se ralentiza, y retomar el trabajo en una sesión nueva a los pocos minutos u horas. 

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

Ejemplo: `handoff-mi-proyecto-20260703-1645-2.md`

Codifica el archivo en UTF-8 sin BOM.

## Plantilla del documento

Usa esta estructura:

```markdown
# Traspaso — <repo> — <YYYY-MM-DD HH:mm>

## Objetivo de la próxima sesión
<argumento del usuario, o "continuar el trabajo en curso">

## Estado actual
<3-24 bullets>

## Decisiones abiertas
<pendientes que el siguiente agente debe resolver>

## Próximos pasos
<lista accionable ordenada>

## Comportamiento del agente
<órdenes explcíditas dadas por el usuario como informar de los pasos que da o cuando parar y pedirle aprobación al usuario o cualquier otra orden dada en la sesión>

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

- **No dupliques** contenido ya capturado en otros artifacts (PRDs, planes, ADRs, issues, commits, diffs). Referéncialos por ruta o URL.
- **Redacta** cualquier información sensible: API keys, contraseñas, datos personales.
- **Argumento del usuario**: si el usuario pasó un argumento, trátalo como descripción del foco de la próxima sesión y adapta el documento a ello.
- **No toques el PRD** ni hagas commit ni push. Esta skill es solo para handoff efímero.

## Aviso al usuario

Tras generar el traspaso, informa al usuario con este patrón:

> Handoff efímero guardado en `<ruta>`. Este archivo puede desaparecer cuando el SO limpie la carpeta temporal. Si vas a cerrar la jornada o necesitas persistencia a largo plazo, ejecuta `zona-lista` para consolidarlo en el PRD (commit + push).

---

# MODO RETOMA

Si el Paso 0 determinó modo retoma, ejecuta estos pasos **en orden y sin desviaciones**:

1. **Localiza el archivo de traspaso**:
   
   - Debería estar en el workingdir actual. Si no está, dilo.

2. **Busca archivos** que coincidan con `handoff_*.md`.

3. **Selecciona el más reciente** (orden alfabético descendente: el patrón `YYYYMMDD-HHmm` ya ordena cronológicamente).

4. **Lee el documento completo**.

5. **Confirma al usuario** qué traspaso has encontrado (nombre del archivo y fecha/hora). Y resume su contenido.

6. **Retoma el trabajo** siguiendo estrictamente lo indicado en el documento:
   
   - Empieza por la sección "Próximos pasos".
   - Respeta las instrucciones de "Comportamiento del agente".
   - Consulta las "Referencias externas" si el traspaso las menciona.
   - Usa las "Skills sugeridas" si son necesarias para la tarea.
7- Una vez que tengas en memoria el handoff, elimínalo.

8. **Si no existe ningún traspaso** para el repo actual:
   
   - **Si hay documentación alternativa**: preséntasela al usuario y pregúntale cuál tomar como referencia.
   - **Si no hay documentación pero sí código** pregúntale al usuario si quiere o no aceptar la siguiente propuesta **"No he encontrado documentación alternativa que explique el repositorio. Propongo analizar el codebase ¿Te parece bien?"** y si el usuario acepta, si hay algún mcp como codebase-memory o similar, utilízalo para conocer el repositorio. Si no hay ningún mcp para ello, recorre todo el codebase para entenderlo. 
   
   
