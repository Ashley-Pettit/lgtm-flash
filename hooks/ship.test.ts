import type { On, RenderElement } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

// The band as the engine hands it to a ui.render hook.
const BAND = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 24,
  bodyColumns: 100,
  scroll: { offset: 0, bodyRows: 24 },
  view: {},
}

// /lgtm as the person types it.
const SHIP = {
  command: 'lgtm',
  args: '',
  origin: { kind: 'composer' },
  presentation: { isFullscreen: false, columns: 100 },
} as const

// Stands for whatever else already draws in the band (another mod's row, a status line).
const statusRow = (on: On) =>
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return h(Text, {}, 'status row') as RenderElement
  })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: the band is left alone until a ship is launched`, async ($, on) => {
    mock.clock(on)
    statusRow(on)

    const ui = await $.ui.mount({ plugin: 'lgtm-flash', surface, component: 'AbovePrompt', props: BAND })

    expect(await ui.find({ text: 'status row' })).toBeDefined()
    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect(await ui.find({ type: 'Client' })).toBeUndefined()
  })

  test(`${surface}: /lgtm draws the ship and keeps what was already in the band`, async ($, on) => {
    mock.clock(on)
    statusRow(on)

    const ui = await $.ui.mount({ plugin: 'lgtm-flash', surface, component: 'AbovePrompt', props: BAND })
    await $.command.run(SHIP)

    // The terminal plays the text animation in a Client; every other surface draws the Svg.
    const ship = surface === 'terminal' ? 'Client' : 'Svg'
    const other = surface === 'terminal' ? 'Svg' : 'Client'
    expect(await ui.find({ type: ship })).toBeDefined()
    expect(await ui.find({ type: other })).toBeUndefined()
    expect(await ui.find({ text: 'status row' })).toBeDefined()
  })
}

test('/testship always sails the ship, and sails it again when run mid-voyage', async ($, on) => {
  const clock = mock.clock(on)
  statusRow(on)

  const ui = await $.ui.mount({ plugin: 'lgtm-flash', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  await $.command.run({ ...SHIP, command: 'testship' })
  expect(await ui.find({ type: 'Svg' })).toBeDefined()

  // Run again near the end of the first voyage: the second one gets its full time.
  await clock.advance(5000)
  await $.command.run({ ...SHIP, command: 'testship' })
  await clock.advance(5000)
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  await clock.advance(2000)
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
})

test('the ship leaves the band when its voyage is over', async ($, on) => {
  const clock = mock.clock(on)
  statusRow(on)

  const ui = await $.ui.mount({ plugin: 'lgtm-flash', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  await $.command.run(SHIP)
  expect(await ui.find({ type: 'Svg' })).toBeDefined()

  await clock.advance(7000)
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  expect(await ui.find({ text: 'status row' })).toBeDefined()
})
