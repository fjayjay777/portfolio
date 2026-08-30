import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'
import { ClaimlyPage } from './pages/ClaimlyPage'
import { MedisyncPage } from './pages/MedisyncPage'
import { SizzlePage } from './pages/SizzlePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/me" element={<MePage />} />
      <Route path="/work/claimly" element={<ClaimlyPage />} />
      <Route path="/work/medisync" element={<MedisyncPage />} />
      <Route path="/work/sizzle" element={<SizzlePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
