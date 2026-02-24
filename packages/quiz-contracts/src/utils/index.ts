export const getMockedRev = () => `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`

export const RLTC: {
  network: 'regtest'
  chain: 'LTC'
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

// Type guard functions for contract metadata validation
export const meta = {
  _id: (x: unknown): x is string => typeof x === 'string',
  _rev: (x: unknown): x is string => typeof x === 'string',
  _root: (x: unknown): x is string => typeof x === 'string',
  _owners: (x: unknown): x is string[] => Array.isArray(x),
  _satoshis: (x: unknown): x is bigint => typeof x === 'bigint',
}
