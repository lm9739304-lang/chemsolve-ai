import React, { useState } from 'react'
import { useApp } from '../state/AppContext'
import { t } from '../i18n'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { route, setRoute, theme, setTheme, lang, setLang } = useApp()
  const [open, setOpen] = useState(false)
  const items = [
    ['home', t('home', lang)], ['solver', t('solver', lang)], ['tools', t('tools', lang)],
    ['table', t('table', lang)], ['history', t('history', lang)], ['settings', t('settings', lang)],
  ]
  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setRoute('home')}>⚗ {t('brand', lang)}</button>
        <button className="menu-btn" aria-label="menu" onClick={() => setOpen(o => !o)}>☰</button>
        <nav className={`nav ${open ? 'open' : ''}`}>
          {items.map(([k, label]) => (
            <button key={k} className={`nav-item ${route === k ? 'active' : ''}`} onClick={() => { setRoute(k); setOpen(false) }}>{label}</button>
          ))}
        </nav>
        <div className="top-actions">
          <button aria-label="theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '🌙' : '☀️'}</button>
          <button aria-label="language" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}>{lang === 'vi' ? 'VI' : 'EN'}</button>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
