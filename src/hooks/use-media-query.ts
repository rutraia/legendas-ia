import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Verificar o estado inicial
    setMatches(mediaQuery.matches)

    // Adicionar o listener para mudanças
    mediaQuery.addEventListener("change", handleChange)

    // Limpar o listener no unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
} 