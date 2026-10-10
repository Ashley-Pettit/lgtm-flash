import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Flash } from '../types'
import { shipSvg } from './ship-svg'

const flash = atom({ plugin: 'lgtm-flash', key: 'flash' } as const, null as Flash)

const CODE_CHANGE = /^(Edit|MultiEdit|Write|NotebookEdit)$/
// The desktop scene (ship-svg.ts) ends on its close-up at 6.2s; the band closes right there.
const SHOW_MS = 6200
// What every voyage claims to have shipped; /ship 120 claims 120 instead.
const SHIP_LINES = 40000

type Change = {
  file_path?: string
  notebook_path?: string
}

let hide: { cancel: () => void } | undefined

// Starts a voyage above the prompt, and takes the band back once it's over.
const launch = async ($: EngineInterface, file: string, lines: number) => {
  const at = await $.clock.now()
  await update($, flash, () => ({ file, lines, at }))
  hide?.cancel()
  hide = $.clock.after(SHOW_MS, () => {
    void update($, flash, f => (f !== null && f.at === at ? null : f))
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({
      name: 'ship',
      description: 'Ship it to PROD: launch the LGTM Lines ship',
      argumentHint: '[lines]',
    })
    return started
  })

  // /ship launches the voyage on demand; /ship 120 claims 120 lines.
  on('command.run', { command: 'ship' }, async ($, e) => {
    const n = Number(e.args.trim())
    const lines = e.args.trim() !== '' && Number.isFinite(n) && n >= 0 ? Math.round(n) : SHIP_LINES
    await launch($, '', lines)
    return { text: 'Looks good to me.' }
  })

  on('tool.call', { tool: CODE_CHANGE }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError === true) return ran

    const input = e as Change
    const path = input.file_path ?? input.notebook_path ?? ''
    const file = path.split(/[\\/]/).pop() ?? ''
    await launch($, file, SHIP_LINES)
    return ran
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Whatever else draws in the band (another mod's row, a status line) stays
    // on screen under the ship while it plays.
    const below = await next(e)
    const f = await read($, flash)
    if (e.props.hasSurvey || f === null) return below

    const elements = $.ui.resolve(e)
    const { Box } = elements

    // The terminal gets the ship in text characters. Chosen by the surface, not
    // by which elements the table lists: a table can carry an element its
    // surface draws as nothing.
    if (e.surface === 'terminal') {
      if (!('Client' in elements)) return below
      const { Client } = elements

      // The full ship needs 18 rows; a shorter band gets it without the grey tier.
      const tall = e.props.maxRows >= 18
      // A new key per flash starts the voyage from the first frame.
      return (
        <Box flexDirection="column">
          <Client
            key={`lgtm-${f.at}`}
            module="./fly.tsx"
            props={{ file: f.file, lines: f.lines, tall }}
            width="100%"
            height={tall ? 18 : 14}
          />
          {below}
        </Box>
      )
    }

    // Every other surface draws real vector art: the animated SVG ship.
    if (!('Svg' in elements)) return below
    const { Svg } = elements
    // Drawn as an image, which fills the band's width; an interactive frame is
    // a fixed 150px tall and shrinks the scene to fit. The voyage stamp makes
    // each flash a new document, so its animation starts from the first frame.
    return (
      <Box flexDirection="column">
        <Svg
          key={`lgtm-svg-${f.at}`}
          source={shipSvg(f.lines).replace('<svg ', `<svg data-voyage="${f.at}" `)}
          alt={`LGTM: the LGTM Lines container ship sails past, ${f.lines} lines shipped`}
        />
        {below}
      </Box>
    )
  })
}
