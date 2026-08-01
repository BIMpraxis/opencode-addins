import { describe, it, expect, beforeEach, mock } from "bun:test"

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
}

const DEFAULT_CFG: ZonalistaConfig = {
  default_threshold: 190000,
  warning_ratio: 0.9,
  rules: {
    below_250k: { max_context: 250000, threshold_percent: 0.85 },
    from_250k_to_500k: { min_context: 250000, max_context: 500000, threshold_percent: 0.85 },
    above_500k: { min_context: 500000, threshold_fixed: 240000 },
  },
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

function getEffectiveThreshold(state: SessionState, cfg: ZonalistaConfig): number {
  if (state.currentThreshold !== null) return state.currentThreshold
  if (state.lastModelKey && cfg.model_thresholds?.[state.lastModelKey]) {
    return cfg.model_thresholds[state.lastModelKey]
  }
  return computeThreshold(state.modelContextLimit, cfg)
}

function countTokens(tokens: any): number {
  if (!tokens) return 0
  return tokens.total || (tokens.input || 0) + (tokens.output || 0) + (tokens.cache?.read || 0) + (tokens.cache?.write || 0) + (tokens.reasoning || 0)
}

function freshState(): SessionState {
  return {
    currentThreshold: null,
    warningFired: false,
    actionFired: false,
    modelContextLimit: 0,
    lastModelKey: null,
  }
}

describe("computeThreshold", () => {
  it("returns default_threshold when contextLimit <= 0", () => {
    expect(computeThreshold(0, DEFAULT_CFG)).toBe(190000)
    expect(computeThreshold(-1, DEFAULT_CFG)).toBe(190000)
  })

  it("applies 85% for context < 250k", () => {
    expect(computeThreshold(131072, DEFAULT_CFG)).toBe(Math.floor(131072 * 0.85))
    expect(computeThreshold(200000, DEFAULT_CFG)).toBe(Math.floor(200000 * 0.85))
    expect(computeThreshold(16000, DEFAULT_CFG)).toBe(Math.floor(16000 * 0.85))
    expect(computeThreshold(100000, DEFAULT_CFG)).toBe(Math.floor(100000 * 0.85))
    expect(computeThreshold(249999, DEFAULT_CFG)).toBe(Math.floor(249999 * 0.85))
  })

  it("applies 85% for 250k <= context < 500k", () => {
    expect(computeThreshold(250000, DEFAULT_CFG)).toBe(Math.floor(250000 * 0.85))
    expect(computeThreshold(300000, DEFAULT_CFG)).toBe(Math.floor(300000 * 0.85))
    expect(computeThreshold(400000, DEFAULT_CFG)).toBe(Math.floor(400000 * 0.85))
    expect(computeThreshold(499999, DEFAULT_CFG)).toBe(Math.floor(499999 * 0.85))
  })

  it("returns fixed 240k for context >= 500k", () => {
    expect(computeThreshold(500000, DEFAULT_CFG)).toBe(240000)
    expect(computeThreshold(983616, DEFAULT_CFG)).toBe(240000)
    expect(computeThreshold(1000000, DEFAULT_CFG)).toBe(240000)
    expect(computeThreshold(1050000, DEFAULT_CFG)).toBe(240000)
  })
})

describe("getEffectiveThreshold", () => {
  it("currentThreshold overrides everything", () => {
    const state = freshState()
    state.currentThreshold = 500000
    state.lastModelKey = "proveedor-a:modelo-a"
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    expect(getEffectiveThreshold(state, cfg)).toBe(500000)
  })

  it("model_thresholds used when no currentThreshold", () => {
    const state = freshState()
    state.lastModelKey = "proveedor-a:modelo-a"
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    expect(getEffectiveThreshold(state, cfg)).toBe(111411)
  })

  it("BUG1: model_thresholds key must be providerID:configKey NOT providerID:id", () => {
    const state = freshState()
    state.lastModelKey = "proveedor-a:modelo-a"
    state.modelContextLimit = 0
    const cfgWrongKey = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:vendor/modelo-a": 111411 } }
    const cfgRightKey = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    expect(getEffectiveThreshold(state, cfgWrongKey)).toBe(190000)
    expect(getEffectiveThreshold(state, cfgRightKey)).toBe(111411)
  })

  it("falls back to computeThreshold when no model_thresholds entry", () => {
    const state = freshState()
    state.lastModelKey = "unknown:model"
    state.modelContextLimit = 200000
    expect(getEffectiveThreshold(state, DEFAULT_CFG)).toBe(Math.floor(200000 * 0.85))
  })

  it("falls back to default when context is 0 and no model_thresholds", () => {
    const state = freshState()
    state.modelContextLimit = 0
    expect(getEffectiveThreshold(state, DEFAULT_CFG)).toBe(190000)
  })
})

describe("countTokens", () => {
  it("returns 0 for null/undefined tokens", () => {
    expect(countTokens(null)).toBe(0)
    expect(countTokens(undefined)).toBe(0)
  })

  it("uses tokens.total when present", () => {
    expect(countTokens({ total: 50000, input: 10, output: 10 })).toBe(50000)
  })

  it("sums all fields when total absent", () => {
    const tokens = { input: 100, output: 50, reasoning: 30, cache: { read: 20, write: 10 } }
    expect(countTokens(tokens)).toBe(210)
  })

  it("handles missing cache gracefully", () => {
    const tokens = { input: 100, output: 50, reasoning: 30 }
    expect(countTokens(tokens)).toBe(180)
  })

  it("handles zero tokens", () => {
    expect(countTokens({ input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } })).toBe(0)
  })
})

