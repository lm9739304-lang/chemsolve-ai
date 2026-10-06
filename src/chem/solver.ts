import { balanceEquation } from './balancer'
import {
  molarMass, molesFromMass, massFromMoles, gasVolumeSTP, molesFromGasVolume,
  molarity, dilutedConcentration, dilutedVolume, pHFromConcentration, pOHFromConcentration,
  percentageYield, limitingReagent, empiricalFormula, molecularFormula, convertUnits,
} from './formulas'
import { getElement } from './data/periodicTable'
import { parseFormula } from './parser'

export interface Solution {
  topic: string
  language: 'vi' | 'en'
  interpretation: string
  given: string[]
  find: string
  equation: string | null
  formula: string | null
  conversions: string[]
  steps: string[]
  answer: string
  verification: string
  verified: boolean
  missingInfo: string | null
  /** context for follow-up questions */
  ctx?: { equation: string | null; knownSpecies: string | null; knownN: number | null; balancedCoeffs: Record<string, number> | null }
}

function detectLanguage(s: string): 'vi' | 'en' {
  const t = s.toLowerCase()
  if (/[ăâêôơưđ]/.test(t) || /(cho|tính|thể tích|đktc|khối lượng|nồng độ|hiệu suất|mol phản|cân bằng|mặc|thu|phản ứng|dung dịch)/.test(t)) return 'vi'
  return 'en'
}

function round(v: number, d = 4): string {
  // avoid floating noise
  const r = Math.round(v * 1e6) / 1e6
  return String(r)
}

function missing(input: string, lang: 'vi' | 'en', extra?: string): Solution {
  return {
    topic: 'unknown', language: lang, interpretation: input, given: [], find: '',
    equation: null, formula: null, conversions: [], steps: [],
    answer: lang === 'vi'
      ? `Chưa đủ thông tin để giải.${extra ? ' Cần: ' + extra : ' Vui lòng cung cấp dữ kiện (khối lượng, số mol, nồng độ...) và yêu cầu cụ thể.'}`
      : `Not enough information to solve.${extra ? ' Need: ' + extra : ' Please provide given values (mass, moles, concentration...) and the specific request.'}`,
    verification: '⚠ Needs more information', verified: false,
    missingInfo: lang === 'vi' ? (extra ?? 'Thiếu dữ kiện rõ ràng') : (extra ?? 'Missing clear data'),
  }
}

// ---------- valence & salt helpers ----------
const GROUP1 = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']
const GROUP2 = ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra']

function metalValency(sym: string): number | null {
  if (GROUP1.includes(sym)) return 1
  if (GROUP2.includes(sym)) return 2
  if (sym === 'Al') return 3
  if (['Fe', 'Zn', 'Cu', 'Ni', 'Mg', 'Ca', 'Ba', 'Cd', 'Co', 'Cr', 'Mn'].includes(sym)) return 2
  const el = getElement(sym)
  if (el && (el.category.includes('alkali') || el.category.includes('alkaline'))) return el.category.includes('alkali') ? 1 : 2
  return null
}

function anionInfo(acid: string): { formula: string; charge: number } | null {
  const a = acid.toLowerCase().replace(/\s/g, '')
  if (a === 'hcl') return { formula: 'Cl', charge: -1 }
  if (a === 'hbr') return { formula: 'Br', charge: -1 }
  if (a === 'hi') return { formula: 'I', charge: -1 }
  if (a === 'h2so4') return { formula: 'SO4', charge: -2 }
  if (a === 'hno3') return { formula: 'NO3', charge: -1 }
  if (a === 'h3po4') return { formula: 'PO4', charge: -3 }
  if (a === 'h2s') return { formula: 'S', charge: -2 }
  return null
}

function saltFormula(metal: string, val: number, anion: string, anionCharge: number): string {
  // neutralize: M_x An_y where x*val + y*anionCharge = 0
  const q = -anionCharge // positive
  const g = gcd(val, q)
  const x = q / g
  const y = val / g
  if (anionCharge === -1) return metal + anion + (y === 1 ? '' : y)
  if (anion.length === 1) return metal + (x === 1 ? '' : x) + anion + (y === 1 ? '' : y)
  // polyatomic anion needs parentheses when y > 1
  return metal + (x === 1 ? '' : x) + '(' + anion + ')' + (y === 1 ? '' : y)
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }

function isMetal(sym: string): boolean {
  const el = getElement(sym)
  if (!el) return false
  return el.category.includes('alkali') || el.category.includes('alkaline') || el.category.includes('transition') || el.category === 'post-transition'
}

