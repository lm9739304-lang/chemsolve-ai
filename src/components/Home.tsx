import { useApp } from '../state/AppContext'
import { t } from '../i18n'
import React, { useState } from 'react'

const EXAMPLES = [
  'Balance KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O',
  'What is the pH of 0.01 M HCl?',
  'Cho 5.6g Fe phản ứng với HCl. Tính thể tích H2 ở đktc.',
  'Molar mass of H2SO4',
  'Actual yield is 8g and theoretical yield is 10g. Percentage yield?',
]

export default function Home() {
  const { lang, setRoute, setPrefill } = useApp()
  const [q, setQ] = useState('')
  const solve = (text: string) => { setPrefill(text); setRoute('solver') }
  return (
    <div>
      <section className="hero">
        <h1>{t('heroTitle', lang)}</h1>
        <p>{t('heroSub', lang)}</p>
        <div className="searchbox">
          <input
            aria-label={t('askPlaceholder', lang)}
            placeholder={t('askPlaceholder', lang)}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && q.trim()) solve(q) }}
          />
          <button className="btn" onClick={() => q.trim() && solve(q)}>{t('solve', lang)}</button>
        </div>
        <div className="btn-row">
          <button className="btn ghost" onClick={() => setRoute('solver')}>{t('upload', lang)}</button>
          <button className="btn ghost" onClick={() => solve('Balance H2 + O2 -> H2O')}>{t('balancer', lang)}</button>
        </div>
      </section>
      <h3 style={{ textAlign: 'center', marginTop: 24 }}>{t('examples', lang)}</h3>
      <div className="examples">
        {EXAMPLES.map(ex => (
          <button key={ex} className="chip" onClick={() => solve(ex)}>{ex}</button>
        ))}
      </div>
    </div>
  )
}
