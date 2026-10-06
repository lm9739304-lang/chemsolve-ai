import { parseFormula } from './parser'

class F {
  n: number; d: number
  constructor(n: number, d = 1) {
    if (d < 0) { n = -n; d = -d }
    const g = Math.abs(gcd(Math.round(n), Math.round(d))) || 1
    this.n = Math.round(n) / g
    this.d = Math.round(d) / g
  }
  static add(a: F, b: F) { return new F(a.n * b.d + b.n * a.d, a.d * b.d) }
  static mul(a: F, b: F) { return new F(a.n * b.n, a.d * b.d) }
  static div(a: F, b: F) { return new F(a.n * b.d, a.d * b.n) }
  static neg(a: F) { return new F(-a.n, a.d) }
  isZero() { return this.n === 0 }
  toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}` }
}
function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

export interface BalancedEquation {
  ok: boolean
  balanced?: string
  error?: string
  coefficients?: number[]
  verification?: boolean
  atomsBefore?: Record<string, { left: number; right: number }>
  atomsAfter?: Record<string, { left: number; right: number }>
}

function parseSide(side: string): { formula: string; raw: string }[] | null {
  const parts = side.split('+').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return null
  const out: { formula: string; raw: string }[] = []
  for (const p of parts) {
    const m = p.match(/^(\d+)?\s*(.+)$/)
    if (!m) return null
    const raw = m[2].replace(/\s+/g, '')
    const r = parseFormula(raw)
    if (!r.ok) return null
    out.push({ formula: raw, raw })
  }
  return out
}

export function balanceEquation(eq: string): BalancedEquation {
  const trimmed = eq.trim()
  if (!trimmed) return { ok: false, error: 'Phương trình trống' }
  const arrowMatch = trimmed.match(/->|→|=|⇌/)
  if (!arrowMatch) return { ok: false, error: 'Thiếu mũi tên ->' }
  const idx = trimmed.indexOf(arrowMatch[0])
  const left = parseSide(trimmed.slice(0, idx))
  const right = parseSide(trimmed.slice(idx + arrowMatch[0].length))
  if (!left || !right) return { ok: false, error: 'Phương trình không hợp lệ' }

  const species = [...left, ...right]
  const parsed = species.map(s => parseFormula(s.raw))
  if (parsed.some(p => !p.ok)) return { ok: false, error: 'Công thức không hợp lệ' }

  const elementSet = new Set<string>()
  for (const p of parsed) {
    if (p.ok) for (const el of Object.keys(p.elements)) elementSet.add(el)
  }

  // atoms before (unbalanced, all coeffs 1)
  const atomsBefore: Record<string, { left: number; right: number }> = {}
  for (const el of elementSet) {
    let l = 0, r = 0
    for (let i = 0; i < left.length; i++) {
      const p = parseFormula(left[i].raw)
      if (p.ok) l += p.elements[el] ?? 0
    }
    for (let i = 0; i < right.length; i++) {
      const p = parseFormula(right[i].raw)
      if (p.ok) r += p.elements[el] ?? 0
    }
    atomsBefore[el] = { left: l, right: r }
  }

  // Build matrix over rationals: rows = elements + charge; cols = species
  const rows: F[][] = []
  for (const el of elementSet) {
    rows.push(species.map((s, i) => {
      const p = parseFormula(s.raw)
      const c = p.ok ? p.elements[el] ?? 0 : 0
      return new F(i < left.length ? c : -c, 1)
    }))
  }
  rows.push(species.map((s, i) => {
    const p = parseFormula(s.raw)
    const q = p.ok ? p.charge : 0
    return new F(i < left.length ? q : -q, 1)
  }))

  // RREF
  const nCols = species.length
  const nRows = rows.length
  const M: F[][] = rows.map(r => [...r])
  const pivotCols: number[] = []
  let rowIdx = 0
  for (let col = 0; col < nCols && rowIdx < nRows; col++) {
    let pivot = -1
    for (let r = rowIdx; r < nRows; r++) if (!M[r][col].isZero()) { pivot = r; break }
    if (pivot === -1) continue
    ;[M[rowIdx], M[pivot]] = [M[pivot], M[rowIdx]]
    const pv = M[rowIdx][col]
    for (let c = 0; c < nCols; c++) M[rowIdx][c] = F.div(M[rowIdx][c], pv)
    for (let r = 0; r < nRows; r++) {
      if (r === rowIdx) continue
      const factor = M[r][col]
      if (!factor.isZero()) for (let c = 0; c < nCols; c++) M[r][c] = F.add(M[r][c], F.neg(F.mul(factor, M[rowIdx][c])))
    }
    pivotCols.push(col)
    rowIdx++
  }

  const freeCols: number[] = []
  for (let c = 0; c < nCols; c++) if (!pivotCols.includes(c)) freeCols.push(c)
  if (freeCols.length === 0) return { ok: false, error: 'Không thể cân bằng' }

  // null vector: free vars = 1 each, pivots solved
  const x: F[] = species.map(() => new F(0, 1))
  for (const fc of freeCols) x[fc] = new F(1, 1)
  for (let i = 0; i < pivotCols.length; i++) {
    const pc = pivotCols[i]
    let val = new F(0, 1)
    for (const fc of freeCols) val = F.add(val, F.neg(M[i][fc]))
    x[pc] = val
  }

  // Scale to smallest positive integers
  let lcm = 1
  for (const f of x) lcm = lcmD(lcm, f.d)
  let ints = x.map(f => f.n * (lcm / f.d))
  const g = ints.reduce((a, b) => gcd(Math.abs(a), Math.abs(b)), 0) || 1
  ints = ints.map(v => v / g)
  if (ints.every(v => v < 0)) ints = ints.map(v => -v)
  if (ints.some(v => v <= 0)) return { ok: false, error: 'Không thể cân bằng phương trình (có hệ số âm/0)' }

  // Verify
  const ok = verifyBalance(left, right, ints)
  if (!ok) return { ok: false, error: 'Cân bằng không khớp — kiểm tra lại công thức' }

  const coeffs = ints
  const leftStr = left.map((s, i) => (coeffs[i] === 1 ? '' : coeffs[i]) + s.formula).join(' + ')
  const rightStr = right.map((s, i) => (coeffs[left.length + i] === 1 ? '' : coeffs[left.length + i]) + s.formula).join(' + ')
  const balanced = `${leftStr} -> ${rightStr}`

  const atomsAfter: Record<string, { left: number; right: number }> = {}
  for (const el of elementSet) {
    let l = 0, r = 0
    left.forEach((s, i) => { const p = parseFormula(s.raw); if (p.ok) l += (p.elements[el] ?? 0) * coeffs[i] })
    right.forEach((s, i) => { const p = parseFormula(s.raw); if (p.ok) r += (p.elements[el] ?? 0) * coeffs[left.length + i] })
    atomsAfter[el] = { left: l, right: r }
  }

  return { ok: true, balanced, coefficients: coeffs, verification: true, atomsBefore, atomsAfter }
}

function lcmD(a: number, b: number): number { return Math.abs(a * b) / (gcd(a, b) || 1) }

function verifyBalance(left: { formula: string; raw: string }[], right: { formula: string; raw: string }[], coeffs: number[]): boolean {
  const counts: Record<string, number> = {}
  left.forEach((s, i) => {
    const p = parseFormula(s.raw); if (!p.ok) return
    for (const [el, c] of Object.entries(p.elements)) counts[el] = (counts[el] ?? 0) + c * coeffs[i]
  })
  right.forEach((s, i) => {
    const p = parseFormula(s.raw); if (!p.ok) return
    for (const [el, c] of Object.entries(p.elements)) counts[el] = (counts[el] ?? 0) - c * coeffs[left.length + i]
  })
  const chargeCheck = { v: 0 }
  left.forEach((s, i) => { const p = parseFormula(s.raw); if (p.ok) chargeCheck.v += p.charge * coeffs[i] })
  right.forEach((s, i) => { const p = parseFormula(s.raw); if (p.ok) chargeCheck.v -= p.charge * coeffs[left.length + i] })
  return Object.values(counts).every(v => v === 0) && chargeCheck.v === 0
}
