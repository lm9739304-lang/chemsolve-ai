import { describe, it, expect } from 'vitest'
import { balanceEquation } from '../../src/chem/balancer'

describe('balanceEquation', () => {
  it('balances H2 + O2 -> H2O', () => {
    const r = balanceEquation('H2 + O2 -> H2O')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.balanced).toBe('2H2 + O2 -> 2H2O')
  })
  it('balances Fe + O2 -> Fe2O3', () => {
    const r = balanceEquation('Fe + O2 -> Fe2O3')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.balanced).toBe('4Fe + 3O2 -> 2Fe2O3')
  })
  it('balances KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O', () => {
    const r = balanceEquation('KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.balanced).toBe('2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O')
  })
  it('balances NaOH + HCl -> NaCl + H2O', () => {
    const r = balanceEquation('NaOH + HCl -> NaCl + H2O')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.balanced).toBe('NaOH + HCl -> NaCl + H2O')
  })
  it('balances with states and parentheses: Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O', () => {
    const r = balanceEquation('Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.balanced).toBe('3Ca(OH)2 + 2H3PO4 -> Ca3(PO4)2 + 6H2O')
  })
  it('rejects invalid equation', () => {
    expect(balanceEquation('H2 + O2').ok).toBe(false)
    expect(balanceEquation('xyz -> abc').ok).toBe(false)
    expect(balanceEquation('').ok).toBe(false)
  })
  it('verifies atom counts after balancing', () => {
    const r = balanceEquation('Fe + O2 -> Fe2O3')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.verification).toBe(true)
    }
  })
})
