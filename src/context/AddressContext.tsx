import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Address } from '../types'
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage'

interface AddressContextValue {
  address: Address | null
  saveAddress: (address: Address) => void
  clearAddress: () => void
}

const AddressContext = createContext<AddressContextValue | null>(null)

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(() =>
    readStorage<Address | null>(STORAGE_KEYS.address, null)
  )

  useEffect(() => {
    writeStorage(STORAGE_KEYS.address, address)
  }, [address])

  function saveAddress(next: Address) {
    setAddress(next)
  }

  function clearAddress() {
    setAddress(null)
  }

  return (
    <AddressContext.Provider value={{ address, saveAddress, clearAddress }}>
      {children}
    </AddressContext.Provider>
  )
}

export function useAddress() {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error('useAddress debe usarse dentro de AddressProvider')
  return ctx
}
