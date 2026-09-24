import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'
import { ClaimlyPage } from './pages/ClaimlyPage'
import { MedisyncPage } from './pages/MedisyncPage'
import { SizzlePage } from './pages/SizzlePage'

// three.js is only downloaded when someone opens Nighty.
const NightyPage = lazy(() => import('./pages/NightyPage').then((module) => ({ default: module.NightyPage })))

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
        <Route path="/work/nighty" element={<Suspense fallback={null}><NightyPage /></Suspense>} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}
