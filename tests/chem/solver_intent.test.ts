import { describe, it, expect } from 'vitest'
import { solveQuestion } from '../../src/chem/solver'

describe('intent detection before missing-data', () => {
  it('"cân bằng của H2O" -> clarify it is a formula, not a failure', () => {
    const s = solveQuestion('cân bằng của H2O')
    expect(s.topic).toBe('formula-info')
    expect(s.answer).not.toContain('Chưa đủ thông tin để giải')
    expect(s.answer.toLowerCase()).toContain('công thức')
  })
  it('"cân bằng H2 + O2 -> H2O" -> actually balances', () => {
    const s = solveQuestion('cân bằng H2 + O2 -> H2O')
    expect(s.topic).toBe('balance')
    expect(s.answer).toContain('2H2 + O2 -> 2H2O')
  })
  it('"H2O gồm những nguyên tố nào?" -> composition', () => {
    const s = solveQuestion('H2O gồm những nguyên tố nào?')
    expect(s.topic).toBe('formula-info')
    expect(s.answer).toContain('H')
    expect(s.answer).toContain('O')
  })
  it('"tính số mol H2O" -> requires data, not generic error', () => {
    const s = solveQuestion('tính số mol H2O')
    expect(s.verified).toBe(false)
    expect(s.missingInfo).toBeTruthy()
    expect(s.missingInfo!).toMatch(/khối lượng|thể tích|số hạt/)
  })
  it('"tính thể tích H2" -> explains missing mass/moles', () => {
    const s = solveQuestion('Tính thể tích H2.')
    expect(s.verified).toBe(false)
    expect(s.missingInfo!).toMatch(/khối lượng|mol/)
  })
  it('"phân tử khối của H2O" -> 18 g/mol', () => {
    const s = solveQuestion('Phân tử khối của H2O là bao nhiêu?')
    expect(s.topic).toBe('molar-mass')
    expect(s.answer).toContain('18')
  })
  it('English composition question', () => {
    const s = solveQuestion('What elements are in H2O?')
    expect(s.topic).toBe('formula-info')
    expect(s.answer).toContain('H')
    expect(s.answer).toContain('O')
  })
  it('English balance of a never-hardcoded equation', () => {
    const s = solveQuestion('Balance C2H6 + O2 -> CO2 + H2O')
    expect(s.topic).toBe('balance')
    expect(s.answer).toContain('C2H6')
  })
  it('generic missing data for unknown messy input', () => {
    const s = solveQuestion('xyzzy plugh')
    expect(s.verified).toBe(false)
    expect(s.missingInfo).toBeTruthy()
  })
})
