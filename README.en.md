# opencode-addins

[![skills.sh](https://skills.sh/b/BIMpraxis/opencode-addins)](https://skills.sh/BIMpraxis/opencode-addins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 🌐 **Language:** [Español](./README.md) | **English**

Skills, plugins and agent conventions for [opencode](https://opencode.ai) that I use daily to do real engineering: small, easy to adapt and composable. They work with any model.

They are meant to be installed, modified and made yours. If you find something useful, copy it and adapt it without hesitation.

## What's included

| Type   | Name                                                     | What it does                                                                                                                                                             | Dependencies                                  |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Skill  | [`aletheia`](./skills/aletheia/SKILL.md)                 | When you have no ideas: helps you unblock, refocus or start from a blank page until you reach the «wow, it feels like magic» effect, combining techniques from Wittgenstein, Shklovsky, Duchamp, Eno and Derrida in a procedure inspired by the musical circle of fifths, adapted to creativity to reharmonize the project. | ◐ `charla-socratica` · `verifica-fuentes`      |
| Skill  | [`charla-socratica`](./skills/charla-socratica/SKILL.md) | Socratic dialogue — elenchus and maieutics — to stress-test assumptions and distill, branch by branch, the essence of a plan or design into shared knowledge.          | ● Standalone                                  |
| Skill  | [`hoja-de-ruta`](./skills/hoja-de-ruta/SKILL.md)         | Turns the PRD/SPECS and git history into a value-focused, didactic roadmap with milestones, effort estimates and a clear MVP vs. beyond-MVP split.                      | ● Standalone                                  |
| Skill  | [`lenguaje-ubicuo`](./skills/lenguaje-ubicuo/SKILL.md)   | Scans `docs/`, PRD and `README.md` to extract domain language and keep a coherent `CONTEXT.md` aligned with the codebase.                                               | ● Standalone                                  |
| Skill  | [`optimiza-prompt`](./skills/optimiza-prompt/SKILL.md)   | Rewrites the prompt you give it into an optimized version: clearer, better structured, with anti-error safeguards and without losing any data from the original.      | ● Standalone                                  |
| Skill  | [`traspaso`](./skills/traspaso/SKILL.md)                 | Creates or resumes an ephemeral intra-day handoff (`handoff_YYYY-MM-DD_HH-mm.md`) to clear context and continue without loss between sessions.                          | ● Standalone                                  |
| Skill  | [`verifica-fuentes`](./skills/verifica-fuentes/SKILL.md) | Enforces research, triangulation of at least two independent sources and citation before answering, preventing hallucinated or stale responses.                          | ● Standalone                                  |
| Plugin | [`zonalista`](./plugins/zonalista/LEEME.md)              | Watches session token usage — warning at 90 % and action on `session.idle` — and prepares an automatic handoff before context runs out.                                | ◎ `traspaso`                                  |
| Agent  | [`AGENTS.md`](./agents/AGENTS.md)                        | Global agent conventions: work discipline (research before acting, mini-report, prior approval for destructive actions), sub-agent delegation, version control and style rules. | ● Standalone                                  |

> **Legend — Dependencies:** `●` Standalone — works 100% without other skills. `◐` Enhanced — standalone, improves when the listed skills are present (optional derivation). `◎` Recommended — standalone, but needs the listed skill for its full purpose.

## Installation

### Skills (via skills.sh)

The skills in this repo are listed at **[skills.sh/bimpraxis/opencode-addins](https://skills.sh/bimpraxis/opencode-addins)**. Note that skills.sh only distributes **skills**; the **zonalista plugin** and the **`agents/AGENTS.md` conventions** are not listed there and require manual installation (see [Zonalista plugin](#zonalista-plugin) and [Global agent conventions](#global-agent-conventions)).

```bash
npx skills add BIMpraxis/opencode-addins
```

The installer lets you choose which skills to install and which agents to install them to (opencode, Claude Code, Codex, Cursor and [many more](https://github.com/vercel-labs/skills#supported-agents)).

To install a single skill:

```bash
npx skills add BIMpraxis/opencode-addins --skill traspaso
```

You can also clone the repo and copy the skill folder to your skills directory (e.g. `.opencode/skills/` or `~/.config/opencode/skills/`).

### Zonalista plugin

The plugin is **not** installed via `npx skills`. It is a native opencode plugin. See full instructions at [`plugins/zonalista/LEEME.md`](./plugins/zonalista/LEEME.md). In short:

1. Copy `zonalista.ts` and `zonalista.config.json` to your global plugins folder:
   - Linux/macOS: `~/.config/opencode/plugins/`
   - Windows: `%USERPROFILE%\.config\opencode\plugins\`
2. Edit `model_thresholds` in `zonalista.config.json` with your providers and models.
3. Restart opencode.

> Zonalista looks for a handoff skill to perform the relay. The [`traspaso`](./skills/traspaso/SKILL.md) skill in this repo is the recommended companion.

### Global agent conventions

[`agents/AGENTS.md`](./agents/AGENTS.md) collects the cross-cutting rules I give opencode in any repository. Install it by copying the file into your global configuration (opencode reads it as `AGENTS.md`):

- Linux/macOS: `~/.config/opencode/AGENTS.md`
- Windows: `%USERPROFILE%\.config\opencode\AGENTS.md`

If a project has its own `AGENTS.md`, its rules take precedence over these. Adapt it to your way of working: it is a starting point, not a dogma.

## Repository structure

```
opencode-addins/
├── skills/                  # skills installable via `npx skills add`
│   ├── aletheia/
│   ├── charla-socratica/
│   ├── hoja-de-ruta/
│   ├── lenguaje-ubicuo/
│   ├── optimiza-prompt/
│   ├── traspaso/
│   └── verifica-fuentes/
├── agents/                  # global agent conventions (manual install)
│   └── AGENTS.md
└── plugins/                 # native opencode plugins (manual install)
    └── zonalista/
```

## Acknowledgements

Much of this repo's philosophy — small, composable skills focused on real engineering rather than "vibe coding" — is inspired by [Matt Pocock](https://github.com/mattpocock) and his [mattpocock/skills](https://github.com/mattpocock/skills) repository. If you don't know it, take a look: it's one of the best skill collections for agents out there.

## License

[MIT](./LICENSE). Use, modify and share without restrictions.
