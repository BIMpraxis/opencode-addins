import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface ZonalistaConfig {
  default_threshold: number
  warning_ratio: number
  rules: {
    below_250k: { max_context: number; threshold_percent: number }
    from_250k_to_500k: { min_context: number; max_context: number; threshold_percent: number }
    above_500k: { min_context: number; threshold_fixed: number }
  }
  model_thresholds?: Record<string, number>
}

interface SessionState {
  currentThreshold: number | null
  warningFired: boolean
  actionFired: boolean
  modelContextLimit: number
  lastModelKey: string | null
  pendingWarningText: string | null
  pendingAction: boolean
}

function loadConfig(directory: string): ZonalistaConfig {
  const candidates = [
    join(directory, "zonalista.config.json"),
    join(process.env.HOME || process.env.USERPROFILE || "", ".config", "opencode", "plugins", "zonalista.config.json"),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, "utf-8"))
    }
  }
  return {
    default_threshold: 190000,
    warning_ratio: 0.9,
    rules: {
      below_250k: { max_context: 250000, threshold_percent: 0.85 },
      from_250k_to_500k: { min_context: 250000, max_context: 500000, threshold_percent: 0.85 },
      above_500k: { min_context: 500000, threshold_fixed: 240000 },
    },
  }
}

function computeThreshold(contextLimit: number, cfg: ZonalistaConfig): number {
  if (contextLimit <= 0) return cfg.default_threshold
  if (contextLimit < cfg.rules.below_250k.max_context) {
    return Math.floor(contextLimit * cfg.rules.below_250k.threshold_percent)
  }
  if (contextLimit < cfg.rules.above_500k.min_context) {
    return Math.floor(contextLimit * cfg.rules.from_250k_to_500k.threshold_percent)
  }
  return cfg.rules.above_500k.threshold_fixed
}

