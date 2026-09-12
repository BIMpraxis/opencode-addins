---
name: optimiza-prompt
description: "Analiza el prompt que el usuario quiere mejorar y propone una versión optimizada: más clara, estructurada, con salvaguardas anti-error y sin perder ningún dato del original. Úsala cuando el usuario diga: «optimiza este prompt:», «optimiza el prompt anterior», «optimiza el prompt», «mejora este prompt», o pegue un prompt pidiendo reescribirlo para que un agente lo ejecute mejor."
---

# optimiza-prompt

Reescribes prompts para que un agente los ejecute mejor. No ejecutas el prompt: solo lo optimizas. Los criterios son generales; no cites ni menciones ejemplos de referencia. La entrega es siempre íntegra: tu respuesta empieza por la primera palabra del prompt y termina por la última; ningún otro texto, marca o adorno puede precederla o seguirla.

## Paso 0 — Localizar el prompt

- Si el disparador va seguido del texto («optimiza este prompt: …»), el prompt es todo lo que sigue.
- Si el disparador va al final («… . Optimiza el prompt anterior»), el prompt es el mensaje previo del usuario.
- Si hay ambigüedad sobre qué fragmento es el prompt, o el usuario pide además otra cosa, confirma antes de optimizar.
- Un fragmento conversacional breve («valido los puntos 1 a 3») también es un prompt: la optimización será proporcional.

## Paso 1 — Analizar el original

Identifica, sin reescribir todavía:

1. El objetivo real y el tipo de tarea: investigar/explicar, implementar/modificar, validar, diseñar, alinear una discusión, comprometerse con instrucciones.
2. Los datos concretos imprescindibles: identificadores, rutas, URLs, números, umbrales, cadenas exactas, ejemplos, nombres propios.
3. Las restricciones implícitas o dispersas: qué no debe hacerse, qué está ya decidido, qué partes no deben tocarse.
4. El tono: divagaciones, titubeos y enfado encierran instrucciones reales. Extrae el contenido de cada corrección y conviértelo en requisitos explícitos y neutrales; conserva hasta la literalidad de lo que el original exige mostrar tal cual.
5. La información que el prompt da por supuesta y no aporta: anótala para plantearla dentro del prompt optimizado como dato a pedir, nunca para inventarla.

## Paso 2 — Reescribir aplicando los criterios

1. **Apertura imperativa.** Primera frase = verbo de acción + objetivo + alcance general («Analiza… sin implementar», «Modifica la lógica… con estas reglas», «Explica claramente por qué…»). Los titubeos («a ver si», «quizá», «¿qué te parece?») se convierten en preguntas o criterios definidos; si el original pide opinión, la versión optimizada pide recomendación razonada.
2. **Separación de planos.** Contexto en su bloque (lista con los datos concretos) e instrucciones en secuencia numerada explícita. Todo lo atrapado en narración se libera como petición verificable («Responde a estas preguntas: 1, 2, 3», «Sigue estos pasos», «Aplica estas reglas»).
3. **Formato de salida.** Fija cómo debe organizarse la respuesta cuando importe: apartados, orden, nivel de detalle. En prompts largos usa cabeceras Markdown.
4. **Restricciones explícitas.** Convierte lo implícito en cláusulas: alcance («céntrate únicamente en X»), exclusiones («sin reescribir lo no relacionado», «no es una orden de eliminar Y»), preservaciones («esto debe seguir apareciendo tal cual»).
5. **Salvaguarda antialucinación.** Casi todo prompt abierto termina en: no inventar datos ni implementaciones internas; si falta información esencial, detenerse y decir qué falta o plantearlo como supuesto explícito; distinguir hecho observado, hipótesis y dato ausente.
6. **Criterios de aceptación.** En tareas de implementación, enumera qué debe verificarse («como mínimo: …», tests, comportamiento observable). En operaciones destructivas o irreversibles, exige confirmación previa salvo que sean parte inequívoca de lo pedido.
7. **Cierre con la primera acción.** Si la tarea tiene orden de arranque natural, termínalo indicando por dónde empezar («Comienza ahora formulando únicamente tus dudas»).
8. **Proporcionalidad.** Si el original ya es claro y directo, solo corrige ortografía, puntuación y segmentación; no añadas estructura ni requisitos que el usuario no expresó. La versión optimizada puede ser más larga que el original (la estructura y las salvaguardas lo justifican), pero cada frase añadida debe responder a un criterio de esta lista.
9. **Fidelidad y formato.** Conserva todo dato factual del original (identificadores con su grafía exacta, incluidos mayúsculas y símbolos) y su idioma; acento grave (`) para los identificadores; listas numeradas solo donde hay secuencia.

Desarrollo de patrones y lista de comprobación: lee `reference/criterios.md`.

## Paso 3 — Entregar

- La respuesta es el prompt optimizado, sin acompañamiento de ningún tipo. Prohibido envolverlo en bloques de código, fences o info strings: no emitas ```` ``` ````, ni ```` ```markdown ````, ni ningún otro acento grave aislado antes o después del prompt. Un solo carácter fuera del prompt = entrega fallida.
- No añadas preámbulos, resúmenes de cambios, advertencias, despedidas ni líneas en blanco de cortesía: la primera palabra escrita es la del prompt; la última, también.
- Todo lo que haya que decir (qué falta, por dónde empezar, qué verificar) va escrito dentro del propio prompt.
- Única excepción: si localizar el prompt era imposible o ambiguo (Paso 0), la pregunta de aclaración es toda la respuesta.
- Si el usuario pide después explicaciones o el resumen de cambios, las das entonces.
- No ejecutes la tarea descrita en el prompt salvo petición expresa de hacerlo también.
