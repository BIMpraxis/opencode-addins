# opencode-addins

[![skills.sh](https://skills.sh/b/BIMpraxis/opencode-addins)](https://skills.sh/BIMpraxis/opencode-addins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 🌐 **Language:** [Español](./README.md) | **English**

Skills and plugins for [opencode](https://opencode.ai) that I use daily to do real engineering: small, easy to adapt and composable. They work with any model.

They are meant to be installed, modified and made yours. If you find something useful, copy it and adapt it without hesitation.

## What's included

| Type   | Name                                                     | What it does                                                                                                                                                             | Dependencies                                  |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Skill  | [`aletheia`](./skills/aletheia/SKILL.md)                 | Explores the still-unformed before the brief: externalizes, unfixes and tests possibilities through the circle of fifths (Wittgenstein–Shklovsky–Duchamp–Eno–Derrida) to harvest a fertile seed or a productive aporia. | ◐ `charla-socratica` · `verifica-fuentes`      |
| Skill  | [`charla-socratica`](./skills/charla-socratica/SKILL.md) | Socratic dialogue — elenchus and maieutics — to stress-test assumptions and distill, branch by branch, the essence of a plan or design into shared knowledge.          | ● Standalone                                  |
| Skill  | [`hoja-de-ruta`](./skills/hoja-de-ruta/SKILL.md)         | Turns the PRD/SPECS and git history into a value-focused, didactic roadmap with milestones, effort estimates and a clear MVP vs. beyond-MVP split.                      | ● Standalone                                  |
| Skill  | [`lenguaje-ubicuo`](./skills/lenguaje-ubicuo/SKILL.md)   | Scans `docs/`, PRD and `README.md` to extract domain language and keep a coherent `CONTEXT.md` aligned with the codebase.                                               | ● Standalone                                  |
| Skill  | [`traspaso`](./skills/traspaso/SKILL.md)                 | Creates or resumes an ephemeral intra-day handoff (`handoff_YYYY-MM-DD_HH-mm.md`) to clear context and continue without loss between sessions.                          | ● Standalone                                  |
| Skill  | [`verifica-fuentes`](./skills/verifica-fuentes/SKILL.md) | Enforces research, triangulation of at least two independent sources and citation before answering, preventing hallucinated or stale responses.                          | ● Standalone                                  |
| Plugin | [`zonalista`](./plugins/zonalista/LEEME.md)              | Watches session token usage — warning at 90 % and action on `session.idle` — and prepares an automatic handoff before context runs out.                                | ◎ `traspaso`                                  |

> **Legend — Dependencies:** `●` Standalone — works 100% without other skills. `◐` Enhanced — standalone, improves when the listed skills are present (optional derivation). `◎` Recommended — standalone, but needs the listed skill for its full purpose.

## Installation

### Skills (via skills.sh)

The skills in this repo are listed at **[skills.sh/bimpraxis/opencode-addins](https://skills.sh/bimpraxis/opencode-addins)**. Note that skills.sh only distributes **skills**; the **zonalista plugin** is not listed there and requires manual installation (see [Zonalista plugin](#zonalista-plugin)).

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

## Repository structure

```
opencode-addins/
├── skills/                  # skills installable via `npx skills add`
│   ├── aletheia/
│   ├── charla-socratica/
│   ├── hoja-de-ruta/
│   ├── lenguaje-ubicuo/
│   ├── traspaso/
│   └── verifica-fuentes/
└── plugins/                 # native opencode plugins (manual install)
    └── zonalista/
```

## Acknowledgements

Much of this repo's philosophy — small, composable skills focused on real engineering rather than "vibe coding" — is inspired by [Matt Pocock](https://github.com/mattpocock) and his [mattpocock/skills](https://github.com/mattpocock/skills) repository. If you don't know it, take a look: it's one of the best skill collections for agents out there.

## License

[MIT](./LICENSE). Use, modify and share without restrictions.
