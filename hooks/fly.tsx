import type { ClientModule } from 'claude-code'

// The LGTM Lines container ship from the "LGTM (Looks Good to Me)" video,
// in line art: a gold funnel and a lit bridge at the stern, four green
// LGTM containers flashing dark green on a tier of grey ones, a deep hull
// with a raked bow, a radar ring behind, and the video's header strip.

const FRAME_MS = 40
const FRAMES = 150 // about 6 seconds
const FLASH_FRAMES = 5 // the containers change shade every 200ms

// Slab-serif block letters, 7 wide and 5 tall, like the video's.
const GLYPHS: Record<string, string[]> = {
  L: ['████   ', ' ██    ', ' ██    ', ' ██   █', '███████'],
  G: [' ██████', '██     ', '██  ███', '██   ██', ' ██████'],
  T: ['███████', '█ ███ █', '  ███  ', '  ███  ', ' █████ '],
  M: ['██   ██', '███ ███', '██ █ ██', '██   ██', '██   ██'],
}

const C = {
  head: '#9aa8b6',
  green: '#2ef07a',
  letter: '#6dffa8',
  fill: ['#0b5d2a', '#04331a'], // container fill flashes between these
  rib: ['#14803d', '#0b5d2a'],
  ring: '#0d4d27',
  line: '#d9e1e8', // the white line art
  grey: '#5b6670',
  greyRib: '#3a434d',
  rail: '#8a96a3',
  plating: '#1f2a35',
  name: '#b8c4cf',
  funnel: '#e0a526',
  red: '#ff4d4d',
  mast: '#8a96a3',
  windows: ['#f2b705', '#c99a2e', '#8a6d2a', '#2a2f36'],
  star: '#4a545e',
  starHi: '#c9d3dc',
  water: ['#16222d', '#1d2c39', '#24394a'],
  reflect: ['#0b5d2a', '#1fb35a'],
  wake: ['#e8f4ff', '#a9c9de', '#5f8aa5'],
  smoke: ['#8a96a3', '#6b7680', '#4a545e'],
}

type Props = { file: string; lines: number; tall: boolean }
type State = { frame: number; stop?: () => void }
type Cell = { ch: string; color?: string; bold?: boolean; bg?: string }

// The ship's layout: columns from its stern (x), rows from the top of the band.
const BOX_W = 11 // an LGTM container: border, rib, 7-wide letter, rib, border
const STACK_X = 18 // where the containers start
const STACK_W = 4 * BOX_W + 3
const SW = STACK_X + STACK_W + 6 // stern to bow tip
const TOP = 3 // roof of the bridge and top of the LGTM tier

// 18 rows tall with the grey tier and a deeper hull; 14 without.
const layout = (tall: boolean) => {
  const lower = tall ? 3 : 0
  const hullRows = tall ? 3 : 2
  const rail = TOP + 7 + lower
  const hull = rail + 1
  const water = hull + hullRows
  return { lower, hullRows, rail, hull, water, rows: water + 1 }
}

const hash = (a: number, b: number, c = 0) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const commas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// Fast in, a slow glide through the middle, fast out.
const shipX = (p: number, w: number) => {
  const u = 2 * p - 1
  const centre = Math.round((w - SW) / 2)
  return Math.round(centre + (0.7 * u * u * u + 0.3 * u) * (w / 2 + SW / 2 + 2))
}

