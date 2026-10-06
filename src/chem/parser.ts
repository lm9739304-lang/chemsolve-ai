import { getElement } from './data/periodicTable'

export type ParseResult =
  | { ok: true; elements: Record<string, number>; charge: number; state: string | null }
  | { ok: false; error: string }

function parseGroup(s: string): { counts: Record<string, number> } | null {
  const counts: Record<string, number> = {}
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === '(') {
      let depth = 1
      let j = i + 1
      while (j < s.length && depth > 0) {
        if (s[j] === '(') depth++
        else if (s[j] === ')') depth--
        j++
      }
      if (depth !== 0) return null
      const inner = parseGroup(s.slice(i + 1, j - 1))
      if (!inner) return null
      let k = j
      let numStr = ''
      while (k < s.length && /\d/.test(s[k])) numStr += s[k++]
      const mult = numStr ? parseInt(numStr, 10) : 1
      for (const [el, c] of Object.entries(inner.counts)) counts[el] = (counts[el] ?? 0) + c * mult
      i = k
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch
      let j = i + 1
      if (j < s.length && /[a-z]/.test(s[j])) sym += s[j++]
      let numStr = ''
      while (j < s.length && /\d/.test(s[j])) numStr += s[j++]
      const el = getElement(sym)
      if (!el) return null
      const n = numStr ? parseInt(numStr, 10) : 1
      counts[el.symbol] = (counts[el.symbol] ?? 0) + n
      i = j
    } else {
      return null
    }
  }
  return { counts }
}

export function parseFormula(input: string): ParseResult {
  let s = input.trim()
  if (!s) return { ok: false, error: 'Công thức trống' }

  let state: string | null = null
  const stateMatch = s.match(/\((s|l|g|aq|rắn|lỏng|khí|dd|dung dịch)\)\s*$/i)
  if (stateMatch) {
    state = stateMatch[1].toLowerCase()
    s = s.slice(0, stateMatch.index).trim()
  }

  let charge = 0
  const caretIdx = s.indexOf('^')
  if (caretIdx >= 0) {
    const chargeStr = s.slice(caretIdx + 1).trim()
    const m = chargeStr.match(/^(\d*)([+-])$/)
    if (!m) return { ok: false, error: 'Điện tích không hợp lệ' }
    charge = (m[1] ? parseInt(m[1], 10) : 1) * (m[2] === '-' ? -1 : 1)
    s = s.slice(0, caretIdx).trim()
  } else {
    // trailing charge without caret, e.g. Fe3+ or SO4 2-
    const m = s.match(/^(.*?)(\d*[+-])$/)
    if (m && /[A-Za-z0-9()\]]$/.test(m[1]) && !/[+-]/.test(m[1])) {
      const cs = m[2]
      const cm = cs.match(/^(\d*)([+-])$/)!
      charge = (cm[1] ? parseInt(cm[1], 10) : 1) * (cm[2] === '-' ? -1 : 1)
      s = m[1].trim()
    }
  }

  const parsed = parseGroup(s)
  if (!parsed || Object.keys(parsed.counts).length === 0) {
    return { ok: false, error: 'Công thức không hợp lệ' }
  }
  return { ok: true, elements: parsed.counts, charge, state }
}

export function formulaMolarMass(input: string): number {
  const r = parseFormula(input)
  if (!r.ok) return NaN
  let total = 0
  for (const [sym, count] of Object.entries(r.elements)) {
    const el = getElement(sym)
    if (!el) return NaN
    total += el.mass * count
  }
  return total
}
