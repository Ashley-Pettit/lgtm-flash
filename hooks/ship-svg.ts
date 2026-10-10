// The LGTM Lines ship as an animated SVG, for surfaces that draw Svg
// (the desktop app). An eleven-second scene, shot like the video: in a wide
// shot the ship sails in fast while the L, G, T and M containers slam onto
// its moving deck (the camera shakes on each), the ship stops, the camera
// zooms in on its bridge and containers, and the words Looks, Good, To and Me
// appear above them in turn, each drawing a glowing line down to its own
// letter. Animated with SMIL, which an interactive Svg runs.

const W = 1000
const H = 340
const SEA = 318 // waterline
const SCALE = 0.8 // the ship's drawing scale
export const DUR = 6.2 // seconds: the scene ends on the close-up

// The timeline, in seconds.
const ARRIVE = 2.9 // the ship comes to a stop
const DROPS = [0.85, 1.3, 1.75, 2.2] // L, G, T and M start falling, the ship still moving
const FALL = 0.6 // each drop, bounce included
const LAND = 0.36 // when, within a drop, the container hits the deck
const ZOOM_IN = 2.9 // the camera pushes in on the bridge and containers
const ZOOM_TIME = 0.6
const WORDS = [3.55, 3.85, 4.15, 4.45] // when Looks, Good, To and Me appear

const X0 = 215 // where the ship stops: centred
// The close-up frame, in stage units: the bridge, the containers and the
// words above them, cropped like the video's shot.
const VIEW = { x: X0 - 10, y: 32, w: 660 }
const ZOOM = W / VIEW.w

const commas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const s = (t: number) => `${t.toFixed(2)}s`

// Deterministic scatter, so every voyage has the same sky.
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

// The stage reaches PAD past each side of the action, so on a band wider than
// the scene's shape the sky and sea still run edge to edge.
const PAD = 260

const stars = () =>
  Array.from({ length: 120 }, (_, i) => {
    const x = Math.round(-PAD + rand(i) * (W + 2 * PAD))
    const y = Math.round(34 + rand(i + 100) * (SEA - 50))
    const r = (0.6 + rand(i + 200) * 1.1).toFixed(1)
    const twinkle =
      i % 3 === 0
        ? `<animate attributeName="opacity" values="0.9;0.2;0.9" dur="${(1.5 + rand(i + 300) * 2).toFixed(1)}s" repeatCount="indefinite"/>`
        : ''
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#c9d3dc" opacity="0.7">${twinkle}</circle>`
  }).join('')

const windows = () => {
  const golds = ['#f2b705', '#c99a2e', '#8a6d2a', '#262c33']
  let out = ''
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const i = row * 5 + col
      const fill = golds[Math.floor(rand(i + 400) * golds.length)]
      const flicker =
        i % 4 === 1
          ? `<animate attributeName="fill" values="${fill};#262c33;${fill}" dur="${(1 + rand(i) * 2).toFixed(1)}s" repeatCount="indefinite" calcMode="discrete"/>`
          : ''
      out += `<rect x="${44 + col * 19}" y="${-186 + row * 27}" width="12" height="12" fill="${fill}">${flicker}</rect>`
    }
  }
  return out
}

// The four LGTM containers. Each waits high above the deck, then drops on
// its cue with a bounce and a puff of dust; once aboard it flashes dark
// green, its slab-serif letter glowing.
const lgtmTier = () =>
  ['L', 'G', 'T', 'M']
    .map((letter, i) => {
      const x = 182 + i * 128
      const start = DROPS[i] ?? 0
      const ribs = Array.from({ length: 19 }, (_, k) => {
        const rx = x + 6 + k * 6.3
        return `<line x1="${rx.toFixed(1)}" y1="-201" x2="${rx.toFixed(1)}" y2="-141" stroke="#0f6b33" stroke-width="1" opacity="0.55"/>`
      }).join('')
      const container = `
        <rect x="${x}" y="-206" width="122" height="70" fill="#0b5d2a">
          <animate attributeName="fill" values="#0b5d2a;#04331a" dur="0.4s" repeatCount="indefinite" calcMode="discrete"/>
        </rect>
        ${ribs}
        <rect x="${x}" y="-206" width="122" height="70" fill="none" stroke="#2ef07a" stroke-width="2.5" filter="url(#glow)"/>
        <text x="${x + 61}" y="-153" text-anchor="middle" font-family="Rockwell, 'Roboto Slab', 'Courier New', Georgia, serif" font-weight="900" font-size="58" fill="#5dff9d" filter="url(#glow)">${letter}</text>`
      const landAt = start + FALL * LAND
      const puff = (cx: number, dir: number) => `
        <ellipse cx="${cx}" cy="-138" rx="2" ry="4" fill="#9aa8b6" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" begin="${s(landAt)}" dur="0.5s" fill="freeze"/>
          <animate attributeName="rx" values="2;20" begin="${s(landAt)}" dur="0.5s" fill="freeze"/>
          <animate attributeName="cx" values="${cx};${cx + dir * 22}" begin="${s(landAt)}" dur="0.5s" fill="freeze"/>
        </ellipse>`
      return `
      <g transform="translate(0 -900)">
        <animateTransform attributeName="transform" type="translate" values="0 -520; 0 8; 0 -14; 0 0" keyTimes="0;${LAND};0.7;1" calcMode="spline" keySplines="0.55 0 1 0.45; 0 0.5 0.5 1; 0.5 0 1 0.5" begin="${s(start)}" dur="${s(FALL)}" fill="freeze"/>
        ${container}
      </g>
      ${puff(x + 4, -1)}${puff(x + 118, 1)}`
    })
    .join('')

