import { createContext, useState, useEffect, useContext } from 'react'
import { Rates } from '@/pages/api/rates'
import { fetchRates } from '@/utils/apiClient'

const RatesContext = createContext(undefined as Rates)

export const useRates = () => {
  const value = useContext(RatesContext)
  if (value === undefined) {
    throw new Error('useRates should be called inside RatesContext')
  }
  return value
}

export const RatesProvider = ({ children }) => {
  const [rates, setRates] = useState(null as Rates)

  useEffect(() => {
    fetchRates().then(setRates)
  }, [])

  return (
    <RatesContext.Provider value={rates}>
      {children}
    </RatesContext.Provider>
  )
}
