import { describe, it, expect } from 'vitest'
import { solveQuestion } from '../../src/chem/solver'

describe('general solver (never hardcoded)', () => {
  it('balances an unseen hydrocrabon combustion', () => {
    const s = solveQuestion('Balance C3H8 + O2 -> CO2 + H2O')
    expect(s.topic).toBe('balance')
    expect(s.answer).toContain('C3H8 + 5O2 -> 3CO2 + 4H2O')
  })
  it('balances FeS2 combustion (never hardcoded)', () => {
    const s = solveQuestion('Cân bằng FeS2 + O2 -> Fe2O3 + SO2')
    expect(s.topic).toBe('balance')
    expect(s.answer).toBe('4FeS2 + 11O2 -> 2Fe2O3 + 8SO2')
  })
  it('computes gas volume from an arbitrary metal+acid problem (Mg)', () => {
    const s = solveQuestion('Cho 10g Mg phản ứng với HCl. Tính thể tích H2 ở đktc.')
    expect(s.topic).toBe('stoichiometry')
    expect(s.answer).toMatch(/V\(H2\) = [\d.]+/)
  })
  it('computes gas volume for Zn', () => {
    const s = solveQuestion('Cho 13 g Zn tác dụng với HCl dư. Tính thể tích H2 ở đktc.')
    expect(s.topic).toBe('stoichiometry')
    expect(s.answer).toMatch(/V\(H2\) = [\d.]+/)
  })
  it('solves mass from moles generically', () => {
    const s = solveQuestion('What is the mass of 0.5 mol NaCl?')
    expect(s.topic).toBe('mole')
    expect(s.answer).toContain('29')
  })
  it('solves gas volume generically', () => {
    const s = solveQuestion('Tính thể tích của 8 g O2 ở đktc.')
    expect(s.topic).toBe('gas')
    expect(s.answer).toContain('5.6')
  })
  it('solves moles from mass generically', () => {
    const s = solveQuestion('Khối lượng 16 g của O2 là bao nhiêu mol?')
    expect(s.answer).toContain('0.5')
  })
  it('computes concentration generically', () => {
    const s = solveQuestion('Tính nồng độ của 0.5 mol NaCl trong 250 ml dung dịch.')
    expect(s.topic).toBe('concentration')
    expect(s.answer).toContain('2')
  })
  it('computes pH of an unseen strong acid (HNO3)', () => {
    const s = solveQuestion('What is the pH of 0.001 M HNO3?')
    expect(s.topic).toBe('ph')
    expect(s.answer).toContain('3')
  })
  it('returns missing info when no data', () => {
    const s = solveQuestion('Tính thể tích H2.')
    expect(s.verified).toBe(false)
    expect(s.missingInfo).toBeTruthy()
  })
})
