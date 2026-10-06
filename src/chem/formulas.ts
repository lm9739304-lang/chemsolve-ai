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

// Oxidation state via standard rules: assign known elements, then solve charge balance.
export function oxidationState(formula: string, target: string): { value: number | null; steps: string[] } {
  const r = parseFormula(formula)
  if (!r.ok) return { value: null, steps: ['Công thức không hợp lệ'] }
  const known: Record<string, number> = {
    H: 1, O: -2, F: -1, Cl: -1, Br: -1, I: -1,
    Li: 1, Na: 1, K: 1, Rb: 1, Cs: 1,
    Be: 2, Mg: 2, Ca: 2, Sr: 2, Ba: 2,
    Al: 3, Zn: 2, Cd: 2, Ag: 1,
  }
  const counts: Record<string, number> = r.elements
  const others: string[] = Object.keys(counts).filter(e => e !== target)
  let otherSum = 0
  const steps: string[] = []
  for (const e of others) {
    if (known[e] !== undefined) {
      otherSum += known[e] * counts[e]
      steps.push(`${e}: ${known[e]} (quy tắc)`)
    } else {
      return { value: null, steps: [...steps, `Không đủ dữ liệu: chưa biết số oxi hóa của ${e}`] }
    }
  }
  if (counts[target] === undefined) return { value: null, steps: [`Không tìm thấy ${target} trong ${formula}`] }
  // sum(OS_i·count) = charge
  const value = (r.charge - otherSum) / counts[target]
  steps.push(`${counts[target]}·x = ${r.charge} - (${otherSum})`)
  steps.push(`x = ${value}`)
  return { value, steps }
}

// dimension -> unit -> 'how many base units in 1 <unit>'
const UNIT_BASE: Record<string, Record<string, number>> = {
  vol: { L: 1, mL: 0.001, m3: 1000 },
  mass: { g: 1, kg: 1000, mg: 0.001 },
  press: { kPa: 1, Pa: 0.001, atm: 101.325, bar: 100, mmHg: 101.325 / 760 },
  energy: { kJ: 1, J: 0.001, kcal: 4.184, cal: 0.004184 },
  amount: { mol: 1, mmol: 0.001, kmol: 1000 },
}

const UNIT_ALIASES: Record<string, string> = {
  'lít': 'L', 'lit': 'L', 'l': 'L', 'ml': 'mL', 'gam': 'g', 'gram': 'g', 'kpa': 'kPa', 'mol/l': 'M', 'm': 'M',
}

function dimensionOf(unit: string): string | null {
  for (const [dim, units] of Object.entries(UNIT_BASE)) if (units[unit] !== undefined) return dim
  return null
}

export function convertUnits(value: number, from: string, to: string): CalcResult {
  from = UNIT_ALIASES[from] ?? from
  to = UNIT_ALIASES[to] ?? to
  if (from === 'mol' && to === 'particles') return { value: value * 6.022e23, unit: 'particles', steps: [`N = n·NA = ${value} · 6.022e23`] }
  if (from === 'particles' && to === 'mol') return { value: value / 6.022e23, unit: 'mol', steps: [`n = N/NA`] }
  if (from === 'C' && to === 'K') return { value: value + 273.15, unit: 'K', steps: [`K = °C + 273.15`] }
  if (from === 'K' && to === 'C') return { value: value - 273.15, unit: '°C', steps: [`°C = K - 273.15`] }
  if (from === 'C' && to === 'F') return { value: value * 9/5 + 32, unit: '°F', steps: [`°F = °C·9/5 + 32`] }
  if (from === 'F' && to === 'C') return { value: (value - 32) * 5/9, unit: '°C', steps: [`°C = (°F-32)·5/9`] }
  const dFrom = dimensionOf(from), dTo = dimensionOf(to)
  if (dFrom && dFrom === dTo) {
    const table = UNIT_BASE[dFrom]
    const v = (value * table[from]) / table[to]
    return { value: v, unit: to, steps: [`${value} ${from} = ${v} ${to}`] }
  }
  // concentration: M == mol/L, so treat 1 M as 1 mol/L
  if ((from === 'M' || from === 'mol/L') && to === 'mol') return { value: NaN, unit: to, steps: ['Cần thể tích để đổi nồng độ sang số mol'] }
  return { value: NaN, unit: to, steps: ['Đơn vị không hỗ trợ'] }
}
