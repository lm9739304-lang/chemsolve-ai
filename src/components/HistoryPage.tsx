import { useApp } from '../state/AppContext'

export default function HistoryPage() {
  const { history, clearHistory, setRoute, setPrefill } = useApp()
  return (
    <div>
      <h2>Lịch sử</h2>
      {history.length === 0 && <p>Chưa có lịch sử.</p>}
      <div className="tools-grid">
        {[...history].reverse().map((h, i) => (
          <button key={i} className="tool-card" onClick={() => { setPrefill(h.input); setRoute('solver') }}>
            <b>{h.topic}</b>
            <p>{h.input}</p>
            <small>{h.answer}</small>
          </button>
        ))}
      </div>
      {history.length > 0 && <button className="btn ghost" style={{ marginTop: 12 }} onClick={clearHistory}>Xóa lịch sử</button>}
    </div>
  )
}
