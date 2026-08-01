---
name: lenguaje-ubicuo
license: MIT
description: Crea y mantiene un CONTEXT.md que clarifica y afina la terminología de dominio de un repositorio, priorizando docs/, PRDs y README.md antes que el codebase. Use when el usuario quiera generar, revisar o afinar el glosario de lenguaje ubicuo (CONTEXT.md) de un proyecto a partir de su documentación existente, sin someterlo a un interrogatorio intensivo ni tocar ADRs.
---

<what-to-do>

Analiza en profundidad la documentación del repositorio para extraer y afinar su terminología de dominio, y vuelca el resultado en `CONTEXT.md`.

Orden de prioridad de las fuentes (de mayor a menor):

1. `docs/` y todas sus subcarpetas
2. Cualquier archivo PRD (`PRD.md`, `prd.md`, `docs/prd/*`, etc.) en cualquier parte del repositorio
3. `README.md`
4. El codebase — solo cuando las fuentes anteriores no resuelven un término

No entrevistes al usuario de forma exhaustiva ni recorras un árbol de decisiones de diseño. Trabaja de forma autónoma leyendo y sintetizando. Consulta al usuario únicamente cuando:

- Encuentres una **contradicción** entre fuentes (p.ej. `docs/` dice X, `README.md` dice Y).
- Detectes una **omisión** relevante: un término clave usado repetidamente sin definir en ninguna fuente.
- Haya **fricción** entre el lenguaje de la documentación y el del código.

Cuando consultes, agrupa las dudas en una sola pregunta (o tanda), ofreciendo tu recomendación para cada una. No conviertas esto en una cadena de preguntas una a una.

</what-to-do>

<supporting-info>

## Formato de CONTEXT.md

Sigue exactamente el formato descrito en [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) 

## Single vs multi-contexto

- Si no existe ningún `CONTEXT.md` en el repositorio, crea **uno único en la raíz** para todo el repositorio. No generes una estructura multi-contexto (`CONTEXT-MAP.md`) de partida.
- Si el repositorio ya tiene una estructura multi-contexto (`CONTEXT-MAP.md` + varios `CONTEXT.md`, por ejemplo creada previamente con `grill-with-docs`), respétala: identifica a qué contexto pertenece el término en cuestión y actualiza el `CONTEXT.md` correspondiente en lugar de crear uno nuevo en la raíz. Si no está claro a qué contexto pertenece, pregunta.

## Qué evitar a toda costa

- No crear ni modificar ADRs.
- No usar `ADR-FORMAT.md` para ningún proceso (esta skill no lo incluye).
- No convertir la sesión en un interrogatorio agresivo ni en la definición de un plan: el foco es la terminología ya existente o documentada, no decisiones de diseño futuras.

## Proceso recomendado

1. Localiza y lee `docs/` (recursivo), cualquier PRD y `README.md`.
2. Explora el codebase solo para resolver términos que sigan sin estar claros tras el paso 1.
3. Redacta o actualiza `CONTEXT.md` siguiendo `CONTEXT-FORMAT.md`.
4. Si surgen contradicciones, omisiones relevantes o fricciones código/docs, resúmelas y pregunta al usuario de una sola vez, con tu recomendación para cada punto.
5. Aplica la resolución acordada y actualiza `CONTEXT.md` inline, sin esperar a acumular más cambios.

</supporting-info>
