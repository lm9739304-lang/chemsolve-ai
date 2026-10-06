import React, { useState } from 'react'
import { t } from '../i18n'
import { useApp } from '../state/AppContext'
import { balanceEquation } from '../chem/balancer'
import { molarMass, molesFromMass, molarity, dilutedConcentration, pHFromConcentration, gasVolumeSTP, molesFromGasVolume, percentageYield, limitingReagent, empiricalFormula, molecularFormula, convertUnits, massFromMoles } from '../chem/formulas'

type ToolId = 'balance' | 'molarMass' | 'mole' | 'stoic' | 'conc' | 'dilution' | 'ph' | 'gas' | 'yield' | 'limiting' | 'oxidation' | 'redox' | 'empirical' | 'molecular' | 'mixing' | 'titration' | 'thermo' | 'electro' | 'units'

const TOOLS: { id: ToolId; vi: string; en: string }[] = [
  { id: 'balance', vi: 'Cân bằng phương trình', en: 'Equation Balancer' },
  { id: 'molarMass', vi: 'Khối lượng mol', en: 'Molar Mass Calculator' },
  { id: 'mole', vi: 'Số mol', en: 'Mole Calculator' },
  { id: 'stoic', vi: 'Tỉ lượng hóa học', en: 'Stoichiometry Calculator' },
  { id: 'conc', vi: 'Nồng độ', en: 'Concentration Calculator' },
  { id: 'dilution', vi: 'Pha loãng', en: 'Dilution Calculator' },
  { id: 'ph', vi: 'pH', en: 'pH Calculator' },
  { id: 'gas', vi: 'Khí (đktc)', en: 'Gas Calculator' },
  { id: 'yield', vi: 'Hiệu suất', en: 'Percentage Yield' },
  { id: 'limiting', vi: 'Chất giới hạn', en: 'Limiting Reagent' },
  { id: 'oxidation', vi: 'Số oxi hóa', en: 'Oxidation Number' },
  { id: 'redox', vi: 'Cân bằng oxi hóa khử', en: 'Redox Balancer' },
  { id: 'empirical', vi: 'Công thức đơn giản', en: 'Empirical Formula' },
  { id: 'molecular', vi: 'Công thức phân tử', en: 'Molecular Formula' },
  { id: 'mixing', vi: 'Trộn dung dịch', en: 'Solution Mixing' },
  { id: 'titration', vi: 'Chuẩn độ', en: 'Titration Calculator' },
  { id: 'thermo', vi: 'Nhiệt hóa học', en: 'Thermochemistry' },
  { id: 'electro', vi: 'Điện hóa', en: 'Electrochemistry' },
  { id: 'units', vi: 'Đổi đơn vị', en: 'Unit Converter' },
]

function Num({ label, v, set }: { label: string; v: string; set: (s: string) => void }) {
  return <label className="field"><span>{label}</span><input type="number" step="any" value={v} onChange={e => set(e.target.value)} /></label>
}
function TextF({ label, v, set }: { label: string; v: string; set: (s: string) => void }) {
  return <label className="field"><span>{label}</span><input value={v} onChange={e => set(e.target.value)} /></label>
}

