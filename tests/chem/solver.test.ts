import { describe, it, expect } from 'vitest'
import { solveQuestion } from '../../src/chem/solver'

describe('solveQuestion', () => {
  it('detects and solves balancing', () => {
    const s = solveQuestion('Balance H2 + O2 -> H2O')
    expect(s.topic).toBe('balance')
    expect(s.answer).toContain('2H2')
    expect(s.verified).toBe(true)
  })
  it('solves pH of 0.01 M HCl', () => {
    const s = solveQuestion('What is the pH of 0.01 M HCl?')
    expect(s.topic).toBe('ph')
    expect(s.answer).toContain('2')
    expect(s.verified).toBe(true)
  })
  it('solves Vietnamese Fe + HCl gas volume', () => {
    const s = solveQuestion('Cho 5.6g Fe phản ứng với HCl. Tính thể tích H2 ở đktc.')
    expect(s.topic).toBe('stoichiometry')
    expect(s.language).toBe('vi')
    expect(s.answer).toContain('2.24')
    expect(s.verified).toBe(true)
  })
  it('reports missing info for unsolvable', () => {
    const s = solveQuestion('asdfgh ???')
    expect(s.answer).toBeTruthy()
    expect(s.verified).toBe(false)
    expect(s.missingInfo).toBeTruthy()
  })
  it('solves molar mass', () => {
    const s = solveQuestion('What is the molar mass of H2SO4?')
    expect(s.topic).toBe('molar-mass')
    expect(s.answer).toContain('98')
  })
  it('solves percent yield', () => {
    const s = solveQuestion('Actual yield is 8g and theoretical yield is 10g. What is the percentage yield?')
    expect(s.topic).toBe('percent-yield')
    expect(s.answer).toContain('80')
  })
})