const lowerTier = () =>
  Array.from({ length: 9 }, (_, i) => {
    const x = 176 + i * 57.5
    const ribs = Array.from({ length: 6 }, (_, k) => {
      const rx = x + 8 + k * 8
      return `<line x1="${rx}" y1="-129" x2="${rx}" y2="-87" stroke="#2a323b" stroke-width="1"/>`
    }).join('')
    return `<rect x="${x}" y="-134" width="55" height="52" fill="#11161d" stroke="#4a545e" stroke-width="1.5"/>${ribs}`
  }).join('')

const rail = () =>
  Array.from({ length: 44 }, (_, i) => `<rect x="${152 + i * 12.5}" y="-80" width="8" height="7" fill="none" stroke="#8a96a3" stroke-width="1"/>`).join('')

const plating = () =>
  [-58, -48, -38, -28, -18, -10].map(y => `<line x1="12" y1="${y}" x2="${660 + y * 0.4}" y2="${y}" stroke="#1f2a35" stroke-width="1"/>`).join('')

// LOOKS GOOD TO ME: each word appears above its container, its first letter
// green like the container's, and draws a glowing line down to it; the
// container flashes as the line lands.
const PHRASE = ['Looks', 'Good', 'To', 'Me']
const phrase = () =>
  PHRASE.map((word, i) => {
    const t = WORDS[i] ?? 4
    const box = 182 + i * 128
    const cx = box + 61
    const half = 82 // half the reveal window, wide enough for LOOKS
    return `
  <!-- the word: wide-tracked capitals, revealed left to right behind a glowing scan cursor -->
  <clipPath id="wclip${i}"><rect x="${cx - half}" y="-330" width="0" height="56">
    <animate attributeName="width" values="0;${half * 2}" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.2 1" begin="${s(t)}" dur="0.3s" fill="freeze"/>
  </rect></clipPath>
  <g clip-path="url(#wclip${i})">
    <text x="${cx + 3}" y="-290" text-anchor="middle" font-family="'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif" font-weight="600" font-size="26" letter-spacing="4" fill="url(#wordgrad)" filter="url(#wordglow)"><tspan fill="#2ef07a" font-weight="800">${word[0]!.toUpperCase()}</tspan>${word.slice(1).toUpperCase()}</text>
  </g>
  <rect x="${cx - half}" y="-322" width="2.2" height="40" rx="1.1" fill="#bff7ff" opacity="0" filter="url(#glow)">
    <animate attributeName="x" values="${cx - half};${cx + half}" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.2 1" begin="${s(t)}" dur="0.3s" fill="freeze"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" begin="${s(t)}" dur="0.34s" fill="freeze"/>
  </rect>
  <!-- the connector: a fine line drawing down, a spark running ahead of it -->
  <rect x="${cx - 0.8}" y="-280" width="1.6" height="0" fill="#2ef07a" opacity="0.85" filter="url(#glow)">
    <animate attributeName="height" values="0;68" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" begin="${s(t + 0.24)}" dur="0.22s" fill="freeze"/>
  </rect>
  <circle cx="${cx}" cy="-280" r="2.6" fill="#eafff2" opacity="0" filter="url(#glow)">
    <animate attributeName="cy" values="-280;-212" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" begin="${s(t + 0.24)}" dur="0.22s" fill="freeze"/>
    <animate attributeName="opacity" values="0;1" begin="${s(t + 0.24)}" dur="0.05s" fill="freeze"/>
  </circle>
  <rect x="${box}" y="-206" width="122" height="70" fill="#eafff2" opacity="0">
    <animate attributeName="opacity" values="0;0.4;0" begin="${s(t + 0.46)}" dur="0.35s" fill="freeze"/>
  </rect>`
  }).join('')

