import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'
import { ClaimlyPage } from './pages/ClaimlyPage'
import { MedisyncPage } from './pages/MedisyncPage'
import { SizzlePage } from './pages/SizzlePage'

// three.js is only downloaded when someone opens Nighty.
const NightyPage = lazy(() => import('./pages/NightyPage').then((module) => ({ default: module.NightyPage })))

// A chunk that fails to load (offline, or stale after a redeploy) would otherwise blank the whole site.
const nightyFailed = (
  <main className="section-shell route-failed">
    <p>This page didn’t load. <a href="/work/nighty">Reload it</a> or go back to <a href="/#works">all works</a>.</p>
  </main>
)

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/work/claimly" element={<ClaimlyPage />} />
        <Route path="/work/medisync" element={<MedisyncPage />} />
        <Route path="/work/sizzle" element={<SizzlePage />} />
        <Route path="/work/nighty" element={<ErrorBoundary fallback={nightyFailed}><Suspense fallback={null}><NightyPage /></Suspense></ErrorBoundary>} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}
