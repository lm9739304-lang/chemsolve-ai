import React, { useMemo, useState } from 'react'
import { allElements, Element } from '../chem/data/periodicTable'

const CATEGORY_COLORS: Record<string, string> = {
  'alkali': '#fda4af', 'alkaline': '#fdba74', 'transition': '#fde047', 'post-transition': '#bef264',
  'metalloid': '#6ee7b7', 'nonmetal': '#93c5fd', 'halogen': '#c4b5fd', 'noble': '#f0abfc',
  'lanthanide': '#f9a8d4', 'actinide': '#a5b4fc',
}

export default function PeriodicTable() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('')
  const [sel, setSel] = useState<Element | null>(null)
  const elements = allElements()
  const cats = useMemo(() => Array.from(new Set(elements.map(e => e.category))), [elements])

  const visible = elements.filter(e => {
    const matchQ = !q || e.symbol.toLowerCase().includes(q.toLowerCase()) || e.name.toLowerCase().includes(q.toLowerCase()) || String(e.number) === q
    const matchCat = !cat || e.category === cat
    return matchQ && matchCat
  })

  return (
    <div>
      <h2>Bảng tuần hoàn</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input aria-label="search element" placeholder="Search name/symbol/number" value={q} onChange={e => setQ(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--fg)' }} />
        <select aria-label="filter category" value={cat} onChange={e => setCat(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--fg)' }}>
          <option value="">All categories</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="pt-grid">
        {visible.map(e => (
          <button
            key={e.symbol}
            className="el"
            style={{ background: CATEGORY_COLORS[e.category] ?? '#e5e7eb', gridColumn: e.group ?? 'auto', gridRow: e.group == null ? (e.category === 'lanthanide' ? 9 : 10) : e.period }}
            onClick={() => setSel(e)}
            aria-label={e.name}
          >
            <b>{e.symbol}</b>
            <small>{e.number}</small>
          </button>
        ))}
      </div>
      {sel && (
        <div className="card" style={{ marginTop: 14 }}>
          <h3>{sel.name} ({sel.symbol}) — Z={sel.number}, M={sel.mass}</h3>
          <p>Group: {sel.group ?? 'f-block'} · Period: {sel.period} · Category: {sel.category}</p>
          <p>Cấu hình e: {sel.config}</p>
          <p>Số oxi hóa: {sel.oxidationStates.join(', ')}</p>
          <p>Đun nóng chảy: {sel.meltingPoint ?? '—'} °C · Sôi: {sel.boilingPoint ?? '—'} °C · Khối lượng riêng: {sel.density ?? '—'}</p>
          <p>Độ âm điện: {sel.electronegativity ?? '—'}</p>
          <p>Ứng dụng: {sel.uses}</p>
          <button className="btn ghost" onClick={() => setSel(null)}>Đóng</button>
        </div>
      )}
    </div>
  )
}