const ship = () => `
  <!-- smoke drifting back from the funnel -->
  ${[0, 1, 2].map(k => `<circle cx="78" cy="-266" r="6" fill="url(#smoke)" opacity="0">
    <animate attributeName="cy" values="-266;-318" dur="2.4s" begin="${(k * 0.8).toFixed(1)}s" repeatCount="indefinite"/>
    <animate attributeName="cx" values="78;24" dur="2.4s" begin="${(k * 0.8).toFixed(1)}s" repeatCount="indefinite"/>
    <animate attributeName="r" values="6;17" dur="2.4s" begin="${(k * 0.8).toFixed(1)}s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" begin="${(k * 0.8).toFixed(1)}s" repeatCount="indefinite"/>
  </circle>`).join('')}

  <!-- foam at the bow while under way -->
  <g>
    <animate attributeName="opacity" values="1;0" begin="${s(ARRIVE - 0.3)}" dur="0.6s" fill="freeze"/>
    ${[0, 1, 2].map(k => `<ellipse cx="${652 - k * 14}" cy="${-3 + k * 1.5}" rx="${16 - k * 3}" ry="2.6" fill="#e8f4ff" opacity="0.5">
      <animate attributeName="rx" values="${16 - k * 3};${22 - k * 3};${16 - k * 3}" dur="${0.5 + k * 0.15}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.55;0.2;0.55" dur="${0.5 + k * 0.15}s" repeatCount="indefinite"/>
    </ellipse>`).join('')}
  </g>

  <!-- funnel and mast -->
  <polygon points="56,-262 98,-262 106,-216 48,-216" fill="#e0a526" stroke="#e6edf3" stroke-width="2"/>
  <rect x="54" y="-252" width="46" height="9" fill="#2ef07a"/>
  <line x1="128" y1="-216" x2="128" y2="-270" stroke="#8a96a3" stroke-width="2"/>
  <circle cx="128" cy="-272" r="4" fill="#ff4d4d">
    <animate attributeName="opacity" values="1;0.15;1" dur="1s" repeatCount="indefinite"/>
  </circle>

  <!-- bridge -->
  <rect x="14" y="-216" width="142" height="16" fill="#12171e" stroke="#e6edf3" stroke-width="2"/>
  <rect x="30" y="-200" width="112" height="128" fill="#12171e" stroke="#e6edf3" stroke-width="2"/>
  ${windows()}

  <!-- containers: the grey tier, then the LGTM ones dropping on -->
  ${lowerTier()}
  ${lgtmTier()}
  ${phrase()}

  <!-- deck rail and hull with a raked bow -->
  ${rail()}
  <path d="M 4,-72 L 712,-72 Q 690,-28 640,0 L 12,0 Z" fill="#0f141a" stroke="#e6edf3" stroke-width="2.5"/>
  ${plating()}
  <text x="330" y="-38" text-anchor="middle" font-family="'Courier New', Consolas, monospace" font-size="15" letter-spacing="6" fill="#b8c4cf">LGTM LINES</text>

  <!-- the glow reflected in the water, once the containers are aboard -->
  <rect x="180" y="4" width="510" height="14" fill="url(#reflect)" opacity="0">
    <animate attributeName="opacity" values="0;0.8" begin="${s((DROPS[3] ?? 4.4) + 0.4)}" dur="0.4s" fill="freeze"/>
  </rect>`

// Each landing pushes the ship down a touch.
const landings = DROPS.map(t => s(t + FALL * LAND)).join(';')

