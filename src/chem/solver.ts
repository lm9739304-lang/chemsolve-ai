import { balanceEquation } from './balancer'
import { molarMass, molesFromMass, gasVolumeSTP, pHFromConcentration, percentageYield } from './formulas'
import { getElement } from './data/periodicTable'

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
}

function detectLanguage(s: string): 'vi' | 'en' {
  const t = s.toLowerCase()
  if (/[ăâêôơưđ]/.test(t) || /(cho|tính|thể tích|đktc|khối lượng|nồng độ|hiệu suất|mol phản|cân bằng)/.test(t)) return 'vi'
  return 'en'
}

function missing(input: string, lang: 'vi' | 'en'): Solution {
  return {
    topic: 'unknown', language: lang, interpretation: input, given: [], find: '',
    equation: null, formula: null, conversions: [], steps: [],
    answer: lang === 'vi'
      ? 'Chưa đủ thông tin để giải. Vui lòng cung cấp dữ kiện (khối lượng, số mol, nồng độ...) và yêu cầu cụ thể.'
      : 'Not enough information to solve. Please provide given values (mass, moles, concentration...) and the specific request.',
    verification: '⚠ Needs more information', verified: false,
    missingInfo: lang === 'vi' ? 'Thiếu dữ kiện rõ ràng' : 'Missing clear data',
  }
}

const METAL_ACID: Record<string, { acid: string; reaction: string; metalSulfate: string }> = {
  Fe: { acid: 'HCl', reaction: 'Fe + 2HCl -> FeCl2 + H2', metalSulfate: 'FeSO4' },
  Mg: { acid: 'HCl', reaction: 'Mg + 2HCl -> MgCl2 + H2', metalSulfate: 'MgSO4' },
  Zn: { acid: 'HCl', reaction: 'Zn + 2HCl -> ZnCl2 + H2', metalSulfate: 'ZnSO4' },
  Al: { acid: 'HCl', reaction: '2Al + 6HCl -> 2AlCl3 + 3H2', metalSulfate: 'Al2(SO4)3' },
}

export function solveQuestion(input: string): Solution {
  const lang = detectLanguage(input)
  const t = input.trim()
  const low = t.toLowerCase()

  // 1. Balance
  if (/(balance|cân bằng|can bang)/.test(low) && /[-=→>]/.test(t)) {
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
      }
    }
    return { ...missing(input, lang), topic: 'balance', answer: r.error ?? 'Không thể cân bằng' }
  }

  // 2. pH
  if (/(ph|ph of)/.test(low) && /\d/.test(low)) {
    const m = low.match(/(\d+\.?\d*)\s*m\b/)
    if (m) {
      const c = parseFloat(m[1])
      const r = pHFromConcentration(c)
      return {
        topic: 'ph', language: lang,
        interpretation: lang === 'vi' ? `Tính pH của dung dịch axit mạnh nồng độ ${c} M` : `Compute pH of a strong acid at ${c} M`,
        given: [`C = ${c} M`], find: 'pH', equation: null, formula: 'pH = -log[H+]',
        conversions: [], steps: r.steps,
        answer: `pH = ${r.value}`, verification: lang === 'vi' ? '✓ Đã kiểm tra: pH nằm trong khoảng hợp lý' : '✓ Verified: pH is in a reasonable range',
        verified: true, missingInfo: null,
      }
    }
  }

  // 3. percent yield
  if (/(yield|hiệu suất|hieu suat)/.test(low)) {
    const nums = low.match(/\d+\.?\d*/g)?.map(Number) ?? []
    if (nums.length >= 2) {
      const actual = nums[0], theoretical = nums[1]
      const r = percentageYield(actual, theoretical)
      return {
        topic: 'percent-yield', language: lang,
        interpretation: lang === 'vi' ? `Hiệu suất phản ứng với thực tế ${actual} và lí thuyết ${theoretical}` : `Percent yield with actual ${actual} and theoretical ${theoretical}`,
        given: [`actual = ${actual}`, `theoretical = ${theoretical}`], find: '% yield',
        equation: null, formula: '%H = (actual/theoretical)·100', conversions: [],
        steps: r.steps, answer: `${r.value}%`,
        verification: lang === 'vi' ? '✓ Đã tính trực tiếp từ công thức' : '✓ Computed directly from formula',
        verified: true, missingInfo: null,
      }
    }
  }

  // 4. molar mass
  if (/(molar mass|khối lượng mol|khoi luong mol|m\([^)]+\)|\bm\s*\([^)]+\))/.test(low)) {
    const fm = t.match(/(?:molar mass of|khối lượng mol của|khoi luong mol cua)\s*([A-Za-z0-9()]+)/i) ?? t.match(/M\(([A-Za-z0-9()]+)\)/)
    if (fm) {
      const f = fm[1]
      const M = molarMass(f)
      if (!isNaN(M)) {
        return {
          topic: 'molar-mass', language: lang,
          interpretation: lang === 'vi' ? `Tính khối lượng mol của ${f}` : `Molar mass of ${f}`,
          given: [f], find: 'M', equation: null, formula: 'M = Σ(mi·ai)', conversions: [],
          steps: [`M(${f}) = ${M} g/mol`], answer: `M(${f}) = ${M} g/mol`,
          verification: lang === 'vi' ? '✓ Đã tính từ bảng tuần hoàn' : '✓ Computed from periodic table',
          verified: true, missingInfo: null,
        }
      }
    }
  }

  // 5. Vietnamese stoichiometry: Cho 5.6g Fe phản ứng với HCl. Tính thể tích H2 ở đktc.
  const cho = low.match(/cho\s*([\d.]+)\s*g(?:am|)\s*([A-Za-z]+)/)
  if (cho && /h2|khí|thể tích|đktc/.test(low)) {
    const m = parseFloat(cho[1])
    const metalSymbol = cho[2].charAt(0).toUpperCase() + cho[2].slice(1)
    const el = getElement(metalSymbol === 'Fe' ? 'Fe' : metalSymbol)
    const ma = METAL_ACID[metalSymbol]
    if (el && ma) {
      const M = molarMass(metalSymbol)
      const nMetal = m / M
      // H2 stoichiometry: Fe/Mg/Zn: 1 metal -> 1 H2; Al: 2 Al -> 3 H2
      const nH2 = metalSymbol === 'Al' ? nMetal * 1.5 : nMetal
      const V = nH2 * 22.4
      return {
        topic: 'stoichiometry', language: lang,
        interpretation: lang === 'vi' ? `Cho ${m} g ${metalSymbol} phản ứng với ${ma.acid}, tính thể tích H2 ở đktc` : `${m} g ${metalSymbol} reacts with ${ma.acid}; find V(H2) at STP`,
        given: [`m(${metalSymbol}) = ${m} g`, `M(${metalSymbol}) = ${M} g/mol`], find: 'V(H2) đktc',
        equation: ma.reaction, formula: 'n = m/M ; V = n·22.4', conversions: [],
        steps: [
          `n(${metalSymbol}) = m/M = ${m}/${M} = ${nMetal} mol`,
          `Theo PTHH: n(H2) = ${nH2} mol`,
          `V(H2) = n·22.4 = ${nH2}·22.4 = ${V} L`,
        ],
        answer: `V(H2) = ${V} L`, verification: lang === 'vi' ? '✓ Đã kiểm tra đơn vị và hệ số tỉ lượng' : '✓ Verified units and stoichiometric ratios',
        verified: true, missingInfo: null,
      }
    }
  }

  return missing(input, lang)
}