const draw = (frame: number, w: number, props: Props): Cell[][] => {
  const L = layout(props.tall)
  const grid: Cell[][] = Array.from({ length: L.rows }, () => Array.from({ length: w }, () => ({ ch: ' ' })))
  const put = (row: number, col: number, ch: string, color?: string, bold?: boolean, bg?: string) => {
    const line = grid[row]
    if (line !== undefined && col >= 0 && col < w) line[col] = { ch, color, bold, bg }
  }
  const text = (row: number, col: number, s: string, color?: string, bold?: boolean) =>
    [...s].forEach((ch, i) => put(row, col + i, ch, color, bold))
  const clear = (row: number, from: number, to: number) => {
    for (let c = from; c <= to; c++) put(row, c, ' ')
  }

  const p = Math.min(frame / FRAMES, 1)
  const u = 2 * p - 1
  const x = shipX(p, w)
  const hang = Math.abs(u) < 0.4
  const flash = Math.floor(frame / FLASH_FRAMES) % 2
  const bowCol = (k: number) => x + SW - 1 - 2 * k // the raked bow, row k of the hull

  // Night sky: sparse stars that twinkle.
  for (let r = 1; r < L.water; r++) {
    for (let c = 0; c < w; c++) {
      if (hash(c, r) < 0.025) {
        const tw = hash(c, r, Math.floor(frame / 6))
        put(r, c, tw > 0.88 ? '✦' : '·', tw > 0.88 ? C.starHi : C.star)
      }
    }
  }

  // The radar ring behind the bow containers.
  const cx = x + STACK_X + 3 * (BOX_W + 1) + 5
  const cy = TOP + 3
  for (let a = -110; a <= 110; a += 6) {
    const rad = (a * Math.PI) / 180
    const col = Math.round(cx + Math.sin(rad) * 17)
    const row = Math.round(cy - Math.cos(rad) * 7)
    if (row >= 1 && row < L.water) put(row, col, '·', C.ring)
  }

  // Dark water with faint swell lines, the containers' glow reflected, and a wake.
  for (let c = 0; c < w; c++) {
    const k = (c + Math.floor(frame / 3)) % 7
    put(L.water, c, k < 2 ? '─' : k === 4 ? '‐' : ' ', C.water[k % 3])
  }
  for (let c = x + STACK_X; c < x + STACK_X + STACK_W; c++) {
    if ((c + Math.floor(frame / 2)) % 3 !== 0) put(L.water, c, '─', C.reflect[(c + flash) % 2])
  }
  for (let i = 1; i <= 14; i++) {
    put(L.water, x - i, i < 4 ? '═' : i < 9 ? '─' : '‐', C.wake[Math.min(2, Math.floor(i / 5))])
  }

  // The ship's silhouette hides everything behind it.
  for (let r = TOP; r < L.rail; r++) clear(r, x + STACK_X, x + STACK_X + STACK_W - 1)
  for (let r = TOP; r < L.rail; r++) clear(r, x, x + 16)
  clear(L.rail, x, bowCol(0))
  for (let k = 0; k < L.hullRows; k++) clear(L.hull + k, x, bowCol(k) + 1)

  // Smoke drifts back from the funnel.
  for (let k = 1; k <= 6; k++) {
    const col = x + 3 - k * 2 - (Math.floor(frame / 3) % 2)
    put(1 + (k % 2), col, k < 3 ? 'o' : k < 5 ? '°' : '·', C.smoke[Math.min(2, Math.floor((k - 1) / 2))])
  }

  // Funnel: gold with a green band. Mast with a blinking red light.
  text(1, x + 4, '▆▆▆▆▆', C.green)
  text(2, x + 4, '█████', C.funnel)
  put(1, x + 12, '●', Math.floor(frame / 8) % 2 === 0 ? C.red : C.grey)
  put(2, x + 12, '│', C.mast)

  // Bridge: a roof slab, an outlined block, a grid of gold windows.
  text(TOP, x, '▀'.repeat(17), C.line)
  for (let r = TOP + 1; r < L.rail; r++) {
    put(r, x + 2, '│', C.line)
    put(r, x + 14, '│', C.line)
    if ((r - TOP) % 2 === 1 && r < L.rail - 1) {
      for (let c = 4; c <= 12; c += 2) {
        const shade = Math.floor(hash(c, r, Math.floor(frame / 12)) * C.windows.length)
        put(r, x + c, '■', C.windows[shade])
      }
    }
  }

  // The LGTM tier: green outlines, ribbed dark green fill that flashes, bright letters.
  ;['L', 'G', 'T', 'M'].forEach((letter, i) => {
    const left = x + STACK_X + i * (BOX_W + 1)
    const fill = C.fill[flash]
    text(TOP, left, '┌' + '─'.repeat(BOX_W - 2) + '┐', C.green)
    for (let r = 0; r < 5; r++) {
      put(TOP + 1 + r, left, '│', C.green)
      put(TOP + 1 + r, left + BOX_W - 1, '│', C.green)
      const glyph = [...(GLYPHS[letter]?.[r] ?? '')]
      for (let c = 1; c < BOX_W - 1; c++) {
        // Ribs run down the strips either side of the letter, never through it.
        const rib = c === 1 || c === BOX_W - 2
        if (glyph[c - 2] === '█') put(TOP + 1 + r, left + c, '█', C.letter, true, fill)
        else put(TOP + 1 + r, left + c, rib ? '│' : ' ', C.rib[flash], false, fill)
      }
    }
    text(TOP + 6, left, '└' + '─'.repeat(BOX_W - 2) + '┘', C.green)
  })

  // The grey tier underneath.
  if (L.lower > 0) {
    for (let i = 0; i < 6; i++) {
      const left = x + STACK_X + i * 8
      const r0 = TOP + 7
      text(r0, left, '┌─────┐', C.grey)
      put(r0 + 1, left, '│', C.grey)
      text(r0 + 1, left + 1, '╎ ╎ ╎', C.greyRib)
      put(r0 + 1, left + 6, '│', C.grey)
      text(r0 + 2, left, '└─────┘', C.grey)
    }
  }

  // Deck rail of little squares, then the hull with its raked bow.
  for (let c = x; c < bowCol(0); c++) put(L.rail, c, '▫', C.rail)
  for (let k = 0; k < L.hullRows; k++) {
    const r = L.hull + k
    const end = bowCol(k)
    const edge = k === 0 || k === L.hullRows - 1
    put(r, x, k === 0 ? '┌' : k === L.hullRows - 1 ? '└' : '│', C.line)
    for (let c = x + 1; c < end; c++) put(r, c, '─', edge ? C.line : C.plating)
    put(r, end, k === L.hullRows - 1 ? '╯' : '╲', C.line)
    if (k === 0) put(r, end + 1, '╲', C.line)
  }
  const name = ' L G T M   L I N E S '
  const nameRow = L.hull + (L.hullRows === 2 ? 0 : 1)
  text(nameRow, x + Math.round((bowCol(1) - x - name.length) / 2), name, C.name, true)

  // Header strip, as in the video.
  const left = hang ? `let's ship it to ` : 'L-G-T-M  ·  CHORUS 1  ·  SHIPPING'
  text(0, 0, left, hang ? C.line : C.head, hang)
  if (hang) text(0, left.length, 'PROD', C.green, true)
  const plus = `+${commas(props.lines)} LINES`
  const right = `${plus} THAT I DIDN'T READ`
  const rx = Math.max(left.length + 6, w - right.length)
  text(0, rx, plus, C.green, true)
  text(0, rx + plus.length, right.slice(plus.length), C.head)

  return grid
}