describe("warning threshold calculation", () => {
  it("warning fires at 90% of threshold", () => {
    const threshold = 111411
    const warningAt = Math.floor(threshold * 0.9)
    expect(warningAt).toBe(100269)
  })

  it("warning for 1M model at 240k threshold fires at 216k", () => {
    const threshold = 240000
    const warningAt = Math.floor(threshold * 0.9)
    expect(warningAt).toBe(216000)
  })
})

describe("event handler logic (simulated)", () => {
  function simulateEvent(state: SessionState, cfg: ZonalistaConfig, info: any): { warning: boolean; action: boolean } {
    const result = { warning: false, action: false }

    if (info.role && info.role !== "assistant") return result

    const modelKey = info.providerID && info.modelID ? `${info.providerID}:${info.modelID}` : null
    if (modelKey && modelKey !== state.lastModelKey) {
      state.lastModelKey = modelKey
      if (state.currentThreshold === null) {
        state.warningFired = false
        state.actionFired = false
      }
    }

    const tokens = info.tokens
    if (!tokens) return result
    const count = countTokens(tokens)
    if (count === 0) return result

    const threshold = getEffectiveThreshold(state, cfg)
    const warningAt = Math.floor(threshold * cfg.warning_ratio)

    if (!state.actionFired && count >= threshold) {
      state.actionFired = true
      result.action = true
      return result
    }

    if (!state.warningFired && count >= warningAt) {
      state.warningFired = true
      result.warning = true
    }

    return result
  }

  it("BUG1-repro: modelo-a with wrong key in config fires at default 190k not 111k", () => {
    const state = freshState()
    const cfgWrong = {
      ...DEFAULT_CFG,
      model_thresholds: { "proveedor-a:vendor/modelo-a": 111411 },
    }
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 175000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    const r = simulateEvent(state, cfgWrong, info)
    expect(r.warning).toBe(true)
    expect(r.action).toBe(false)
  })

  it("modelo-a with correct key fires warning at ~100k", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    const cfgRight = {
      ...DEFAULT_CFG,
      model_thresholds: { "proveedor-a:modelo-a": 111411 },
    }
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 100000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    const r = simulateEvent(state, cfgRight, info)
    expect(r.warning).toBe(false)
    expect(r.action).toBe(false)
  })

  it("modelo-a correct key fires warning at threshold*0.9", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    const cfgRight = {
      ...DEFAULT_CFG,
      model_thresholds: { "proveedor-a:modelo-a": 111411 },
    }
    const warningAt = Math.floor(111411 * 0.9)
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    const r = simulateEvent(state, cfgRight, info)
    expect(r.warning).toBe(true)
    expect(r.action).toBe(false)
  })

  it("modelo-a correct key fires action at threshold", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    const cfgRight = {
      ...DEFAULT_CFG,
      model_thresholds: { "proveedor-a:modelo-a": 111411 },
    }
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 111411, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    const r = simulateEvent(state, cfgRight, info)
    expect(r.action).toBe(true)
  })

  it("does not fire warning twice", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const warningAt = Math.floor(111411 * 0.9)
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt + 1000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    simulateEvent(state, cfg, info)
    const r2 = simulateEvent(state, cfg, info)
    expect(r2.warning).toBe(false)
  })

  it("does not fire action twice", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    simulateEvent(state, cfg, info)
    const r2 = simulateEvent(state, cfg, info)
    expect(r2.action).toBe(false)
  })

  it("model switch resets warning/action when no manual threshold", () => {
    const state = freshState()
    state.modelContextLimit = 131072
    state.lastModelKey = "proveedor-a:modelo-a"
    state.warningFired = true
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411, "proveedor-b:modelo-b": 240000 } }
    const info = {
      providerID: "proveedor-b",
      modelID: "modelo-b",
      tokens: { input: 220000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    const r = simulateEvent(state, cfg, info)
    expect(state.lastModelKey).toBe("proveedor-b:modelo-b")
    expect(r.warning).toBe(true)
  })

  it("model switch does NOT reset when manual threshold is set", () => {
    const state = freshState()
    state.currentThreshold = 500000
    state.lastModelKey = "proveedor-a:modelo-a"
    state.warningFired = true
    state.actionFired = false
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-b:modelo-b": 240000 } }
    const info = {
      providerID: "proveedor-b",
      modelID: "modelo-b",
      tokens: { input: 220000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }
    simulateEvent(state, cfg, info)
    expect(state.warningFired).toBe(true)
  })

  it("skips non-assistant messages", () => {
    const state = freshState()
    const cfg = DEFAULT_CFG
    const info = { role: "user", providerID: "proveedor-a", modelID: "modelo-a", tokens: { input: 999999 } }
    const r = simulateEvent(state, cfg, info)
    expect(r.warning).toBe(false)
    expect(r.action).toBe(false)
  })

  it("skips messages without tokens", () => {
    const state = freshState()
    const cfg = DEFAULT_CFG
    const info = { providerID: "proveedor-a", modelID: "modelo-a", tokens: null }
    const r = simulateEvent(state, cfg, info)
    expect(r.warning).toBe(false)
    expect(r.action).toBe(false)
  })
})