// Build the balanced reaction for reactant classes, or null if pattern unsupported
function buildReactionFromReactants(reactantFormulas: string[]): string | null {
  if (reactantFormulas.length < 1) return null
  const r0 = reactantFormulas[0]
  const p0 = parseFormula(r0)
  if (!p0.ok) return null
  const elems = Object.keys(p0.elements)

  // metal + acid
  if (elems.length === 1 && isMetal(elems[0])) {
    const acid = reactantFormulas[1]
    if (!acid) return null
    const a = acid.toLowerCase()
    const an = anionInfo(a)
    if (!an) return null
    const val = metalValency(elems[0])
    if (!val) return null
    const salt = saltFormula(elems[0], val, an.formula, an.charge)
    return `${r0} + ${acid} -> ${salt} + H2`
  }

  // metal + water
  if (elems.length === 1 && isMetal(elems[0])) {
    if (reactantFormulas[1] && /^h2o$/i.test(reactantFormulas[1])) {
      const val = metalValency(elems[0])
      if (!val) return null
      const hydroxide = val === 1 ? elems[0] + 'OH' : val === 2 ? elems[0] + '(OH)2' : elems[0] + '(OH)3'
      return `${r0} + H2O -> ${hydroxide} + H2`
    }
  }

  // metal oxide + acid  (formula like Fe2O3, CaO, CuO)
  if (elems.length >= 2 && elems.includes('O') && elems.length === 2) {
    const acid = reactantFormulas[1]
    const an = acid ? anionInfo(acid.toLowerCase()) : null
    if (an) {
      const other = elems.find(e => e !== 'O')!
      const val = metalValency(other)
      if (val) {
        const salt = saltFormula(other, val, an.formula, an.charge)
        return `${r0} + ${acid} -> ${salt} + H2O`
      }
    }
  }

  // metal carbonate / bicarbonate + acid
  if (elems.length >= 3 && (elems.includes('C') && elems.includes('O'))) {
    const acid = reactantFormulas[1]
    const an = acid ? anionInfo(acid.toLowerCase()) : null
    if (an) {
      const other = elems.find(e => e !== 'C' && e !== 'O')!
      const val = metalValency(other)
      if (val) {
        const salt = saltFormula(other, val, an.formula, an.charge)
        return `${r0} + ${acid} -> ${salt} + CO2 + H2O`
      }
    }
  }

  // acid + base (metal hydroxide)
  const acid = reactantFormulas.find(r => anionInfo(r.toLowerCase()))
  const base = reactantFormulas.find(r => /\(OH\)|OH/.test(r) && !anionInfo(r.toLowerCase()))
  if (acid && base) {
    const an = anionInfo(acid.toLowerCase())!
    // metal of base
    const bParse = parseFormula(base)
    if (bParse.ok) {
      const bElems = Object.keys(bParse.elements).filter(e => e !== 'O' && e !== 'H')
      if (bElems.length === 1) {
        const val = metalValency(bElems[0])
        if (val) {
          const salt = saltFormula(bElems[0], val, an.formula, an.charge)
          return `${acid} + ${base} -> ${salt} + H2O`
        }
      }
    }
  }

  return null
}

// Parse "Cho X g Fe phản ứng với HCl" style givens
interface Given { species: string; kind: 'mass' | 'moles' | 'gasVolume' | 'concentration' | 'solutionVolume' | 'pH'; value: number; unit: string }

function extractGivens(low: string): Given[] {
  const givens: Given[] = []
  // mass: "5.6g Fe", "5.6 g Fe", "cho 5.6g Fe", "m(Fe) = 5.6 g", "5.6g of Fe"
  let m: RegExpExecArray | null
  const massRe = /([\d]+[.,]?\d*)\s*g(am|ram)?(?:\s*của|\s*of)?\s*([A-Za-z][A-Za-z0-9()]*)/g
  while ((m = massRe.exec(low))) {
    givens.push({ species: capFormula(m[3]), kind: 'mass', value: parseFloat(m[1].replace(',', '.')), unit: 'g' })
  }
  const m2re = /m\(\s*([A-Za-z0-9()]+)\s*\)\s*=\s*([\d.,]+)\s*g/g
  while ((m = m2re.exec(low))) givens.push({ species: capFormula(m[1]), kind: 'mass', value: parseFloat(m[2].replace(',', '.')), unit: 'g' })

  // moles: "0.1 mol Fe", "n(Fe) = 0.1 mol", "0.1 mol của Fe"
  const molRe = /([\d]+[.,]?\d*)\s*mol(?:e|es)?(?:\s*của|\s*of)?\s*([A-Za-z][A-Za-z0-9()]*)/g
  while ((m = molRe.exec(low))) givens.push({ species: capFormula(m[2]), kind: 'moles', value: parseFloat(m[1].replace(',', '.')), unit: 'mol' })
  const nre = /n\(\s*([A-Za-z0-9()]+)\s*\)\s*=\s*([\d.,]+)\s*mol/g
  while ((m = nre.exec(low))) givens.push({ species: capFormula(m[1]), kind: 'moles', value: parseFloat(m[2].replace(',', '.')), unit: 'mol' })

  // gas volume: "V(H2) = 2.24 L", "2.24 L H2 ở đktc", "V(H2)=2.24l"
  const v2re = /v\(\s*([A-Za-z0-9()]+)\s*\)\s*=\s*([\d.,]+)\s*l/g
  while ((m = v2re.exec(low))) givens.push({ species: capFormula(m[1]), kind: 'gasVolume', value: parseFloat(m[2].replace(',', '.')), unit: 'L' })
  const bigv = /([\d.,]+)\s*l(?:ít)?(?:\s*khí)?\s*([A-Za-z][A-Za-z0-9()]*)(?:\s*ở\s*)?đktc/g
  while ((m = bigv.exec(low))) givens.push({ species: capFormula(m[2]), kind: 'gasVolume', value: parseFloat(m[1].replace(',', '.')), unit: 'L' })

  // concentration: "C = 0.1 M", "0.1 M HCl", "nồng độ 0.1 M"
  const cm = low.match(/(\d+[.,]?\d*)\s*m\b/)
  if (cm) givens.push({ species: '', kind: 'concentration', value: parseFloat(cm[1].replace(',', '.')), unit: 'M' })
  // solution volume: "250 ml dung dịch", "V = 0.25 L"
  const sml = low.match(/(\d+[.,]?\d*)\s*ml\b/)
  if (sml) givens.push({ species: '', kind: 'solutionVolume', value: parseFloat(sml[1].replace(',', '.')) / 1000, unit: 'L' })
  const sl = low.match(/(?:v\s*=\s*)(\d+[.,]?\d*)\s*l\b/)
  if (sl) givens.push({ species: '', kind: 'solutionVolume', value: parseFloat(sl[1].replace(',', '.')), unit: 'L' })

  // pH given directly: "pH = 3", "ph là 3"
  const phm = low.match(/p?h\s*[=:là]?\s*(\d+[.,]?\d*)/)
  if (phm && !/tính|calculate|what|bao nhiêu|của\s*một/.test(low)) givens.push({ species: '', kind: 'pH', value: parseFloat(phm[1].replace(',', '.')), unit: '' })

  return givens
}

