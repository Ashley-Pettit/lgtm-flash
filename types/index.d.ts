export type Flash = { file: string; lines: number; at: number } | null

declare module 'claude-code' {
  interface PluginState {
    'lgtm-flash': { flash: Flash }
  }
}
