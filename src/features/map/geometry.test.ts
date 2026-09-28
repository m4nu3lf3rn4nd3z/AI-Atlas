import { describe, expect, it } from 'vitest'
import { connect, type Rect } from './geometry'

const card = (x: number, y: number): Rect => ({ x, y, w: 200, h: 80 })

describe('connect', () => {
  it('goes from the bottom edge to the top edge when the target is below', () => {
    const c = connect(card(0, 0), card(0, 300))
    expect(c.d.startsWith('M100,80')).toBe(true)
    expect(c.d.endsWith('100,300')).toBe(true)
    expect(c.mid.y).toBeGreaterThan(80)
    expect(c.mid.y).toBeLessThan(300)
  })

  it('goes from the top edge to the bottom edge when the target is above', () => {
    const c = connect(card(0, 300), card(400, 0))
    expect(c.d.startsWith('M100,300')).toBe(true)
    expect(c.d.endsWith('500,80')).toBe(true)
  })

  it('links neighbours in the same row side to side', () => {
    const c = connect(card(0, 0), card(220, 0))
    expect(c.d.startsWith('M200,40')).toBe(true)
    expect(c.d.endsWith('220,40')).toBe(true)
  })

  it('arcs over the cards between distant cards in the same row', () => {
    const c = connect(card(0, 0), card(900, 0))
    expect(c.d.startsWith('M100,0')).toBe(true)
    expect(c.d.endsWith('1000,0')).toBe(true)
    expect(c.mid.y).toBeLessThan(0) // above the row
  })
})
