export type Integer = string // integers are stored as string to avoid precisions errors
export type TokenDecimals = Integer // in decimals
export type Dollars = number // in $
export type UrlString = string // url
export type DateString = string // ISO string

export type Account = {
  accountType: 'user' | 'baker' | 'ghostContract' | 'delegator' | 'contract' | 'asset',
  address: string,
  name: string,
  image: UrlString | null,
}

export type Asset = {
  assetType: 'nft',
  id: string,
  name: string,
  image: UrlString,
} | {
  assetType: 'coin',
  id: string | 'tezos',
  name: string,
  ticker: string,
  decimals: number,
  image: UrlString, // image is null when id = 'tezos'
}