export const shipSvg = (lines: number) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-PAD} 0 ${W + 2 * PAD} ${H}" width="${(W + 2 * PAD) * 3}" height="${H * 3}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="bigglow" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="smoke"><stop offset="0" stop-color="#c9d3dc" stop-opacity="0.55"/><stop offset="0.6" stop-color="#9aa8b6" stop-opacity="0.25"/><stop offset="1" stop-color="#9aa8b6" stop-opacity="0"/></radialGradient>
    <linearGradient id="wordgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#cfefff"/><stop offset="1" stop-color="#5ec4ff"/></linearGradient>
    <filter id="wordglow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/><feFlood flood-color="#5ec4ff" flood-opacity="0.45"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="softwhite" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.45 0" result="halo"/>
      <feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2ef07a" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#2ef07a" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="abovedeck"><rect x="0" y="-200" width="${W}" height="${SEA - 165 - -200}"/></clipPath>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1217"/>
      <stop offset="1" stop-color="#161c23"/>
    </linearGradient>
  </defs>
  <g>
    <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze"/>
    <animate attributeName="opacity" values="1;0" begin="${s(DUR - 0.35)}" dur="0.35s" fill="freeze"/>

  <rect x="${-PAD}" width="${W + 2 * PAD}" height="${H}" fill="url(#sky)"/>
  ${stars()}

  <!-- header strip, as in the video, spread over the full stage so its text can be large; it gives way to the close-up -->
  <g>
    <animate attributeName="opacity" values="1;0" begin="${s(ZOOM_IN)}" dur="0.4s" fill="freeze"/>
  <text x="${-PAD + 24}" y="34" font-family="'Cascadia Mono', Consolas, 'Courier New', monospace" font-size="30" font-weight="700" letter-spacing="3" fill="#d9e1e8">L-G-T-M  ·  CHORUS 1  ·  SHIPPING</text>
  <text x="${W + PAD - 24}" y="34" text-anchor="end" font-family="'Cascadia Mono', Consolas, 'Courier New', monospace" font-size="30" font-weight="700" letter-spacing="3" fill="#d9e1e8"><tspan fill="#3dff8a">+${commas(lines)} LINES</tspan> THAT I DIDN'T READ</text>
  <line x1="${-PAD + 24}" y1="48" x2="${W + PAD - 24}" y2="48" stroke="#3a4654" stroke-width="1.5"/>
  </g>

  <!-- the camera: pushes in for the close-up, then pulls back out -->
  <g>
    <animateTransform attributeName="transform" type="scale" values="1; ${ZOOM.toFixed(4)}" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.25 1" begin="${s(ZOOM_IN)}" dur="${s(ZOOM_TIME)}" fill="freeze"/>
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; ${-VIEW.x} ${-VIEW.y}" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.25 1" begin="${s(ZOOM_IN)}" dur="${s(ZOOM_TIME)}" fill="freeze"/>

  <!-- the camera shakes as each container slams down -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="0 0; -5 4; 4 -3; -3 2; 2 -1; 0 0" dur="0.3s" begin="${landings}"/>

  <!-- the sea: dark water and drifting swell lines -->
  <rect x="${-PAD * 2}" y="${SEA}" width="${W + 4 * PAD}" height="${H - SEA}" fill="#0a0f14"/>
  ${[0, 1, 2].map(k => `<line x1="${-PAD * 2}" y1="${SEA + 8 + k * 9}" x2="${W + 2 * PAD}" y2="${SEA + 8 + k * 9}" stroke="#27405a" stroke-width="1.5" stroke-dasharray="${30 + k * 12} ${18 + k * 6}">
    <animate attributeName="stroke-dashoffset" values="0;-${96 + k * 36}" dur="${2 + k}s" repeatCount="indefinite"/>
  </line>`).join('')}

  <!-- the ship sails in as its cargo lands, stops for its close-up, and sails off -->
  <g>
    <animateTransform attributeName="transform" type="translate" values="-620 0; ${X0} 0; ${X0} 0" keyTimes="0;${(ARRIVE / DUR).toFixed(3)};1" calcMode="spline" keySplines="0.15 0.7 0.35 1; 0 0 1 1" dur="${DUR}s" fill="freeze"/>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2.5; 0 0" dur="1.8s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 5; 0 0" dur="0.3s" begin="${landings}"/>
        <g transform="translate(0 ${SEA}) scale(${SCALE})">
          <!-- wake behind the stern -->
          <path d="M -10,2 L -180,10" stroke="#a9c9de" stroke-width="2" opacity="0.6" stroke-dasharray="20 10">
            <animate attributeName="stroke-dashoffset" values="0;60" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0" begin="${s(ARRIVE - 0.3)}" dur="0.6s" fill="freeze"/>
          </path>
          ${ship()}
        </g>
      </g>
    </g>
  </g>

  </g>

  </g>
  </g>

  </g>
</svg>`
