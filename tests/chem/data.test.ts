import { describe, it, expect } from 'vitest'
import { getElement, getElementByNumber, SYMBOLS } from '../../src/chem/data/periodicTable'
import { AVOGADRO, GAS_CONSTANT, MOLAR_VOLUME_STP, KW } from '../../src/chem/data/constants'

describe('periodic table data', () => {
  it('has element Fe with Z 26 and mass ~55.845', () => {
    const fe = getElement('Fe')
    expect(fe).toBeDefined()
    expect(fe!.number).toBe(26)
    expect(fe!.mass).toBeCloseTo(55.845, 2)
  })
  it('getElementByNumber(8) is O', () => {
    expect(getElementByNumber(8)!.symbol).toBe('O')
  })
  it('has all 118 elements', () => {
    expect(SYMBOLS.length).toBe(118)
  })
})

describe('constants', () => {
  it('AVOGADRO ≈ 6.022e23', () => expect(AVOGADRO).toBeCloseTo(6.022e23, -21))
  it('GAS_CONSTANT = 0.082', () => expect(GAS_CONSTANT).toBeCloseTo(0.082, 3))
  it('MOLAR_VOLUME_STP = 22.4', () => expect(MOLAR_VOLUME_STP).toBeCloseTo(22.4, 1))
  it('KW = 1e-14', () => expect(KW).toBeCloseTo(1e-14, 16))
})
