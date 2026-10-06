import { describe, it, expect } from 'vitest'
import { parseFormula, formulaMolarMass } from '../../src/chem/parser'

describe('parseFormula', () => {
  it('parses H2O', () => {
    const r = parseFormula('H2O')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.elements).toEqual({ H: 2, O: 1 })
  })
  it('parses Ca(OH)2', () => {
    const r = parseFormula('Ca(OH)2')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.elements).toEqual({ Ca: 1, O: 2, H: 2 })
  })
  it('parses Fe2(SO4)3', () => {
    const r = parseFormula('Fe2(SO4)3')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.elements).toEqual({ Fe: 2, S: 3, O: 12 })
  })
  it('parses SO4^2- with charge -2', () => {
    const r = parseFormula('SO4^2-')
    expect(r.ok).toBe(true)
    if (r.ok) { expect(r.elements).toEqual({ S: 1, O: 4 }); expect(r.charge).toBe(-2) }
  })
  it('parses state (aq)', () => {
    const r = parseFormula('NaCl(aq)')
    expect(r.ok).toBe(true)
    if (r.ok) { expect(r.state).toBe('aq'); expect(r.elements).toEqual({ Na: 1, Cl: 1 }) }
  })
  it('parses Fe^3+ charge 3', () => {
    const r = parseFormula('Fe^3+')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.charge).toBe(3)
  })
  it('rejects invalid formula', () => {
    expect(parseFormula('xyz').ok).toBe(false)
    expect(parseFormula('').ok).toBe(false)
  })
})

describe('formulaMolarMass', () => {
  it('H2SO4 ≈ 98.08', () => expect(formulaMolarMass('H2SO4')).toBeCloseTo(98.08, 1))
  it('NaOH = 40', () => expect(formulaMolarMass('NaOH')).toBeCloseTo(40, 0))
})