export default function Tools() {
  const { lang } = useApp()
  const [sel, setSel] = useState<ToolId | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [out, setOut] = useState<string>('')
  const set = (k: string, v: string) => setInputs(p => ({ ...p, [k]: v }))

  const compute = () => {
    try {
      const g = (k: string) => inputs[k] ?? ''
      const n = (k: string) => parseFloat(g(k))
      let result = ''
      switch (sel) {
        case 'balance': { const r = balanceEquation(g('eq')); result = r.ok ? `✓ ${r.balanced}\n\n${r.verification ? 'Verified' : ''}` : `Error: ${r.error}`; break }
        case 'redox': { const r = balanceEquation(g('eq')); result = r.ok ? `✓ ${r.balanced}` : `Error: ${r.error}`; break }
        case 'molarMass': { const M = molarMass(g('f')); result = isNaN(M) ? 'Invalid formula' : `M(${g('f')}) = ${M} g/mol`; break }
        case 'mole': { const m = n('m'); const M = molarMass(g('f')); result = `n = ${m}/${M} = ${molesFromMass(m, M).value} mol`; break }
        case 'conc': { result = `C = n/V = ${n('n')}/${n('V')} = ${molarity(n('n'), n('V')).value} M`; break }
        case 'dilution': { result = `C2 = ${dilutedConcentration(n('C1'), n('V1'), n('V2')).value} M`; break }
        case 'ph': { result = `pH = ${pHFromConcentration(n('c')).value}`; break }
        case 'gas': { result = g('mode') === 'V2n' ? `n = ${molesFromGasVolume(n('V')).value} mol` : `V = ${gasVolumeSTP(n('n')).value} L`; break }
        case 'yield': { result = `%H = ${percentageYield(n('a'), n('t')).value}%`; break }
        case 'limiting': {
          const parts = g('reactants').split(';').map(s => s.trim()).filter(Boolean)
          const reactants = parts.map(p => { const [f, c, nn] = p.split(':'); return { formula: f, coeff: parseFloat(c), n: parseFloat(nn) } })
          const r = limitingReagent(reactants); result = `Chất giới hạn: ${r.limiting}\n${r.steps.join('\n')}`; break
        }
        case 'empirical': {
          const pct: Record<string, number> = {}
          g('pct').split(',').forEach(pair => { const [el, p] = pair.split(':'); if (el && p) pct[el.trim()] = parseFloat(p) })
          result = empiricalFormula(pct) || 'Invalid'; break
        }
        case 'molecular': { result = molecularFormula(g('ef'), n('M')); break }
        case 'mixing': { const n1 = n('n1'), V1 = n('V1'), n2 = n('n2'), V2 = n('V2'); result = `C = (n1+n2)/(V1+V2) = ${(n1 + n2) / (V1 + V2)} M`; break }
        case 'titration': { result = `C(acid) = C(base)·V(base)·n(base)/(V(acid)·n(acid)) = ${n('Cb') * n('Vb') * n('nb') / (n('Va') * n('na'))} M`; break }
        case 'thermo': { result = `ΔH = Σn·ΔH_f(products) - Σn·ΔH_f(reactants)\n= (${n('hp')}) - (${n('hr')}) = ${n('hp') - n('hr')} kJ`; break }
        case 'electro': { result = `n = Q/(z·F) = (I·t)/(z·F) = ${n('I') * n('t') / (n('z') * 96500)} mol`; break }
        case 'units': { const r = convertUnits(n('v'), g('from'), g('to')); result = isNaN(r.value) ? 'Unsupported' : `${r.value} ${r.unit}`; break }
        case 'oxidation': { result = 'Common oxidation states: H=+1, O=-2 (except peroxides -1), Na/K/Ag=+1, Ca/Mg/Zn/Ba=+2, Al=+3, F=-1, Cl/Br/I=-1 (with O, positive), Fe/Cu/Cr variable. Use the periodic table for element data.'; break }
        case 'stoic': { result = 'Use the Limiting Reagent or each single-product stoichiometry via the solver.'; break }
        default: result = ''
      }
      setOut(result)
    } catch (e) { setOut('Error: ' + (e as Error).message) }
  }

  if (!sel) {
    return (
      <div>
        <h2>{t('tools', lang)}</h2>
        <div className="tools-grid">
          {TOOLS.map(tool => (
            <button key={tool.id} className="tool-card" onClick={() => setSel(tool.id)}>
              <b>{lang === 'vi' ? tool.vi : tool.en}</b>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const selTool = TOOLS.find(t => t.id === sel)!
  return (
    <div>
      <button className="btn ghost" onClick={() => { setSel(null); setOut(''); setInputs({}) }}>← Back</button>
      <h2>{lang === 'vi' ? selTool.vi : selTool.en}</h2>
      <div className="card">
        {sel === 'balance' || sel === 'redox' ? <TextF label="Phương trình (vd: H2 + O2 -> H2O)" v={inputs.eq ?? ''} set={v => set('eq', v)} /> : null}
        {sel === 'molarMass' && <TextF label="Công thức (vd: H2SO4)" v={inputs.f ?? ''} set={v => set('f', v)} />}
        {sel === 'mole' && (<><TextF label="Công thức" v={inputs.f ?? ''} set={v => set('f', v)} /><Num label="Khối lượng (g)" v={inputs.m ?? ''} set={v => set('m', v)} /></>)}
        {sel === 'conc' && (<><Num label="n (mol)" v={inputs.n ?? ''} set={v => set('n', v)} /><Num label="V (L)" v={inputs.V ?? ''} set={v => set('V', v)} /></>)}
        {sel === 'dilution' && (<><Num label="C1 (M)" v={inputs.C1 ?? ''} set={v => set('C1', v)} /><Num label="V1 (L)" v={inputs.V1 ?? ''} set={v => set('V1', v)} /><Num label="V2 (L)" v={inputs.V2 ?? ''} set={v => set('V2', v)} /></>)}
        {sel === 'ph' && <Num label="[H+] (M)" v={inputs.c ?? ''} set={v => set('c', v)} />}
        {sel === 'gas' && (<><Num label="n (mol) hoặc V (L)" v={inputs.n ?? inputs.V ?? ''} set={v => { set('n', v); set('V', v) }} /></>)}
        {sel === 'yield' && (<><Num label="Thực tế" v={inputs.a ?? ''} set={v => set('a', v)} /><Num label="Lí thuyết" v={inputs.t ?? ''} set={v => set('t', v)} /></>)}
        {sel === 'limiting' && <TextF label="Dạng: H2:2:4 ; O2:1:3" v={inputs.reactants ?? ''} set={v => set('reactants', v)} />}
        {sel === 'empirical' && <TextF label="Phần trăm: C:40, H:6.67, O:53.33" v={inputs.pct ?? ''} set={v => set('pct', v)} />}
        {sel === 'molecular' && (<><TextF label="Công thức đơn giản" v={inputs.ef ?? ''} set={v => set('ef', v)} /><Num label="M (g/mol)" v={inputs.M ?? ''} set={v => set('M', v)} /></>)}
        {sel === 'mixing' && (<><Num label="n1" v={inputs.n1 ?? ''} set={v => set('n1', v)} /><Num label="V1" v={inputs.V1 ?? ''} set={v => set('V1', v)} /><Num label="n2" v={inputs.n2 ?? ''} set={v => set('n2', v)} /><Num label="V2" v={inputs.V2 ?? ''} set={v => set('V2', v)} /></>)}
        {sel === 'titration' && (<><Num label="C base" v={inputs.Cb ?? ''} set={v => set('Cb', v)} /><Num label="V base" v={inputs.Vb ?? ''} set={v => set('Vb', v)} /><Num label="n base" v={inputs.nb ?? ''} set={v => set('nb', v)} /><Num label="V acid" v={inputs.Va ?? ''} set={v => set('Va', v)} /><Num label="n acid" v={inputs.na ?? ''} set={v => set('na', v)} /></>)}
        {sel === 'thermo' && (<><Num label="Σn·ΔHf sản phẩm (kJ)" v={inputs.hp ?? ''} set={v => set('hp', v)} /><Num label="Σn·ΔHf phản ứng (kJ)" v={inputs.hr ?? ''} set={v => set('hr', v)} /></>)}
        {sel === 'electro' && (<><Num label="I (A)" v={inputs.I ?? ''} set={v => set('I', v)} /><Num label="t (s)" v={inputs.t ?? ''} set={v => set('t', v)} /><Num label="z (điện tử)" v={inputs.z ?? ''} set={v => set('z', v)} /></>)}
        {sel === 'units' && (<><Num label="Giá trị" v={inputs.v ?? ''} set={v => set('v', v)} /><TextF label="Từ (L,mL,g,kg)" v={inputs.from ?? ''} set={v => set('from', v)} /><TextF label="Đến" v={inputs.to ?? ''} set={v => set('to', v)} /></>)}
        {sel === 'oxidation' && <p>{out ? '' : 'Xem quy tắc số oxi hóa phổ biến bên dưới kết quả.'}</p>}
        <button className="btn" onClick={compute}>{t('solve', lang)}</button>
      </div>
      {out && <div className="card"><h3>Kết quả</h3><pre style={{ whiteSpace: 'pre-wrap' }}>{out}</pre></div>}
    </div>
  )
}

