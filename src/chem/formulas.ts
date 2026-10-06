import { formulaMolarMass, parseFormula } from './parser'
import { getElement } from './data/periodicTable'

export interface CalcResult { value: number; unit: string; steps: string[] }

export function molarMass(formula: string): number { return formulaMolarMass(formula) }

export function molesFromMass(mass: number, M: number): CalcResult {
  return { value: mass / M, unit: 'mol', steps: [`n = m/M`, `n = ${mass} / ${M}`, `n = ${mass / M} mol`] }
}
export function massFromMoles(n: number, M: number): CalcResult {
  return { value: n * M, unit: 'g', steps: [`m = n·M`, `m = ${n} · ${M}`, `m = ${n * M} g`] }
}
export function particlesFromMoles(n: number): CalcResult {
  const p = n * 6.022e23
  return { value: p, unit: 'particles', steps: [`N = n·NA`, `N = ${n} · 6.022e23`, `N = ${p}`] }
}
export function gasVolumeSTP(n: number): CalcResult {
  return { value: n * 22.4, unit: 'L', steps: [`V = n·22.4`, `V = ${n} · 22.4`, `V = ${n * 22.4} L`] }
}
export function molesFromGasVolume(V: number): CalcResult {
  return { value: V / 22.4, unit: 'mol', steps: [`n = V/22.4`, `n = ${V}/22.4`, `n = ${V / 22.4} mol`] }
}
export function molarity(n: number, V: number): CalcResult {
  return { value: n / V, unit: 'mol/L', steps: [`C = n/V`, `C = ${n}/${V}`, `C = ${n / V} M`] }
}
export function dilutedConcentration(C1: number, V1: number, V2: number): CalcResult {
  return { value: (C1 * V1) / V2, unit: 'M', steps: [`C1V1 = C2V2`, `C2 = C1V1/V2 = ${C1}·${V1}/${V2}`, `C2 = ${(C1 * V1) / V2} M`] }
}
export function dilutedVolume(C1: number, V1: number, C2: number): CalcResult {
  return { value: (C1 * V1) / C2, unit: 'L', steps: [`V2 = C1V1/C2`, `V2 = ${C1}·${V1}/${C2}`, `V2 = ${(C1 * V1) / C2} L`] }
}
export function pHFromConcentration(cH: number): CalcResult {
  return { value: -Math.log10(cH), unit: '', steps: [`pH = -log[H+]`, `pH = -log(${cH})`, `pH = ${-Math.log10(cH)}`] }
}
export function pOHFromConcentration(cOH: number): CalcResult {
  return { value: -Math.log10(cOH), unit: '', steps: [`pOH = -log[OH-]`, `pOH = ${-Math.log10(cOH)}`] }
}
export function percentageYield(actual: number, theoretical: number): CalcResult {
  const v = (actual / theoretical) * 100
  return { value: v, unit: '%', steps: [`%H = (thực tế/lí thuyết)·100`, `= (${actual}/${theoretical})·100`, `= ${v}%`] }
}

export function limitingReagent(reactants: { formula: string; coeff: number; n: number }[]): { limiting: string; steps: string[] } {
  let limiting = reactants[0].formula
  let min = Infinity
  const steps: string[] = []
  for (const r of reactants) {
    const ratio = r.n / r.coeff
    steps.push(`n(${r.formula})/hệ số = ${r.n}/${r.coeff} = ${ratio}`)
    if (ratio < min) { min = ratio; limiting = r.formula }
  }
  steps.push(`Chất giới hạn: ${limiting}`)
  return { limiting, steps }
}

export function empiricalFormula(pct: Record<string, number>): string {
  const moles: Record<string, number> = {}
  for (const [el, p] of Object.entries(pct)) {
    const e = getElement(el)
    if (!e) return ''
    moles[el] = p / e.mass
  }
  const min = Math.min(...Object.values(moles))
  const ratios: Record<string, number> = {}
  for (const [el, m] of Object.entries(moles)) ratios[el] = m / min
  // round to nearest integer
  const rounded: Record<string, number> = {}
  for (const [el, r] of Object.entries(ratios)) rounded[el] = Math.round(r)
  let s = ''
  for (const [el, r] of Object.entries(rounded)) s += el + (r === 1 ? '' : r)
  return s
}

export function molecularFormula(empirical: string, molarMassValue: number): string {
  const eq = formulaMolarMass(empirical)
  if (isNaN(eq) || eq === 0) return empirical
  const factor = Math.round(molarMassValue / eq)
  if (factor === 1) return empirical
  const p = parseFormula(empirical)
  if (!p.ok) return empirical
  let s = ''
  for (const [el, c] of Object.entries(p.elements)) s += el + (c * factor === 1 ? '' : c * factor)
  return s
}

const UNIT_FACTORS: Record<string, Record<string, number>> = {
  L: { mL: 1000, L: 1, m3: 0.001 },
  mL: { L: 0.001, mL: 1, m3: 1e-6 },
  g: { kg: 0.001, g: 1, mg: 1000 },
  kg: { g: 1000, kg: 1, mg: 1e6 },
}

export function convertUnits(value: number, from: string, to: string): CalcResult {
  const table = UNIT_FACTORS[from]
  if (table && table[to] !== undefined) {
    return { value: value * table[to], unit: to, steps: [`${value} ${from} · ${table[to]} = ${value * table[to]} ${to}`] }
  }
  // inverse lookup
  for (const [base, tos] of Object.entries(UNIT_FACTORS)) {
    if (tos[from] !== undefined && tos[to] !== undefined) {
      return { value: (value * tos[from]) / tos[to], unit: to, steps: [`chuyển ${from} -> ${to}`] }
    }
  }
  return { value: NaN, unit: to, steps: ['Đơn vị không hỗ trợ'] }
}
