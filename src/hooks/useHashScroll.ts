import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useHashScroll() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    document.getElementById(hash.slice(1))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [hash, pathname])
}