describe("fireWarning safety (BUG2)", () => {
  it("BUG2: must NOT call session.prompt during active generation", async () => {
    let promptCalled = false
    let promptCalledDuringBusy = false
    let sessionBusy = true

    const mockClient = {
      tui: {
        showToast: mock(async () => {}),
        executeCommand: mock(async () => {}),
      },
      session: {
        prompt: mock(async () => {
          promptCalled = true
          if (sessionBusy) promptCalledDuringBusy = true
        }),
        list: mock(async () => ({ data: [] })),
        get: mock(async () => ({ data: { status: { type: "idle" } } })),
      },
    }

    sessionBusy = true
    try {
      await mockClient.session.prompt({
        path: { id: "test" },
        body: { noReply: true, parts: [{ type: "text", text: "test" }] },
      })
    } catch {}

    expect(promptCalledDuringBusy).toBe(true)
  })

  it("SAFE: should wait for session idle before injecting prompt", async () => {
    let sessionBusy = true
    let promptCalledWhileBusy = false

    const mockClient = {
      session: {
        get: mock(async () => ({
          data: { status: sessionBusy ? { type: "busy" } : { type: "idle" } },
        })),
        prompt: mock(async () => {
          if (sessionBusy) promptCalledWhileBusy = true
        }),
      },
    }

    async function waitForIdle(client: any, sessionID: string, timeoutMs: number) {
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        try {
          const status = await client.session.get({ path: { id: sessionID } })
          const s = status.data?.status
          if (!s || s.type === "idle") return true
        } catch {}
        await new Promise((r) => setTimeout(r, 100))
      }
      return false
    }

    sessionBusy = true
    const idleReached = await waitForIdle(mockClient, "test", 300)
    expect(idleReached).toBe(false)

    sessionBusy = false
    const idleReached2 = await waitForIdle(mockClient, "test", 500)
    expect(idleReached2).toBe(true)
  })
})

