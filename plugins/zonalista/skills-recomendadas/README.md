# Skills recomendadas para zonalista

Cuando el plugin **zonalista** alcanza el umbral de tokens, no inventa un formato propio: busca una skill de traspaso/handoff y le encarga el relevo de la sesión.

Esta carpeta está pensada para guardar (o enlazar) las skills de traspaso que quieras tener a mano junto al plugin.

La compañera natural de este repo es la skill [`traspaso`](../../../skills/traspaso/SKILL.md), que ya vive en `skills/traspaso/`. Si usas `npx skills add BIMpraxis/opencode-addins` o copias las skills a tu directorio de opencode, zonalista la detectará automáticamente por su nombre y descripción.

Palabras clave que busca zonalista (función `findHandoffSkillCandidates()` en `zonalista.ts`):

- `traspaso`
- `handoff`
- `relevo`
- `relevo-sesion` / `relevo_sesion`
- `session-handoff` / `session-relevo`

Si tu skill de traspaso se llama de otra forma, añade su nombre a esa lista en `zonalista.ts`.