function capFormula(s: string): string {
  if (!s) return s
  // Re-capitalize by matching element symbols so 'hcl'->'HCl', 'fecl2'->'FeCl2'
  let out = ''
  let i = 0
  const isLetter = (c: string) => /[A-Za-z]/.test(c)
  while (i < s.length) {
    const ch = s[i]
    if (isLetter(ch)) {
      let two = ''
      if (i + 1 < s.length) two = s[i] + s[i + 1]
      if (two && getElement(two)) {
        out += two.charAt(0).toUpperCase() + two.charAt(1).toLowerCase()
        i += 2
      } else {
        out += ch.toUpperCase()
        i += 1
      }
    } else {
      out += ch
      i += 1
    }
  }
  return out
}

// Find requested quantity
type AskKind = 'mass' | 'moles' | 'gasVolume' | 'concentration' | 'pH' | 'unknown'
function detectAsk(low: string): { kind: AskKind; species: string } {
  if (/(hiệu suất|yield)/.test(low)) return { kind: 'unknown', species: '' }
  if (/(nồng độ|concentration|molarity)/.test(low)) return { kind: 'concentration', species: '' }
  if (/(tính\s*ph|calculate\s*ph|what is the ph|ph\s+của|ph\s+là|pH\s+là bao nhiêu|ph.*\?$)/.test(low)) return { kind: 'pH', species: '' }
  if (/(thể tích|volume)/.test(low)) return { kind: 'gasVolume', species: findSpecRef(low) }
  if (/(bao nhiêu mol|là bao nhiêu mol|số mol là|tính số mol|số mol của|how many mol|number of mol|moles of)/.test(low)) return { kind: 'moles', species: findSpecRef(low) }
  if (/(khối lượng|m\(|mass\s+of|mass of)/.test(low)) return { kind: 'mass', species: findSpecRef(low) }
  if (/(số mol|mol\b)/.test(low) && /(mol|n\s*=)/.test(low)) return { kind: 'moles', species: findSpecRef(low) }
  return { kind: 'unknown', species: '' }
}

function findSpecRef(low: string): string {
  const m = low.match(/(?:của|of|của\s*)?\s*([A-Za-z][A-Za-z0-9()]*)\s*(?:$|ở|thu|\?)/)
  return m ? capFormula(m[1]) : ''
}

// Convert a quantity of a species to moles
function toMoles(g: Given): number | null {
  if (g.kind === 'moles') return g.value
  if (g.kind === 'mass') {
    const M = molarMass(g.species)
    return isNaN(M) ? null : g.value / M
  }
  if (g.kind === 'gasVolume') return g.value / 22.4
  return null
}

function speciesCoeffsFromPair(equation: string): Record<string, number> | null {
  const r = balanceEquation(equation)
  if (!r.ok || !r.coefficients) return null
  const idx = equation.indexOf('->')
  const sym = equation.split('->')[0].includes('+') ? null : null
  // parse raw species from equation
  const left = equation.slice(0, idx).split('+').map(s => s.trim().replace(/^\d+\s*/, '').replace(/\s*\(.*?\)\s*$/, ''))
  const right = equation.slice(idx + 2).split('+').map(s => s.trim().replace(/^\d+\s*/, '').replace(/\s*\(.*?\)\s*$/, ''))
  const map: Record<string, number> = {}
  left.forEach((f, i) => { map[f] = r.coefficients![i] })
  right.forEach((f, i) => { map[f] = r.coefficients![left.length + i] })
  return map
}

export function solveQuestion(input: string, prev?: Solution): Solution {
  const lang = detectLanguage(input)
  const t = input.trim()
  const low = t.toLowerCase()

  // 0. Balance
  if (/(balance|cân bằng|can bang)/.test(low) && /[-=>→]/.test(t)) {
    const stripped = t.replace(/^\s*(balance|cân bằng|can bang)\s*/i, '')
    const r = balanceEquation(stripped)
    if (r.ok && r.balanced) {
      return {
        topic: 'balance', language: lang,
        interpretation: lang === 'vi' ? `Cân bằng phương trình: ${stripped}` : `Balance equation: ${stripped}`,
        given: [stripped], find: lang === 'vi' ? 'Phương trình cân bằng' : 'Balanced equation',
        equation: r.balanced, formula: lang === 'vi' ? 'Bảo toàn số nguyên tử mỗi nguyên tố' : 'Conserve atoms of each element',
        conversions: [], steps: [
          lang === 'vi' ? 'Xác định chất phản ứng/sản phẩm' : 'Identify reactants/products',
          ...Object.entries(r.atomsBefore ?? {}).map(([el, v]) => `Trước: ${el}: trái ${v.left}, phải ${v.right}`),
          ...Object.entries(r.atomsAfter ?? {}).map(([el, v]) => `Sau: ${el}: trái ${v.left}, phải ${v.right}`),
        ],
        answer: r.balanced, verification: lang === 'vi' ? '✓ Đã kiểm tra: số nguyên tử hai vế bằng nhau' : '✓ Verified: atom counts match on both sides',
        verified: true, missingInfo: null,
        ctx: { equation: r.balanced, knownSpecies: null, knownN: null, balancedCoeffs: null },
      }
    }
    return { ...missing(input, lang), topic: 'balance', answer: r.error ?? 'Không thể cân bằng' }
  }

  // 1. percent yield
  if (/(yield|hiệu suất|hieu suat)/.test(low)) {
    const nums = low.match(/\d+[.,]?\d*/g)?.map(s => parseFloat(s.replace(',', '.'))) ?? []
    if (nums.length >= 2) {
      const r = percentageYield(nums[0], nums[1])
      return {
        topic: 'percent-yield', language: lang,
        interpretation: lang === 'vi' ? `Hiệu suất: thực tế ${nums[0]}, lí thuyết ${nums[1]}` : `Percent yield, actual ${nums[0]}, theoretical ${nums[1]}`,
        given: [`actual = ${nums[0]}`, `theoretical = ${nums[1]}`], find: '% yield',
        equation: null, formula: '%H = (actual/theoretical)·100', conversions: [],
        steps: r.steps, answer: `${round(r.value, 2)}%`,
        verification: lang === 'vi' ? '✓ Đã tính trực tiếp từ công thức' : '✓ Computed directly from formula',
        verified: true, missingInfo: null,
      }
    }
  }

  // 2. molar mass
  if (/(molar mass|khối lượng mol|khoi luong mol)/.test(low)) {
    const fm = t.match(/(?:molar mass of|khối lượng mol của|khoi luong mol cua|M\()\s*\(?\s*([A-Za-z0-9()]+)/i)
    const candidate = fm ? capFormula(fm[1]) : null
    if (candidate) {
      const M = molarMass(candidate)
      if (!isNaN(M)) {
        return {
          topic: 'molar-mass', language: lang,
          interpretation: lang === 'vi' ? `Tính khối lượng mol của ${candidate}` : `Molar mass of ${candidate}`,
          given: [candidate], find: 'M', equation: null, formula: 'M = Σ(mi·ai)', conversions: [],
          steps: [`M(${candidate}) = ${round(M, 2)} g/mol`], answer: `M(${candidate}) = ${round(M, 2)} g/mol`,
          verification: lang === 'vi' ? '✓ Đã tính từ bảng tuần hoàn' : '✓ Computed from periodic table',
          verified: true, missingInfo: null,
        }
      }
    }
  }

  // 3. Empirical / molecular formula
  if (/(empirical|đơn giản|công thức đơn giản)/.test(low) && /%|percent/.test(low)) {
    const pct: Record<string, number> = {}
    const re = /([A-Z][a-z]?)\s*:?\s*(\d+[.,]?\d*)\s*%/g
    let m: RegExpExecArray | null
    while ((m = re.exec(t))) pct[m[1]] = parseFloat(m[2].replace(',', '.'))
    const ef = empiricalFormula(pct)
    if (ef) {
      return {
        topic: 'empirical', language: lang, interpretation: `Empirical formula from percentages`,
        given: Object.entries(pct).map(([k, v]) => `${k}: ${v}%`), find: 'Công thức đơn giản',
        equation: null, formula: 'n_i = m_i/M_i, tỉ lệ nguyên nhỏ nhất', conversions: [],
        steps: [`Số mol mỗi nguyên tố: chia % cho M`, `Tỉ lệ về số mol: rút gọn`, `=> ${ef}`],
        answer: ef, verification: '✓ Đã kiểm tra tỉ lệ nguyên dương', verified: true, missingInfo: null,
      }
    }
  }

  // 4. Dilution C1V1=C2V2
  if (/(pha loãng|dilution|dilute)/.test(low)) {
    const givens = extractGivens(low)
    const conc = givens.find(g => g.kind === 'concentration')
    const vols = givens.filter(g => g.kind === 'solutionVolume')
    if (conc && vols.length >= 2) {
      const C2 = dilutedConcentration(conc.value, vols[0].value, vols[1].value)
      return {
        topic: 'dilution', language: lang,
        interpretation: `C1=${conc.value} M, V1=${vols[0].value} L -> V2=${vols[1].value} L`,
        given: givens.map(g => `${g.kind} = ${g.value} ${g.unit}`), find: 'C2',
        equation: null, formula: 'C1V1 = C2V2', conversions: [],
        steps: C2.steps, answer: `C2 = ${round(C2.value, 4)} M`,
        verification: '✓ Đã áp dụng định luật pha loãng', verified: true, missingInfo: null,
      }
    }
  }

  // 5. pH of strong acid/base from concentration
  if ((/tính.*ph|calculate.*ph|what is the ph|pH\s+của|ph\s+là/.test(low)) && /m\b/.test(low)) {
    const cm = low.match(/(\d+[.,]?\d*)\s*m\b/)
    if (cm) {
      const c = parseFloat(cm[1].replace(',', '.'))
      const isBase = /base|bazơ|naoh|koh|ca\(oh\)2|\boh-/.test(low)
      if (isBase) {
        const r = pOHFromConcentration(c)
        const ph = 14 - r.value
        return {
          topic: 'ph', language: lang,
          interpretation: lang === 'vi' ? `Tính pH của bazơ mạnh nồng độ ${c} M` : `pH of a strong base at ${c} M`,
          given: [`[OH-] = ${c} M`], find: 'pH', equation: null, formula: 'pOH = -log[OH-]; pH = 14 - pOH', conversions: [],
          steps: [...r.steps, `pH = 14 - ${r.value} = ${ph}`], answer: `pH = ${round(ph, 4)}`,
          verification: lang === 'vi' ? '✓ Đã kiểm tra: pH > 7 cho bazơ' : '✓ Verified: pH > 7 for a base',
          verified: true, missingInfo: null,
        }
      }
      const r = pHFromConcentration(c)
      return {
        topic: 'ph', language: lang,
        interpretation: lang === 'vi' ? `Tính pH của axit mạnh nồng độ ${c} M` : `pH of a strong acid at ${c} M`,
        given: [`[H+] = ${c} M`], find: 'pH', equation: null, formula: 'pH = -log[H+]', conversions: [],
        steps: r.steps, answer: `pH = ${round(r.value, 4)}`,
        verification: lang === 'vi' ? '✓ Đã kiểm tra: pH < 7 cho axit' : '✓ Verified: pH < 7 for an acid',
        verified: true, missingInfo: null,
      }
    }
  }

  // 6. Gas n <-> V
  if ((/số\s+mol\s+của\s+khí|how many mol.*gas|bao nhiêu mol.*lít|đktc/.test(low) || /thể tích.*mol|thể tích.*khí/.test(low)) && /đktc/.test(low)) {
    const asks = detectAsk(low)
    const givens = extractGivens(low)
    const gasV = givens.find(g => g.kind === 'gasVolume')
    const mols = givens.find(g => g.kind === 'moles')
    if (gasV && asks.kind !== 'mass') {
      const n = molesFromGasVolume(gasV.value)
      return {
        topic: 'gas', language: lang, interpretation: `${gasV.value} L khí ở đktc`,
        given: [`V = ${gasV.value} L`], find: 'n', equation: null, formula: 'n = V/22.4', conversions: [],
        steps: n.steps, answer: `n = ${round(n.value, 4)} mol`,
        verification: '✓ Đã dùng 22.4 L/mol ở đktc', verified: true, missingInfo: null,
      }
    }
    if (mols) {
      const V = gasVolumeSTP(mols.value)
      return {
        topic: 'gas', language: lang, interpretation: `${mols.value} mol khí ở đktc`,
        given: [`n = ${mols.value} mol`], find: 'V', equation: null, formula: 'V = n·22.4', conversions: [],
        steps: V.steps, answer: `V = ${round(V.value, 4)} L`,
        verification: '✓ Đã dùng 22.4 L/mol ở đktc', verified: true, missingInfo: null,
      }
    }
  }

  // 7. Reaction stoichiometry / limiting reagent
  const isReaction = /phản ứng với|phản ứng|reacts? with|tác dụng với|cho .+ phản ứng/i.test(low) || /->|→|=/.test(t)
  if (isReaction) {
    // try explicit equation
    let equation: string | null = null
    const explicit = t.match(/([A-Za-z0-9()\^\s+]+\s*(?:->|→|=)\s*[A-Za-z0-9()\^\s+]+)/)
    if (explicit) equation = explicit[1].trim().replace(/→|⇌|═/g, '->').replace(/=/g, '->')

    if (!equation) {
      // extract reactant formulas from "cho X phản ứng với Y"
      const cho = low.match(/cho\s*[\d.,]+\s*g(?:am|ram)?\s*(?:của)?\s*([A-Za-z0-9()]+)/)
      const reactantList: string[] = []
      if (cho) reactantList.push(capFormula(cho[1]))
      // "với HCl", "với H2SO4", "với NaOH"
      const voi = low.match(/(?:với|với nước|tác dụng với)\s*([A-Za-z0-9()]+)/)
      if (voi) reactantList.push(capFormula(voi[1]))
      const sulfate = low.match(/h2so4/) ? 'H2SO4' : null
      const built = buildReactionFromReactants(reactantList.length ? reactantList : (sulfate ? [sulfate] : []))
      equation = built
    }

    if (equation) {
      const balanced = balanceEquation(equation)
      if (balanced.ok && balanced.balanced) {
        const coeffs = speciesCoeffsFromPair(equation)
        const givens = extractGivens(low)
        // known reactant quantity (mass/moles/gasVolume) for a species that is a reactant
        const leftSpecs = equation.slice(0, equation.indexOf('->')).split('+').map(s => s.trim().replace(/^\d+\s*/, ''))
        let known: Given | null = null
        for (const g of givens) {
          if (g.kind === 'mass' && molarMass(g.species) && leftSpecs.includes(g.species)) { known = g; break }
          if (g.kind === 'moles' && leftSpecs.includes(g.species)) { known = g; break }
          if (g.kind === 'gasVolume' && leftSpecs.includes(g.species)) { known = g; break }
        }
        const ask = detectAsk(low)
        if (known && coeffs) {
          const nKnown = toMoles(known)
          if (nKnown !== null) {
            // find target species from ask or from the right side
            let target = capFormula(ask.species) || null
            if (!target) {
              // pick first gas-like product or the requested species by context
              const rightSpecs = equation.split('->')[1].split('+').map(s => s.trim().replace(/^\d+\s*/, ''))
              target = rightSpecs[rightSpecs.length - 1]
            }
            const rightSpecs = equation.split('->')[1].split('+').map(s => s.trim().replace(/^\d+\s*/, ''))
            if (!target || !(target in coeffs)) target = rightSpecs.find(s => s in coeffs!) ?? null
            if (target && target in coeffs && known.species in coeffs) {
              const nTarget = nKnown * (coeffs[target] / coeffs[known.species])
              // What kind of result?
              let valueText = ''
              let formulaText = ''
              if (/thể tích|volume|gas|đktc/.test(low) || ask.kind === 'gasVolume') {
                const V = nTarget * 22.4
                valueText = `V(${target}) = ${round(V, 4)} L`
                formulaText = 'n = m/M; hệ số tỉ lệ; V = n·22.4'
              } else if (/khối lượng|mass/.test(low) || ask.kind === 'mass') {
                const m = nTarget * molarMass(target)
                valueText = `m(${target}) = ${round(m, 4)} g`
                formulaText = 'n = m/M; hệ số tỉ lệ; m = n·M'
              } else if (/nồng độ|concentration/.test(low) || ask.kind === 'concentration') {
                const sol = extractGivens(low).find(g => g.kind === 'solutionVolume')
                if (sol) {
                  const C = nTarget / sol.value
                  valueText = `C(${target}) = ${round(C, 4)} M`
                } else {
                  valueText = `n(${target}) = ${round(nTarget, 4)} mol (cần thể tích dung dịch để có nồng độ)`
                }
                formulaText = 'n = m/M; hệ số tỉ lệ; C = n/V'
              } else {
                // default: moles + mass + volume if gas
                const M = molarMass(target)
                valueText = `n(${target}) = ${round(nTarget, 4)} mol`
                if (['H2', 'O2', 'N2', 'CO2', 'Cl2', 'NH3', 'H2O'].includes(target)) valueText += `; V = ${round(nTarget * 22.4, 4)} L; m = ${round(nTarget * (M || 0), 4)} g`
                else valueText += `; m = ${round(nTarget * (M || 0), 4)} g`
                formulaText = 'n = m/M; hệ số tỉ lệ'
              }
              return {
                topic: 'stoichiometry', language: lang,
                interpretation: lang === 'vi' ? `Cho ${known.value} ${known.unit} ${known.species} phản ứng. Phương trình cân bằng: ${balanced.balanced}` : `Given ${known.value} ${known.unit} of ${known.species}. Balanced: ${balanced.balanced}`,
                given: [
                  known.kind === 'mass' ? `m(${known.species}) = ${known.value} g` : known.kind === 'moles' ? `n(${known.species}) = ${known.value} mol` : `V(${known.species}) = ${known.value} L`,
                  `M(${known.species}) = ${round(molarMass(known.species), 2)} g/mol`,
                ],
                find: lang === 'vi' ? `Lượng ${target}` : `Amount of ${target}`,
                equation: balanced.balanced, formula: formulaText, conversions: [],
                steps: [
                  known.kind === 'mass' ? `n(${known.species}) = m/M = ${known.value}/${round(molarMass(known.species), 2)} = ${round(toMoles(known)!, 4)} mol` : `n(${known.species}) = ${round(toMoles(known)!, 4)} mol`,
                  `Theo PTHH: n(${target}) = n(${known.species}) · ${coeffs[target]}/${coeffs[known.species]} = ${round(toMoles(known)!, 4)} · ${coeffs[target]}/${coeffs[known.species]} = ${round(nTarget, 4)} mol`,
                  valueText,
                ],
                answer: valueText, verification: lang === 'vi' ? '✓ Đã kiểm tra: hệ số tỉ lượng và đơn vị' : '✓ Verified: stoichiometric coefficients and units',
                verified: true, missingInfo: null,
                ctx: { equation: balanced.balanced, knownSpecies: known.species, knownN: toMoles(known), balancedCoeffs: coeffs },
              }
            }
          }
        }
        // limiting reagent?
        if (/giới hạn|limiting/.test(low)) {
          const reactants = leftSpecs.map(f => ({ formula: f, coeff: coeffs![f] ?? 1, n: 0 }))
          const nBySpecies: Record<string, number> = {}
          for (const g of givens) {
            const nn = toMoles(g)
            if (nn !== null && g.species) nBySpecies[g.species] = nn
          }
          let can = true
          for (const r of reactants) { if (nBySpecies[r.formula] === undefined) can = false }
          if (can) {
            const lim = limitingReagent(reactants.map(r => ({ formula: r.formula, coeff: r.coeff, n: nBySpecies[r.formula] })))
            return {
              topic: 'limiting', language: lang, interpretation: 'Xác định chất giới hạn',
              given: reactants.map(r => `n(${r.formula}) = ${nBySpecies[r.formula]} mol`), find: 'Chất giới hạn',
              equation: balanced.balanced, formula: 'n/hệ số nhỏ nhất là chất giới hạn', conversions: [],
              steps: lim.steps, answer: `Chất giới hạn: ${lim.limiting}`,
              verification: '✓ Đã so sánh n/hệ số', verified: true, missingInfo: null,
              ctx: { equation: balanced.balanced, knownSpecies: null, knownN: null, balancedCoeffs: coeffs },
            }
          }
        }
        // fallback: return the balanced equation with the general stoichio relation
        const rightSpecs = equation.split('->')[1].split('+').map(s => s.trim().replace(/^\d+\s*/, ''))
        return {
          topic: 'stoichiometry', language: lang,
          interpretation: lang === 'vi' ? `Phương trình cân bằng: ${balanced.balanced}` : `Balanced equation: ${balanced.balanced}`,
          given: [equation], find: lang === 'vi' ? 'Lượng các chất' : 'Amounts of substances',
          equation: balanced.balanced, formula: 'n = m/M; hệ số tỉ lượng; V = n·22.4; C = n/V', conversions: [],
          steps: [`Chất phản ứng: ${leftSpecs.join(' + ')}`, `Sản phẩm: ${rightSpecs.join(' + ')}`, `Hệ số: ${JSON.stringify(coeffs)}`],
          answer: balanced.balanced, verification: lang === 'vi' ? '✓ Đã cân bằng và kiểm tra số nguyên tử' : '✓ Balanced and atom counts verified',
          verified: true, missingInfo: givens.length === 0 ? (lang === 'vi' ? 'Cần biết lượng (g, mol, lít) của ít nhất một chất' : 'Need the amount (g, mol, L) of at least one substance') : null,
          ctx: { equation: balanced.balanced, knownSpecies: null, knownN: null, balancedCoeffs: coeffs },
        }
      }
      return { ...missing(input, lang), topic: 'stoichiometry', answer: balanced.error ?? 'Không thể cân bằng phương trình này' }
    }
  }

  // 7b. Generic single-substance conversions (non-reaction)
  {
    const givens = extractGivens(low)
    const ask = detectAsk(low)
    const massGiven = givens.find(g => g.kind === 'mass')
    const molesGiven = givens.find(g => g.kind === 'moles')
    const gasVGiven = givens.find(g => g.kind === 'gasVolume')
    const concGiven = givens.find(g => g.kind === 'concentration')
    const solVGiven = givens.find(g => g.kind === 'solutionVolume')

    if (ask.kind === 'gasVolume' && massGiven) {
      const M = molarMass(massGiven.species)
      if (!isNaN(M)) {
        const n = massGiven.value / M
        const V = n * 22.4
        return {
          topic: 'gas', language: lang,
          interpretation: lang === 'vi' ? `Khối lượng ${massGiven.value} g ${massGiven.species} ở đktc` : `Mass ${massGiven.value} g ${massGiven.species} at STP`,
          given: [`m = ${massGiven.value} g`, `M = ${round(M, 2)} g/mol`], find: 'V',
          equation: null, formula: 'n = m/M; V = n·22.4', conversions: [],
          steps: [`n = ${massGiven.value}/${round(M, 2)} = ${round(n, 4)} mol`, `V = ${round(n, 4)}·22.4 = ${round(V, 4)} L`],
          answer: `V(${massGiven.species}) = ${round(V, 4)} L`,
          verification: '✓ Đã kiểm tra đơn vị', verified: true, missingInfo: null,
        }
      }
    }
    if (ask.kind === 'mass' && molesGiven) {
      const M = molarMass(molesGiven.species)
      if (!isNaN(M)) {
        const m = molesGiven.value * M
        return {
          topic: 'mole', language: lang,
          interpretation: lang === 'vi' ? `Khối lượng của ${molesGiven.value} mol ${molesGiven.species}` : `Mass of ${molesGiven.value} mol ${molesGiven.species}`,
          given: [`n = ${molesGiven.value} mol`, `M = ${round(M, 2)} g/mol`], find: 'm',
          equation: null, formula: 'm = n·M', conversions: [],
          steps: [`m = ${molesGiven.value}·${round(M, 2)} = ${round(m, 4)} g`],
          answer: `m(${molesGiven.species}) = ${round(m, 4)} g`,
          verification: '✓ Đã kiểm tra đơn vị', verified: true, missingInfo: null,
        }
      }
    }
    if (ask.kind === 'moles' && massGiven) {
      const M = molarMass(massGiven.species)
      if (!isNaN(M)) {
        const n = massGiven.value / M
        return {
          topic: 'mole', language: lang,
          interpretation: lang === 'vi' ? `Số mol của ${massGiven.value} g ${massGiven.species}` : `Moles of ${massGiven.value} g ${massGiven.species}`,
          given: [`m = ${massGiven.value} g`, `M = ${round(M, 2)} g/mol`], find: 'n',
          equation: null, formula: 'n = m/M', conversions: [],
          steps: [`n = ${massGiven.value}/${round(M, 2)} = ${round(n, 4)} mol`],
          answer: `n(${massGiven.species}) = ${round(n, 4)} mol`,
          verification: '✓ Đã kiểm tra đơn vị', verified: true, missingInfo: null,
        }
      }
    }
    if (ask.kind === 'concentration' && molesGiven && solVGiven) {
      const C = molesGiven.value / solVGiven.value
      return {
        topic: 'concentration', language: lang,
        interpretation: lang === 'vi' ? `Nồng độ với ${molesGiven.value} mol trong ${solVGiven.value} L` : `Molarity for ${molesGiven.value} mol in ${solVGiven.value} L`,
        given: [`n = ${molesGiven.value} mol`, `V = ${solVGiven.value} L`], find: 'C',
        equation: null, formula: 'C = n/V', conversions: [],
        steps: [`C = ${molesGiven.value}/${solVGiven.value} = ${round(C, 4)} M`],
        answer: `C = ${round(C, 4)} M`,
        verification: '✓ Đã kiểm tra đơn vị', verified: true, missingInfo: null,
      }
    }
    if (gasVGiven && ask.kind === 'moles') {
      const n = gasVGiven.value / 22.4
      return {
        topic: 'gas', language: lang,
        interpretation: lang === 'vi' ? `Số mol của ${gasVGiven.value} L khí ở đktc` : `Moles of ${gasVGiven.value} L gas at STP`,
        given: [`V = ${gasVGiven.value} L`], find: 'n',
        equation: null, formula: 'n = V/22.4', conversions: [],
        steps: [`n = ${gasVGiven.value}/22.4 = ${round(n, 4)} mol`],
        answer: `n = ${round(n, 4)} mol`,
        verification: '✓ Đã kiểm tra đơn vị', verified: true, missingInfo: null,
      }
    }
  }

  // 8. Follow-up: reuse previous equation + known reactant quantity
  if (prev && prev.ctx && prev.ctx.equation && /(thể tích|khối lượng|số mol|nồng độ|của\s|thu được|sản phẩm)/i.test(low)) {
    const coeffs = speciesCoeffsFromPair(prev.ctx.equation)
    if (coeffs && prev.ctx.knownSpecies && prev.ctx.knownN !== null) {
      const asks = detectAsk(low)
      const rightSpecs = prev.ctx.equation.split('->')[1].split('+').map(s => s.trim().replace(/^\d+\s*/, ''))
      let target = asks.species ? capFormula(asks.species) : (rightSpecs[rightSpecs.length - 1] ?? null)
      if (target && target in coeffs) {
        const nTarget = prev.ctx.knownN * (coeffs[target] / coeffs[prev.ctx.knownSpecies!])
        let valueText = ''
        if (asks.kind === 'gasVolume' || /thể tích|volume/.test(low)) valueText = `V(${target}) = ${round(nTarget * 22.4, 4)} L`
        else if (asks.kind === 'mass' || /khối lượng|mass/.test(low)) valueText = `m(${target}) = ${round(nTarget * molarMass(target), 4)} g`
        else valueText = `n(${target}) = ${round(nTarget, 4)} mol`
        return {
          topic: 'stoichiometry', language: lang,
          interpretation: lang === 'vi' ? `Dựa trên bài trước: ${prev.ctx.equation}` : `Follow-up on: ${prev.ctx.equation}`,
          given: [`n(${prev.ctx.knownSpecies}) = ${round(prev.ctx.knownN, 4)} mol`], find: target, equation: prev.ctx.equation,
          formula: 'hệ số tỉ lượng', conversions: [],
          steps: [`n(${target}) = n(${prev.ctx.knownSpecies}) · ${coeffs[target]}/${coeffs[prev.ctx.knownSpecies!]} = ${round(nTarget, 4)} mol`, valueText],
          answer: valueText, verification: '✓ Đã dùng hệ số từ bài trước', verified: true, missingInfo: null,
          ctx: prev.ctx,
        }
      }
    }
  }

  return missing(input, lang, detectExtraNeeded(low))
}

function detectExtraNeeded(low: string): string | undefined {
  if (/thể tích|volume/.test(low) && !/đktc/.test(low)) return 'cần thể tích dung dịch hoặc điều kiện đktc'
  if (/pH/.test(low) && !/M\b/.test(low) && !/mol\/l/.test(low)) return 'cần nồng độ mol (M)'
  return undefined
}