export const ZonalistaPlugin: Plugin = async ({ project, client, $, directory }) => {
  const cfg = loadConfig(directory)
  const sessions = new Map<string, SessionState>()

  function getState(sessionID: string): SessionState {
    if (!sessions.has(sessionID)) {
      sessions.set(sessionID, {
        currentThreshold: null,
        warningFired: false,
        actionFired: false,
        modelContextLimit: 0,
        lastModelKey: null,
        pendingWarningText: null,
        pendingAction: false,
      })
    }
    return sessions.get(sessionID)!
  }

  function getEffectiveThreshold(state: SessionState): number {
    if (state.currentThreshold !== null) return state.currentThreshold
    if (state.lastModelKey && cfg.model_thresholds?.[state.lastModelKey]) {
      return cfg.model_thresholds[state.lastModelKey]
    }
    return computeThreshold(state.modelContextLimit, cfg)
  }

  async function resolveModelContext(providerID: string, modelID: string): Promise<{ key: string; context: number }> {
    const key = `${providerID}:${modelID}`
    try {
      const providers = await client.config.providers()
      const provs = (providers.data as any)?.providers || []
      for (const prov of provs) {
        if (prov.id === providerID) {
          const model = prov.models?.[modelID]
          if (model?.limit?.context) return { key, context: model.limit.context }
        }
      }
    } catch {}
    return { key, context: 0 }
  }

  function findHandoffSkillCandidates(): string[] {
    const keywords = ["traspaso", "handoff", "relevo", "relevo-sesion", "relevo_sesion", "session-handoff", "session-relevo"]
    return keywords
  }

  async function executeAction(sessionID: string) {
    const state = getState(sessionID)
    state.pendingAction = false

    const keywords = findHandoffSkillCandidates().join(", ")
    const instruction = `[ZONALISTA - ACCION AUTOMATICA]
Se ha alcanzado el umbral de Zona Lista. Antes de que el usuario refresque la sesion, debes preparar un traspaso.

Procedimiento obligatorio:
1. Revisa la lista de skills disponibles en tu contexto. Busca alguna cuyo nombre o descripcion encaje con: ${keywords}, o cualquier otra cuyo proposito sea guardar el estado de la sesion para retomarla despues.
2. Si encuentras exactamente una skill adecuada, cargala con la herramienta skill y sigue sus instrucciones al pie de la letra.
3. Si encuentras varias skills con ese proposito, PREGUNTA al usuario cual debe usar antes de continuar. No elijas por tu cuenta.
4. Si NO existe ninguna skill de traspaso/handoff/relevo, avisa al usuario con un toast claro: "No hay skill de traspaso disponible. El handoff no se ha realizado." y NO hagas nada mas. No inventes un formato propio.`

    try {
      await client.session.prompt({
        path: { id: sessionID },
        body: {
          parts: [{
            type: "text",
            text: instruction,
          }],
        },
      })
    } catch (err) {
      try {
        await client.tui.showToast({
          body: { title: "ZONALISTA ERROR", message: `Fallo al enviar instruccion de handoff: ${String(err)}`, variant: "error", duration: 15000 },
        })
      } catch {}
      return
    }

    try {
      await client.tui.showToast({
        body: { title: "ZONALISTA", message: "Umbral alcanzado. Preparando traspaso mediante skill. Cuando termine, haz /new para retomar.", variant: "info", duration: 30000 },
      })
    } catch {}
  }

  return {
    tool: {
      zonalista_set_threshold: tool({
        description: "Establece un nuevo umbral de Zona Lista (en tokens) para la sesion actual. El cambio es temporal: no modifica el JSON de configuracion y en la siguiente sesion se restauran los valores originales.",
        args: {
          tokens: tool.schema.number().describe("Nuevo umbral en tokens (p. ej. 500000)"),
        },
        async execute(args, context) {
          const state = getState(context.sessionID)
          const previous = getEffectiveThreshold(state)
          state.currentThreshold = args.tokens
          state.warningFired = false
          state.actionFired = false
          state.pendingWarningText = null
          state.pendingAction = false
          try {
            await client.tui.showToast({
              body: { title: "ZONALISTA", message: `Umbral actualizado: ${previous.toLocaleString("es-ES")} -> ${args.tokens.toLocaleString("es-ES")} tokens (solo esta sesion)`, variant: "info", duration: 8000 },
            })
          } catch {}
          return `Umbral de Zona Lista actualizado a ${args.tokens.toLocaleString("es-ES")} tokens para esta sesion. El aviso previo saltara al ${Math.round(cfg.warning_ratio * 100)}% (${Math.round(args.tokens * cfg.warning_ratio).toLocaleString("es-ES")} tokens). En la proxima sesion se restaurara el umbral configurado.`
        },
      }),
    },

    event: async ({ event }) => {
      if (event.type === "session.idle") {
        const sessionID = (event.properties as any)?.sessionID
        if (!sessionID) return
        const state = getState(sessionID)

        if (state.pendingWarningText) {
          const text = state.pendingWarningText
          state.pendingWarningText = null
          try {
            await client.session.prompt({
              path: { id: sessionID },
              body: {
                noReply: true,
                parts: [{ type: "text", text }],
              },
            })
          } catch {}
          return
        }

        if (state.pendingAction && !state.actionFired) {
          state.actionFired = true
          await executeAction(sessionID)
        }
        return
      }

      if (event.type !== "message.updated") return
      const info = (event.properties as any)?.info
      if (!info || info.role !== "assistant") return
      const sessionID = info.sessionID
      if (!sessionID) return

      const state = getState(sessionID)

      const modelKey = info.providerID && info.modelID ? `${info.providerID}:${info.modelID}` : null
      if (modelKey && modelKey !== state.lastModelKey) {
        state.lastModelKey = modelKey
        const resolved = await resolveModelContext(info.providerID, info.modelID)
        state.modelContextLimit = resolved.context
        if (state.currentThreshold === null) {
          state.warningFired = false
          state.actionFired = false
        }
      }

      const tokens = info.tokens
      if (!tokens) return
      const count = tokens.total || (tokens.input || 0) + (tokens.output || 0) + (tokens.cache?.read || 0) + (tokens.cache?.write || 0) + (tokens.reasoning || 0)
      if (count === 0) return

      const threshold = getEffectiveThreshold(state)
      const warningAt = Math.floor(threshold * cfg.warning_ratio)

      if (!state.actionFired && !state.pendingAction && count >= threshold) {
        state.pendingAction = true
        try {
          await client.tui.showToast({
            body: { title: "ZONALISTA", message: `Umbral de ${threshold.toLocaleString("es-ES")} tokens alcanzado. Se preparara el traspaso de sesion mediante skill al terminar.`, variant: "warning", duration: 15000 },
          })
        } catch {}
        return
      }

      if (!state.warningFired && !state.pendingWarningText && !state.pendingAction && count >= warningAt) {
        state.warningFired = true
        const msg = `***** SE APROXIMA EL UMBRAL DE ZONA LISTA, ESTABLECIDO EN ${threshold.toLocaleString("es-ES")} TOKENS. SI NO DAS ORDENES EXPRESAS, SE PREPARARA EL TRASPASO DE SESION MEDIANTE SKILL. Puedes indicar un nuevo umbral de sesion y el plugin zonalista lo tendra en cuenta. *****`
        try {
          await client.tui.showToast({
            body: { title: "ZONALISTA", message: msg, variant: "warning", duration: 15000 },
          })
        } catch {}
        state.pendingWarningText = `[ZONALISTA - AVISO DEL SISTEMA]\n${msg}\n\nSi el usuario pide ampliar o cambiar el umbral, usa la herramienta zonalista_set_threshold con el nuevo valor en tokens. El cambio solo afecta a esta sesion; en la siguiente se restauran los umbrales del JSON de configuracion.`
      }
    },

    "experimental.session.compacting": async (input, output) => {
      const sessionID = (input as any)?.sessionID
      if (sessionID) {
        const state = getState(sessionID)
        if (!state.actionFired) {
          const keywords = findHandoffSkillCandidates().join(", ")
          output.context.push(
            `[ZONALISTA] Se ha interceptado una compactacion. Antes de compactar, busca una skill de traspaso/handoff/relevo (nombres: ${keywords}) y cargala para preparar el handoff. Si hay varias, pregunta al usuario cual usar. Si no existe ninguna, avisa al usuario y no inventes un formato propio.`
          )
        }
      }
    },
  }
}
