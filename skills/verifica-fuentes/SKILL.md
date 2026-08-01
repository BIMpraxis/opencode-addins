---
name: verifica-fuentes
license: MIT
description: Investiga antes de responder para evitar respuestas inventadas, desactualizadas o no fundamentadas. Úsala cuando el usuario pida verificar datos, contrastar fuentes, investigar, buscar en internet, informarse bien, basarse en hechos, o hacer una investigación profunda. También cuando la pregunta trate sobre temas que cambian con frecuencia, cuando la respuesta condicionará decisiones importantes, o cuando se pregunte sobre la UI de una aplicación o web concreta.
---

# Verifica-Fuentes — investigar antes de responder

El principio rector es simple: **investigar primero, responder después**. La memoria de entrenamiento del modelo es una herramienta de orientación, no una fuente fiable. Cuando un dato importa, se busca, se triangula y se cita.

## Cuándo investigar

Activa esta skill ante cualquiera de estas señales:

1. **El usuario lo pide explícitamente.** Expresiones como "investiga", "busca en internet", "infórmate bien", "investigación profunda", "basado en hechos", "contrasta fuentes", "verifica esto" son activaciones directas.

2. **El tema cambia con frecuencia.** Versiones de software, APIs, precios, legislación, datos económicos, rankings, estadísticas, noticias recientes, estado de servicios online, roadmaps de productos. Si el dato pudo cambiar en los últimos meses, la memoria de entrenamiento no basta.

3. **La respuesta condiciona decisiones importantes.** Si lo que respondas va a influir en una compra, una decisión técnica, una estrategia, un diagnóstico, una inversión de tiempo o dinero, o los pasos que el usuario dé a continuación: verifica.

4. **Preguntas sobre la UI de una aplicación o web.** Este caso es absoluto: nunca respondas desde memoria de entrenamiento sobre la interfaz de un producto. Las UIs cambian entre versiones y la memoria del modelo casi siempre está desactualizada. Procedimiento obligatorio:
   
   - Si el usuario no indica la versión exacta del producto, **pregunta antes de investigar**.
   - Una vez conocida la versión, **investiga la documentación oficial o la UI actual** antes de responder.
   - Si no encuentras información de esa versión concreta, dilo explícitamente en vez de suponer.

## Cuándo NO hace falta investigar

Solo cuando se cumplan **todas** estas condiciones:

- El dato es **estable y universalmente conocido** (leyes de la física, sintaxis de lenguajes maduros, hechos históricos consolidados, matemáticas).
- La respuesta **no condiciona ninguna decisión** relevante.
- El usuario **no ha pedido** verificación ni investigación.
- No hay riesgo razonable de que el dato haya cambiado.

En caso de duda entre investigar o no, investiga. El coste de verificar de más es bajo; el coste de inventar es alto.

## El método

### 1 — Identificar los hechos críticos

Antes de buscar, determina qué datos concretos necesitas confirmar. Pregúntate: ¿qué afirmaciones, si están mal, invalidan la respuesta o inducen a error al usuario? Esos son los hechos críticos.

### 2 — Buscar en paralelo con consultas diversas

Lanza al menos 3 búsquedas paralelas variando:

- **Formulación**: una query genérica, una específica con el dato clave, una con sinónimos o perspectiva distinta.
- **Idioma**: busca en el idioma nativo del tema y en inglés.
- **Tipo de fuente**: documentación oficial, prensa especializada, foros técnicos, repositorios.

La convergencia entre búsquedas independientes es la señal de fiabilidad. La divergencia indica que hay que profundizar más.

### 3 — Triangular: mínimo 2 fuentes independientes

Un hecho no está verificado hasta que al menos 2 fuentes independientes lo confirman. Independiente significa:

- **Dominio distinto** (no tres webs que copien la misma fuente).
- **Tipo de fuente distinto** cuando sea posible: documentación oficial, medio especializado, institución, repositorio de código.
- **Idioma distinto** si está disponible.

Prioridad de fuentes (de mayor a menor fiabilidad):

1. Documentación oficial del producto o institución responsable.
2. Repositorios de código fuente (para temas técnicos).
3. Publicaciones académicas o informes institucionales.
4. Medios especializados con reputación verificable.
5. Comunidades técnicas (Stack Overflow, foros oficiales) con respuestas votadas.
6. Wikipedia (buena como punto de partida, insuficiente como única fuente).
7. Agregadores y contenido generado por usuarios (último recurso, nunca como fuente primaria).

### 4 — Cotejar y citar explícitamente

Al entregar la respuesta:

1. **Cita la fuente de cada hecho crítico** (URL, nombre de documento, o referencia clara).
2. **Si un dato no aparece en las fuentes, di "no encontrado"** — nunca rellenes con memoria de entrenamiento.
3. **Si hay discrepancia entre fuentes, menciónala** y explica cómo la resolviste o indica que no se pudo resolver.
4. **Distingue entre hecho verificado e inferencia** cuando tengas que interpretar algo.

## Anti-patrones

- Responder desde "conocimiento general" del modelo sin verificar cuando la skill está activada.
- Aceptar una sola fuente como suficiente.
- Confiar en snippets de buscador sin abrir y leer la fuente completa.
- Rellenar huecos con memoria de entrenamiento cuando un dato no aparece en las fuentes.
- Dar por buena una versión de UI o API sin confirmar que sigue vigente.
- Responder sobre la UI de un producto sin preguntar la versión cuando el usuario no la indica.
- Aventurar cifras, fechas o nombres sin respaldo documental.

## Formato de entrega

```
HECHO: [dato concreto verificado]
FUENTES: [mínimo 2, con URL o nombre claro]
CONVERGENCIA: [todas coinciden / discrepancia entre X e Y, resuelta así]
NO ENCONTRADO: [datos que no se pudieron verificar]
```

Adapta el formato al contexto: en respuestas breves basta con citar entre paréntesis; en investigaciones extensas, usa el formato completo.
