import { describe, expect, it } from 'vitest'
import { THEME_PRESETS, contrast, themeVariables } from './storeTheme'

describe('themeVariables', () => {
  it('keeps button text readable over every stop of every preset gradient', () => {
    for (const p of THEME_PRESETS) {
      const v = themeVariables({ primary: p.primary, secondary: p.secondary, accent: p.accent })!
      for (const stop of ['--kv-gradient-from', '--kv-gradient-via', '--kv-gradient-to']) {
        expect(contrast(v['--kv-on-brand'], v[stop]), `${p.name} ${stop}`).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('puts dark text on a yellow accent', () => {
    const v = themeVariables({ primary: '#9333EA', secondary: '#14B8A6', accent: '#FACC15' })!
    expect(v['--kv-on-warm']).toBe('#141428')
    expect(v['--kv-on-brand']).toBe('#ffffff')
    expect(contrast(v['--kv-on-warm'], '#FACC15')).toBeGreaterThanOrEqual(4.5)
  })
})
