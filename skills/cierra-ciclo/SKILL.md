---
name: cierra-ciclo
description: "Ejecuta el cierre de ciclo de trabajo: actualiza PRD y CONTEXT.md, genera handoff y hace git add/commit/push. Úsala cuando el usuario diga: cierra ciclo, cierra-ciclo, cerrar ciclo, cierra el ciclo, fin y cierre, sprint ok."
---

Obedece los AGENTS.md global y de proyecto y actualiza el PRD, usa la skill lenguaje-ubicuo y actualiza CONTEXT.md si lo crees conveniente, crea un nuevo handoff usando la skill traspaso y elimina los handoffs obsoletos. Y una vez hecho todo eso, ejecuta el cierre git exhaustivo y verificado:

1. Inspecciona `git status --short` y `git diff --stat` antes de añadir nada, y lista los no rastreados con `git status --porcelain`.
2. Revisa que ningún candidato al commit contenga secretos en plano ni deba ir en `.gitignore`; lo secretado o ignorable no se añade nunca, ni con `-f`.
3. Añade TODO lo previsto con `git add -A` (nunca solo los últimos ficheros tocados), muestra el `git status` resultante y el `git diff --cached --stat`, y solo entonces crea el commit.
4. Tras el commit, verifica `git status --short` vacío; si queda cualquier resto (`M`, `??`, etc.), repite desde el punto 2 o lo dejas declarado como pendiente aceptado por el humano, pero jamás das el ciclo por cerrado con restos silenciosos.
5. Haz `git push` y verifica su resultado; si el push falla, el ciclo queda pendiente de push, no cerrado.
