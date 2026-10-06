import React, { useState, useCallback } from 'react'
import { useApp } from '../state/AppContext'
import { t } from '../i18n'
import { answerFor, applyAction, checkAnswer, ChatMessage, Mode } from '../ai/chat'
import AnswerCards from './AnswerCards'

export default function SolverPage() {
  const { lang, prefill, setPrefill, addHistory } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState(prefill)
  const [checking, setChecking] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pendingImage, setPendingImage] = useState<File | null>(null)

  React.useEffect(() => { if (prefill) { setInput(prefill); setPrefill('') } }, [prefill, setPrefill])

  const lastSolution = [...messages].reverse().find(m => m.solution)?.solution

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(ms => [...ms, { role: 'user', text }])
    if (checking) {
      setMessages(ms => [...ms, checkAnswer(lastSolution, text)])
      setChecking(false)
      return
    }
    const m = answerFor(text, 'full', lastSolution)
    setMessages(ms => [...ms, m])
    if (m.solution) addHistory({ input: text, topic: m.solution.topic, answer: m.solution.answer })
  }

  const action = (mode: Mode) => {
    if (!lastSolution) return
    const m = applyAction(lastSolution, mode)
    if (m) setMessages(ms => [...ms, m])
  }

  const onFile = (f: File | undefined | null) => {
    if (!f) return
    setPendingImage(f)
    const url = URL.createObjectURL(f)
    setImagePreview(url)
    setMessages(ms => [...ms, { role: 'user', text: `[image: ${f.name}]` }])
  }

  const runOcrAndSolve = async () => {
    if (!pendingImage) return
    setMessages(ms => [...ms, { role: 'bot', text: 'Processing image with OCR...' }])
    try {
      const { recognizeImage } = await import('../ocr/ocrService')
      const res = await recognizeImage(pendingImage)
      const note = res.needsConfirmation
        ? `OCR (${Math.round(res.confidence)}% confidence) — please confirm/edit: ${res.text}`
        : `OCR detected: ${res.text}`
      setMessages(ms => [...ms, { role: 'bot', text: note }])
      if (!res.needsConfirmation) {
        const m = answerFor(res.text, 'full', lastSolution)
        setMessages(ms => [...ms, m])
        if (m.solution) addHistory({ input: res.text, topic: m.solution.topic, answer: m.solution.answer })
      } else {
        setInput(res.text)
      }
    } catch {
      setMessages(ms => [...ms, { role: 'bot', text: 'OCR failed. Please type the problem text.' }])
    }
  }

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]) }}
      onPaste={e => { const f = e.clipboardData.files?.[0]; if (f) onFile(f) }}
    >
      <h2>{t('solver', lang)}</h2>
      <div className="chat" style={{ marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'user' ? m.text : (
              m.solution ? <AnswerCards solution={m.solution} mode={m.mode ?? 'full'} /> : <p>{m.text}</p>
            )}
          </div>
        ))}
      </div>

      {imagePreview && (
        <div className="card">
          <img src={imagePreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
          <button className="btn" onClick={runOcrAndSolve}>Run OCR & Solve</button>
        </div>
      )}

      <div className="msg-input-row">
        <input
          aria-label="question"
          placeholder={t('askPlaceholder', lang)}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { send(input); setInput('') } }}
        />
        <button className="btn" onClick={() => { send(input); setInput('') }}>{t('send', lang)}</button>
        <label className="btn ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>
          📷
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => onFile(e.target.files?.[0])} />
        </label>
      </div>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn ghost" onClick={() => setMessages([])}>{t('clear', lang)}</button>
        <button className="btn ghost" onClick={() => action('simpler')}>{t('simpler', lang)}</button>
        <button className="btn ghost" onClick={() => action('detailed')}>{t('detailed', lang)}</button>
        <button className="btn ghost" onClick={() => action('onlyAnswer')}>{t('onlyAnswer', lang)}</button>
        <button className="btn ghost" onClick={() => setChecking(true)}>{t('checkMine', lang)}</button>
        {lastSolution && (
          <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(lastSolution.answer)}>{t('copy', lang)}</button>
        )}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
        Drag & drop an image onto the page, or click 📷. Low-confidence OCR will ask you to confirm before solving.
      </p>
    </div>
  )
}