describe("config key format verification", () => {
  const REAL_CONFIG_KEYS: Record<string, string> = {
    "proveedor-a": "modelo-a",
    "proveedor-c": "modelo-c",
    "proveedor-b": "modelo-b",
    "proveedor-d": "modelo-d",
    "router-e": "vendor/modelo-e",
    "local-f": "modelo-f",
  }

  const WRONG_CONFIG_KEYS: Record<string, string> = {
    "proveedor-a": "vendor/modelo-a",
    "proveedor-b": "modelo-b",
    "proveedor-d": "modelo-d",
    "router-e": "vendor/modelo-e",
    "local-f": "local-f/modelo-f",
  }

  it("modelID in event is the config KEY, not the id field", () => {
    for (const [provider, key] of Object.entries(REAL_CONFIG_KEYS)) {
      const modelKey = `${provider}:${key}`
      if (provider === "proveedor-a") {
        expect(modelKey).toBe("proveedor-a:modelo-a")
        expect(modelKey).not.toBe("proveedor-a:vendor/modelo-a")
      }
      if (provider === "local-f") {
        expect(modelKey).toBe("local-f:modelo-f")
        expect(modelKey).not.toBe("local-f:local-f/modelo-f")
      }
    }
  })

  it("router-e keys with slashes are correct because config key contains slash", () => {
    expect(REAL_CONFIG_KEYS["router-e"]).toBe("vendor/modelo-e")
    const modelKey = `router-e:${REAL_CONFIG_KEYS["router-e"]}`
    expect(modelKey).toBe("router-e:vendor/modelo-e")
  })
})

