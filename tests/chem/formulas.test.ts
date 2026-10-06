import { describe, it, expect } from 'vitest'
import {
  molarMass, molesFromMass, massFromMoles, particlesFromMoles, gasVolumeSTP,
  molarity, dilutedConcentration, dilutedVolume, pHFromConcentration, pOHFromConcentration,
  percentageYield, limitingReagent, empiricalFormula, molecularFormula,
  convertUnits, molesFromGasVolume,
} from '../../src/chem/formulas'

describe('molar mass & moles', () => {
  it('molarMass H2SO4 ≈ 98.08', () => expect(molarMass('H2SO4')).toBeCloseTo(98.08, 1))
  it('molarMass NaOH ≈ 40', () => expect(molarMass('NaOH')).toBeCloseTo(40, 0))
  it('molesFromMass: 5.6g Fe / 56 ≈ 0.1', () => expect(molesFromMass(5.6, 56).value).toBeCloseTo(0.1, 5))
  it('massFromMoles: 0.1 mol Fe * 56 = 5.6 g', () => expect(massFromMoles(0.1, 56).value).toBeCloseTo(5.6, 5))
  it('particlesFromMoles: 0.1 mol ≈ 6.022e22', () => expect(particlesFromMoles(0.1).value).toBeCloseTo(6.022e22, -20))
})

describe('gas', () => {
  it('gasVolumeSTP: 0.1 mol * 22.4 = 2.24 L', () => expect(gasVolumeSTP(0.1).value).toBeCloseTo(2.24, 2))
  it('molesFromGasVolume: 2.24 L / 22.4 = 0.1', () => expect(molesFromGasVolume(2.24).value).toBeCloseTo(0.1, 5))
})

describe('concentration & dilution', () => {
  it('molarity: 0.5 mol in 0.5 L = 1 M', () => expect(molarity(0.5, 0.5).value).toBeCloseTo(1, 5))
  it('dilutedConcentration: 1M 0.5L diluted to 1L = 0.5M', () => expect(dilutedConcentration(1, 0.5, 1).value).toBeCloseTo(0.5, 5))
  it('dilutedVolume: 1M 0.5L to 0.25M => V2=2L', () => expect(dilutedVolume(1, 0.5, 0.25).value).toBeCloseTo(2, 5))
})

describe('pH', () => {
  it('pH of 0.01 M strong acid = 2', () => expect(pHFromConcentration(0.01).value).toBeCloseTo(2, 5))
  it('pOH of 0.01 M strong base = 2', () => expect(pOHFromConcentration(0.01).value).toBeCloseTo(2, 5))
})

describe('yield', () => {
  it('percentageYield: 8 g actual / 10 g theoretical = 80%', () => expect(percentageYield(8, 10).value).toBeCloseTo(80, 5))
})

describe('limiting reagent', () => {
  it('2H2 + O2 -> 2H2O with 4 mol H2 and 3 mol O2 => H2 limits', () => {
    const r = limitingReagent([{ formula: 'H2', coeff: 2, n: 4 }, { formula: 'O2', coeff: 1, n: 3 }])
    expect(r.limiting).toBe('H2')
  })
  it('2H2 + O2 with 2 mol H2 and 2 mol O2 => H2 limits', () => {
    const r = limitingReagent([{ formula: 'H2', coeff: 2, n: 2 }, { formula: 'O2', coeff: 1, n: 2 }])
    expect(r.limiting).toBe('H2')
  })
})

describe('empirical/molecular formula', () => {
  it('empiricalFormula from 40% C, 6.67% H, 53.33% O => CH2O', () => {
    expect(empiricalFormula({ C: 40, H: 6.67, O: 53.33 })).toBe('CH2O')
  })
  it('molecularFormula: CH2O (30) with molar 180 => C6H12O6', () => {
    expect(molecularFormula('CH2O', 180)).toBe('C6H12O6')
  })
})

describe('unit conversion', () => {
  it('converts mL to L', () => expect(convertUnits(500, 'mL', 'L').value).toBeCloseTo(0.5, 5))
  it('converts g to kg', () => expect(convertUnits(1500, 'g', 'kg').value).toBeCloseTo(1.5, 5))
})


describe('oxidation state', () => {
  it('S in H2SO4 = +6', async () => {
    const { oxidationState } = await import('../../src/chem/formulas')
    expect(oxidationState('H2SO4', 'S').value).toBe(6)
  })
  it('Cr in K2Cr2O7 = +6', async () => {
    const { oxidationState } = await import('../../src/chem/formulas')
    expect(oxidationState('K2Cr2O7', 'Cr').value).toBe(6)
  })
  it('Cl in HCl = -1', async () => {
    const { oxidationState } = await import('../../src/chem/formulas')
    expect(oxidationState('HCl', 'Cl').value).toBe(-1)
  })
})
