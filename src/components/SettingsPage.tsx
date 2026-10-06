import { useApp } from '../state/AppContext'
import { t } from '../i18n'

export default function SettingsPage() {
  const { theme, setTheme, lang, setLang } = useApp()
  return (
    <div>
      <h2>{t('settings', lang)}</h2>
      <div className="card">
        <h3>{t('theme', lang)}</h3>
        <button className="btn ghost" onClick={() => setTheme('light')}>{t('lightMode', lang)}</button>{' '}
        <button className="btn ghost" onClick={() => setTheme('dark')}>{t('darkMode', lang)}</button>
        <p>Current: {theme}</p>
      </div>
      <div className="card">
        <h3>{t('language', lang)}</h3>
        <button className="btn ghost" onClick={() => setLang('vi')}>Tiếng Việt</button>{' '}
        <button className="btn ghost" onClick={() => setLang('en')}>English</button>
        <p>Current: {lang}</p>
      </div>
    </div>
  )
}
