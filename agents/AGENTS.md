<!-- -*- coding: utf-8 -*- -->

# AGENTS.md — Convenciones globales

Reglas transversales aplicables a cualquier repositorio de esta máquina. Cada proyecto puede tener su propio AGENTS.md con reglas específicas; si hay conflicto, la regla del proyecto prevalece sobre la global.

## Disciplina de trabajo

1. **PRIMERO INVESTIGAR, LUEGO ACTUAR O RESPONDER.** Nada de responder, proponer o ejecutar desde la memoria de entrenamiento: verificar en fuentes primarias (documentación oficial, código fuente, registros) antes de afirmar. Si algo se desconoce, se dice y se investiga; no se improvisa.
2. **PRIMERO RESUELVO, LUEGO DOCUMENTO.** Ninguna tarea de ejecución se detiene para documentar antes de estar resuelta. La documentación se anota en lote cuando hay una tanda de pasos resueltos y validados. Única excepción: el umbral del plugin zonalista, que invierte la prioridad y obliga a traspasar el estado antes de hacer `/new`.
3. **Solo el humano declara «completado».** Ningún paso se da por terminado sin su validación funcional.
4. **MINI INFORME antes de cada paso** (1-2 párrafos: qué se va a hacer y por qué). La excepción **PARAR Y AVISAR** sí detiene la ejecución: se aplica ante cualquier operación irreversible o fuera del plan acordado.
5. **Ninguna acción destructiva sin aprobación previa**: borrados, sustituciones, desinstalaciones, derribo de servicios.
6. **Secretos nunca en plano**: ni en el chat, ni en el repo, ni en commits, ni en traspasos.

## Delegación y contexto

7. **Delegar en subagentes todo lo paralelizable**: investigaciones, lecturas y relecturas del codebase y de los documentos del proyecto, y cualquier implementación que no sea bloqueante respecto de las demás. El objetivo es mantener ligero el contexto de la sesión principal y acelerar el trabajo. Cada delegación lleva un encargo preciso y autocontenido, y exige de vuelta resultados verificables con sus fuentes.

## Código y control de versiones

8. **No commitear sin petición expresa; no hacer push sin petición expresa.** Antes de commitear: `git status` y `git diff`, y stage solo de los archivos previstos.
9. **README.md es responsabilidad del humano.** No se actualiza salvo instrucción explícita.
10. Respetar las convenciones de cada repo (estilo, bibliotecas ya en uso) y las buenas prácticas de seguridad.

## Forma

11. Castellano normativo (RAE): tildes, eñes, signos de apertura. Redacción directa, bien construida, se permiten emojis pero no es mandatorio.
12. Honestidad por delante: no cantar victoria antes de tiempo; informar explícitamente de lo que no se ha podido verificar.

## Documentación de producto (PRD)

13. **Regla de oro del PRD**: lo que el código explica por sí mismo no tiene cabida en el PRD y se poda en cuanto el humano valida esa implementación. El PRD conserva solo lo que el código no comunica: los porqués de las decisiones, las alternativas descartadas y sus motivos, las limitaciones y contratos irrenunciables, y las ideas de mejora pendientes. La poda se propone como diff concreto y se ejecuta solo con aprobación.

## Operativa del arnés (OpenCode)

14. Si la salida de una herramienta aparece truncada, no repitas el comando: el contenido completo queda ~7 días en el directorio de datos de OpenCode (`%USERPROFILE%\.local\share\opencode\tool-output\` en Windows); léelo de ahí con Read/Grep o delega su lectura en un subagente.

## Procesos lanzados: deber de enterración

15. **El agente entierra lo que arranca.** Al lanzar cualquier proceso, demonio o servidor para pruebas, el agente anota su PID y su forma de matarlo; al cumplir su función o fallar, lo mata por iniciativa propia con barrido posterior (`Win32_Process`, pipes, puertos) y lo declara en el informe. Nunca queda ninguno vivo sin motivo, y nunca se toca lo que el agente no lanzó.