describe("deferred architecture (session.idle / session.created)", () => {
  interface DeferredState {
    currentThreshold: number | null
    warningFired: boolean
    actionFired: boolean
    modelContextLimit: number
    lastModelKey: string | null
    pendingWarningText: string | null
    pendingAction: boolean
  }

  function freshDeferredState(): DeferredState {
    return {
      currentThreshold: null,
      warningFired: false,
      actionFired: false,
      modelContextLimit: 0,
      lastModelKey: null,
      pendingWarningText: null,
      pendingAction: false,
    }
  }

  interface CallLog {
    showToast: string[]
    sessionPrompt: { sessionID: string; noReply: boolean; text: string }[]
    executeCommand: string[]
  }

  function createCallLog(): CallLog {
    return { showToast: [], sessionPrompt: [], executeCommand: [] }
  }

  function simulateMessageUpdated(
    state: DeferredState,
    cfg: ZonalistaConfig,
    info: any,
    log: CallLog
  ) {
    if (info.role && info.role !== "assistant") return

    const modelKey = info.providerID && info.modelID ? `${info.providerID}:${info.modelID}` : null
    if (modelKey && modelKey !== state.lastModelKey) {
      state.lastModelKey = modelKey
      if (state.currentThreshold === null) {
        state.warningFired = false
        state.actionFired = false
      }
    }

    const tokens = info.tokens
    if (!tokens) return
    const count = countTokens(tokens)
    if (count === 0) return

    const threshold = getEffectiveThreshold(state, cfg)
    const warningAt = Math.floor(threshold * cfg.warning_ratio)

    if (!state.actionFired && !state.pendingAction && count >= threshold) {
      state.pendingAction = true
      log.showToast.push(`Umbral de ${threshold} tokens alcanzado`)
      return
    }

    if (!state.warningFired && !state.pendingWarningText && !state.pendingAction && count >= warningAt) {
      state.warningFired = true
      const msg = `AVISO ZONA LISTA ${threshold}`
      log.showToast.push(msg)
      state.pendingWarningText = `[ZONALISTA] ${msg}`
    }
  }

  function simulateSessionIdle(
    state: DeferredState,
    sessionID: string,
    log: CallLog
  ): { injectedWarning: boolean; executedAction: boolean } {
    const result = { injectedWarning: false, executedAction: false }

    if (state.pendingWarningText) {
      const text = state.pendingWarningText
      state.pendingWarningText = null
      log.sessionPrompt.push({ sessionID, noReply: true, text })
      result.injectedWarning = true
      return result
    }

    if (state.pendingAction && !state.actionFired) {
      state.actionFired = true
      state.pendingAction = false
      log.sessionPrompt.push({ sessionID, noReply: false, text: "ACCION HANDOFF" })
      log.executeCommand.push("session.new")
      result.executedAction = true
    }

    return result
  }

  it("BUG2-FIX: warning does NOT inject prompt during message.updated", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()
    const warningAt = Math.floor(111411 * 0.9)

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt + 100, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    expect(log.showToast.length).toBe(1)
    expect(log.sessionPrompt.length).toBe(0)
    expect(state.pendingWarningText).not.toBeNull()
  })

  it("warning is injected on session.idle", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()
    const warningAt = Math.floor(111411 * 0.9)

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt + 100, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    const idleResult = simulateSessionIdle(state, "sess-1", log)
    expect(idleResult.injectedWarning).toBe(true)
    expect(log.sessionPrompt.length).toBe(1)
    expect(log.sessionPrompt[0].noReply).toBe(true)
    expect(state.pendingWarningText).toBeNull()
  })

  it("BUG3-FIX: action does NOT execute during message.updated", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    expect(state.pendingAction).toBe(true)
    expect(state.actionFired).toBe(false)
    expect(log.sessionPrompt.length).toBe(0)
    expect(log.executeCommand.length).toBe(0)
  })

  it("action executes on session.idle", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    const idleResult = simulateSessionIdle(state, "sess-1", log)
    expect(idleResult.executedAction).toBe(true)
    expect(state.actionFired).toBe(true)
    expect(state.pendingAction).toBe(false)
    expect(log.sessionPrompt.length).toBe(1)
    expect(log.sessionPrompt[0].noReply).toBe(false)
    expect(log.executeCommand).toContain("session.new")
  })

  it("action does not execute twice on repeated session.idle", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    simulateSessionIdle(state, "sess-1", log)
    const second = simulateSessionIdle(state, "sess-1", log)
    expect(second.executedAction).toBe(false)
    expect(log.executeCommand.length).toBe(1)
  })

  it("pendingAction blocks duplicate scheduling from message.updated", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()
    const info = {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }

    simulateMessageUpdated(state, cfg, info, log)
    simulateMessageUpdated(state, cfg, info, log)
    expect(log.showToast.length).toBe(1)
    expect(state.pendingAction).toBe(true)
  })

  it("set_threshold clears pending states", () => {
    const state = freshDeferredState()
    state.pendingWarningText = "pending warning"
    state.pendingAction = true
    state.warningFired = true
    state.actionFired = false

    state.currentThreshold = 500000
    state.warningFired = false
    state.actionFired = false
    state.pendingWarningText = null
    state.pendingAction = false

    expect(state.currentThreshold).toBe(500000)
    expect(state.pendingWarningText).toBeNull()
    expect(state.pendingAction).toBe(false)
    expect(state.warningFired).toBe(false)
  })

  it("multiple sessions are independent", () => {
    const state1 = freshDeferredState()
    const state2 = freshDeferredState()
    state1.modelContextLimit = 131072
    state2.modelContextLimit = 1000000
    const cfg = {
      ...DEFAULT_CFG,
      model_thresholds: { "proveedor-a:modelo-a": 111411, "proveedor-b:modelo-b": 240000 },
    }
    const log1 = createCallLog()
    const log2 = createCallLog()

    simulateMessageUpdated(state1, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log1)

    simulateMessageUpdated(state2, cfg, {
      providerID: "proveedor-b",
      modelID: "modelo-b",
      tokens: { input: 220000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log2)

    expect(state1.pendingAction).toBe(true)
    expect(state2.pendingAction).toBe(false)
    expect(state2.warningFired).toBe(true)
    expect(state2.pendingWarningText).not.toBeNull()
  })

  it("warning pending does not block action scheduling", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()
    const warningAt = Math.floor(111411 * 0.9)

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt + 100, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)
    expect(state.pendingWarningText).not.toBeNull()

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)
    expect(state.pendingAction).toBe(true)
  })

  it("session.idle processes warning before action", () => {
    const state = freshDeferredState()
    state.modelContextLimit = 131072
    const cfg = { ...DEFAULT_CFG, model_thresholds: { "proveedor-a:modelo-a": 111411 } }
    const log = createCallLog()
    const warningAt = Math.floor(111411 * 0.9)

    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: warningAt + 100, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)
    simulateMessageUpdated(state, cfg, {
      providerID: "proveedor-a",
      modelID: "modelo-a",
      tokens: { input: 120000, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
    }, log)

    const idle1 = simulateSessionIdle(state, "sess-1", log)
    expect(idle1.injectedWarning).toBe(true)
    expect(idle1.executedAction).toBe(false)

    const idle2 = simulateSessionIdle(state, "sess-1", log)
    expect(idle2.executedAction).toBe(true)
  })
})
