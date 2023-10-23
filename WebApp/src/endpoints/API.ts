/*
  Note on format:
  Integers will have to be stringified when passed in JSON.

  We could aso use bigint integrals with custom serializers:
  https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/BigInt#utilisation_avec_json
*/

export type Integer = string // integers are stored as string to avoid precisions errors
export type DollarCents = Integer // in $ cents
export type TokenDecimals = Integer // in decimals
export type UrlString = string // url
export type DateString = string // ISO string

/*****************************************/
/*************** ENDPOINTS ***************/
/*****************************************/

export type MiscellaneousEndpoint = () => Promise<MiscellaneousResponse>

// Endpoint used to display the Home page
export type HomeEndpoint = (params: {
  pageSize: number,
}) => Promise<HomeResponse>

// Endpoint used when the users scrolls
// To load one more pages
export type LoadMoreHomeEndpoint = (params: {
  type: 'collections' | 'coins',
  criteria: 'trending' | 'top' | 'byCap' | 'byVolume',
  page: number,
  pageSize: number,
}) => Promise<Collection[] | Coin[]>

// Endpoint used to load a page from an id
// Can be an operation (transfer or call),
// or an address (wallet, token, collection or contract)
export type ArtifactEndpoint = (params: {
  id: string,
  pageSize: number,
}) => Promise<TransferResponse | CallResponse | // operations
  WalletResponse | CoinResponse | CollectionResponse | ContractResponse> // addresses

// Endpoint to load more of history
// Sorted by date
export type LoadMoreHistoryEndpoint = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Operation[]>

export type LoadMoreWalletNonCertifiedTokens = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Token[]>

export type LoadMoreCoinHolders = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Holder[]>

export type LoadMoreCollectionItems = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Nft[]>

/*****************************************/
/************* UTILITARIES ***************/
/*****************************************/

export type Collection = {
  id: string,
  name: string,
  image: UrlString, // ?
  supply: Integer, // ?
  floorPrice: DollarCents, // ?
  topSale: DollarCents, // ?
  marketplaceLink: UrlString, // ?
}

export type Coin = {
  id: string,
  name: string,
  ticker: string,
  decimals: number,
  logo: UrlString, // ?
  lastPrice: DollarCents, // ?
  circulatingSupplyOnChain: TokenDecimals, // ?
  holders: Integer, // ?
}

export type Address = {
  id: string,
  // name is the best description of an address that we can have
  // it can be a domain name, social pseudo,
  // app or contract name, or by default the entire address
  name: string,
}

export type Holder = Address & {
  quantity: TokenDecimals,
}

export type Token = {
  coin: Coin,
  quantity: TokenDecimals,
  lastTransferDate: DateString,
}

export type Nft = {
  id: string,
  image: UrlString,
  name: string,
  lastSalePrice: DollarCents,
  collection: Collection,
  lastTransferDate: DateString,
}

export type Asset = Token | Nft

/*****************************************/
/********** ENDPOINTS RESPONSES **********/
/*****************************************/

export type MiscellaneousResponse = {
  rates: {
    "EUR/USD": DollarCents,
  },
  xtzPrice: DollarCents,
}

export type HomeResponse = {
  stats: {
    normalFee: TokenDecimals, // ?
    lastBlockNumber: Integer, // ?
    lastBlockDate: DateString, // ?
  },
  collections: {
    trending: Collection[], // paginated
    top: Collection[], // paginated
  },
  coins: {
    byCap: Coin[], // paginated
    byVolume: Coin[], // paginated
  },
}

export type Transfer = {
  id: string,
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  from: Address,
  to: Address,
  transferedAssets: {
    from: Address,
    to: Address,
    asset: Asset[],
  },
}

export type Call = Transfer & {
  contractName: string,
  functionName: string,
}

export type Operation = Transfer | Call

export type AbstractOperationResponse = {
  artifactType: 'transfer' | 'call',
  operation: Operation,
  fee: {
    value: DollarCents,
    nativeValue: TokenDecimals,
    burned: TokenDecimals,
  },
  history: {
    from: Operation[], // paginated
    to: Operation[], // paginated
  },
}

export type TransferResponse = AbstractOperationResponse & {
  artifactType: 'transfer',
  operation: Transfer,
}

export type CallResponse = AbstractOperationResponse & {
  artifactType: 'call',
  operation: Call,
}

export type WalletResponse = {
  artifactType: 'wallet',
  wallet: Address & {
    nativeBalance: TokenDecimals,
    totalValue: DollarCents,
    operationCount: Integer,
  },
  tokens: Token[], // sorted by value
  uncertifiedTokens: Token[], // paginated, sorted by last transfer date
  nfts: Nft[], // sorted by value
  history: Operation[], // paginated
}

export type CoinResponse = {
  artifactType: 'coin',
  coin: Coin & {
    yearlyTransfers: Integer, // number of transfers on chain
    yearlyVolume: Integer, // on chain, in decimals
  },
  holders: Holder[], // paginated, sorted by share
  history: Operation[], // paginated
  contract: ContractResponse,
}

export type CollectionResponse = {
  artifactType: 'collection',
  collection: Collection & {
  },
  items: Nft[], // paginated, sorted by last transaction
  saleHistory: {
    itemId: string,
    date: DateString,
    price: DollarCents,
  }[],
  history: Operation[], // paginated
  contract: ContractResponse,
}

export type ContractResponse = {
  artifactType: 'contract',
  contract: Address & {
    contractName: string,
    creationDate: DateString,
    creator: Address,
    operationCount: Integer, // since creation
    immutable: boolean,
    autonomous: boolean,
    averageFee: DollarCents,
    treasuryValue: DollarCents,
    auditCount: number,
    officialWebsite: UrlString,
  },
  history: Operation[], // paginated
}
