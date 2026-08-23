# opencode-addins

[![skills.sh](https://skills.sh/b/BIMpraxis/opencode-addins)](https://skills.sh/BIMpraxis/opencode-addins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Skills y plugins para [opencode](https://opencode.ai) que uso a diario para hacer ingeniería de verdad: pequeñas, fáciles de adaptar y componibles. Funcionan con cualquier modelo.

Están pensadas para instalarse, modificarse y hacerse tuyas. Si encuentras algo útil, cópialo y adáptalo sin miedo.

## Qué incluye

| Tipo   | Nombre                                                   | Para qué sirve                                                                                                    |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Skill  | [`charla-socratica`](./skills/charla-socratica/SKILL.md) | Dialoga contigo al modo socrático (elenchus y mayéutica) para destilar la esencia de un plan o diseño.            |
| Skill  | [`hoja-de-ruta`](./skills/hoja-de-ruta/SKILL.md)         | Traduce el PRD, SPECS o documento similar junto al histórico git en una hoja de ruta didáctica centrada en valor. |
| Skill  | [`lenguaje-ubicuo`](./skills/lenguaje-ubicuo/SKILL.md)   | Crea y mantiene un `CONTEXT.md` con la terminología de dominio del proyecto a partir de su documentación.         |
| Skill  | [`traspaso`](./skills/traspaso/SKILL.md)                 | Genera o retoma un documento de traspaso (handoff) efímero para no perder contexto entre sesiones.                |
| Skill  | [`verifica-fuentes`](./skills/verifica-fuentes/SKILL.md) | Obliga al agente a investigar y citar fuentes antes de responder, evitando respuestas inventadas.                 |
| Plugin | [`zonalista`](./plugins/zonalista/LEEME.md)              | Vigila el consumo de tokens de la sesión y prepara un traspaso automático antes de agotar el contexto.            |

## Instalación

### Skills (vía skills.sh)

Las skills de este repo están listadas en **[skills.sh/bimpraxis/opencode-addins](https://skills.sh/bimpraxis/opencode-addins)**. Ten en cuenta que skills.sh solo distribuye las **skills**; el **plugin zonalista** no aparece ahí y requiere instalación manual (ver [Plugin zonalista](#plugin-zonalista)).

```bash
npx skills add BIMpraxis/opencode-addins
```

El instalador te deja elegir qué skills llevar y a qué agentes instalarlas (opencode, Claude Code, Codex, Cursor y [muchos más](https://github.com/vercel-labs/skills#supported-agents)).

Para instalar una skill concreta:

```bash
npx skills add BIMpraxis/opencode-addins --skill traspaso
```

También puedes clonar el repo y copiar la carpeta de la skill a tu directorio de skills (por ejemplo `.opencode/skills/` o `~/.config/opencode/skills/`).

### Plugin zonalista

El plugin **no** se instala con `npx skills`. Es un plugin nativo de opencode. Consulta las instrucciones completas en [`plugins/zonalista/LEEME.md`](./plugins/zonalista/LEEME.md). En resumen:

1. Copia `zonalista.ts` y `zonalista.config.json` a tu carpeta de plugins:
   - Linux/macOS: `~/.config/opencode/plugins/`
   - Windows: `%USERPROFILE%\.config\opencode\plugins\`
2. Edita `model_thresholds` en `zonalista.config.json` con tus proveedores y modelos.
3. Reinicia opencode.

> Zonalista busca una skill de traspaso/handoff para ejecutar el relevo. La skill [`traspaso`](./skills/traspaso/SKILL.md) de este repo es la compañera recomendada.

## Estructura del repositorio

```
opencode-addins/
├── skills/                  # skills instalables con `npx skills add`
│   ├── charla-socratica/
│   ├── hoja-de-ruta/
│   ├── lenguaje-ubicuo/
│   ├── traspaso/
│   └── verifica-fuentes/
└── plugins/                 # plugins nativos de opencode (instalación manual)
    └── zonalista/
```

## Agradecimientos

Gran parte de la filosofía de este repo —skills pequeñas, componibles y centradas en ingeniería real en lugar de "vibe coding"— está inspirada en el trabajo de [Matt Pocock](https://github.com/mattpocock) y su repositorio [mattpocock/skills](https://github.com/mattpocock/skills). Si no lo conoces, échale un vistazo: es una de las mejores colecciones de skills para agentes que hay.

## Licencia

[MIT](./LICENSE). Úsalo, modifícalo y compártelo sin restricciones.