const Ship: ClientModule<Props, State> = (props, surface) => {
  const { Box, Text } = surface.elements
  if (surface.state === undefined) {
    const stop = surface.every(FRAME_MS, () => {
      const now = surface.state ?? { frame: 0 }
      if (now.frame >= FRAMES) {
        now.stop?.()
        return
      }
      surface.setState({ ...now, frame: now.frame + 1 })
    })
    surface.setState({ frame: 0, stop })
  }

  const frame = surface.state?.frame ?? 0
  const w = surface.columns > 0 ? surface.columns : 100
  const grid = frame >= FRAMES ? [] : draw(frame, w, props)

  return (
    <Box flexDirection="column" width={w}>
      {grid.map((line, r) => {
        // One Text per run of cells that share a style.
        const runs: Cell[] = []
        for (const cell of line) {
          const last = runs[runs.length - 1]
          if (last !== undefined && last.color === cell.color && last.bold === cell.bold && last.bg === cell.bg)
            last.ch += cell.ch
          else runs.push({ ...cell })
        }
        return (
          <Box key={`r${r}`} flexDirection="row">
            {runs.map((run, i) => (
              <Text key={`c${i}`} color={run.color} backgroundColor={run.bg} bold={run.bold} wrap="truncate-end">
                {run.ch}
              </Text>
            ))}
          </Box>
        )
      })}
    </Box>
  )
}

export default Ship
