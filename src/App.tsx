import Layout from './components/Layout'
import Home from './components/Home'
import SolverPage from './components/SolverPage'
import Tools from './components/Tools'
import PeriodicTable from './components/PeriodicTable'
import HistoryPage from './components/HistoryPage'
import SettingsPage from './components/SettingsPage'
import { useApp } from './state/AppContext'

export default function App() {
  const { route } = useApp()
  return (
    <Layout>
      {route === 'home' && <Home />}
      {route === 'solver' && <SolverPage />}
      {route === 'tools' && <Tools />}
      {route === 'table' && <PeriodicTable />}
      {route === 'history' && <HistoryPage />}
      {route === 'settings' && <SettingsPage />}
    </Layout>
  )
}
