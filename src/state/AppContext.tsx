import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Lang } from '../i18n'

export type Theme = 'light' | 'dark'
export interface HistoryItem { input: string; topic: string; answer: string; ts: number }

interface AppState {
  theme: Theme
  lang: Lang
  history: HistoryItem[]
  route: string
  prefill: string
  setTheme: (t: Theme) => void
  setLang: (l: Lang) => void
  setRoute: (r: string) => void
  setPrefill: (s: string) => void
  addHistory: (item: Omit<HistoryItem, 'ts'>) => void
  clearHistory: () => void
}

const AppCtx = createContext<AppState>(null as unknown as AppState)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light')
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'vi')
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('history') || '[]') } catch { return [] }
  })
  const [route, setRoute] = useState('home')
  const [prefill, setPrefill] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])
  useEffect(() => { localStorage.setItem('history', JSON.stringify(history.slice(-50))) }, [history])

  const addHistory = (item: Omit<HistoryItem, 'ts'>) =>
    setHistory(h => [...h, { ...item, ts: Date.now() }].slice(-50))
  const clearHistory = () => setHistory([])

  return (
    <AppCtx.Provider value={{ theme, lang, history, route, prefill, setTheme, setLang, setRoute, setPrefill, addHistory, clearHistory }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp() { return useContext(AppCtx) }
