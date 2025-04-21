import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Rates } from '@/pages/api/rates'
import { fetchRates } from '@/utils/apiClient'

// Define context type
const RatesContext = createContext<Rates | undefined>(undefined)

// Custom hook to consume RatesContext
export const useRates = () => {
  const context = useContext(RatesContext)
  if (context === undefined) {
    throw new Error('useRates must be used within a RatesProvider')
  }
  return context
}

// Props typing for provider
interface RatesProviderProps {
  children: ReactNode
}

// Provider component
export const RatesProvider = ({ children }: RatesProviderProps) => {
  const [rates, setRates] = useState<Rates | null>(null)

  useEffect(() => {
    fetchRates().then(setRates)
  }, [])

  return (
    <RatesContext.Provider value={rates}>
      {children}
    </RatesContext.Provider>
  )
}
