import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/me" element={<MePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
