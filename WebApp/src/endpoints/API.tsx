/*
  Note on format:
  BigInts will have to be stringified when passed in JSON:
  https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/BigInt#utilisation_avec_json
*/

export type DollarCents = BigInt // in $ cents
export type TokenDecimals = BigInt // in decimals
export type UrlString = string // url
export type DateString = string // ISO string

/*****************************************/
/*************** ENDPOINTS ***************/
/*****************************************/

export type MiscellaneousEndpoint = () => MiscellaneousResponse

// Endpoint used to display the Home page
export type HomeEndpoint = (params: {
  pageSize: BigInt,
}) => HomeResponse

// Endpoint used when the users scrolls
// To load one more pages
export type LoadMoreHomeEndpoint = (params: {
  type: 'collections' | 'coins',
  criteria: 'trending' | 'top' | 'byCap' | 'byVolume',
  page: BigInt,
  pageSize: BigInt,
}) => Collection[] | Coin[]

// Endpoint used to load a page from an id
// Can be an operation (transfer or call),
// or an address (wallet, token, collection or contract)
export type ArtifactEndpoint = (params: {
  id: string,
  pageSize: BigInt,
}) => TransferResponse | CallResponse | // operations
  WalletResponse | CoinResponse | CollectionResponse | ContractResponse // addresses

// Endpoint to load more of history
// Sorted by date
export type LoadMoreHistoryEndpoint = (params: {
  id: string,
  page: BigInt,
  pageSize: BigInt,
}) => Operation[]

export type LoadMoreWalletNonCertifiedTokens = (params: {
  id: string,
  page: BigInt,
  pageSize: BigInt,
}) => Token[]

export type LoadMoreCoinHolders = (params: {
  id: string,
  page: BigInt,
  pageSize: BigInt,
}) => Holder[]

export type LoadMoreCollectionItems = (params: {
  id: string,
  page: BigInt,
  pageSize: BigInt,
}) => Nft[]

/*****************************************/
/************* UTILITARIES ***************/
/*****************************************/

export type Collection = {
  id: string,
  image: UrlString,
  name: string,
  supply: BigInt,
  floorPrice: DollarCents,
  topSale: DollarCents,
  marketplaceLink: UrlString,
}

export type Coin = {
  id: string,
  logo: UrlString,
  name: string,
  ticker: string,
  decimals: BigInt,
  lastPrice: DollarCents,
  circulatingSupplyOnChain: TokenDecimals,
  holders: BigInt,
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
}

export type Nft = {
  id: string,
  image: UrlString,
  name: string,
  lastSalePrice: DollarCents,
  collection: Collection,
}

export type Asset = Token | Nft

/*****************************************/
/********** ENDPOINTS RESPONSES **********/
/*****************************************/

export type MiscellaneousResponse = {
  rates: {
    "EUR/USD": DollarCents,
  }
}

export type HomeResponse = {
  stats : {
    ethPrice: DollarCents,
    normalFee: DollarCents,
    lastBlockNumber: BigInt,
    lastBlockDate: DateString,
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
  artifactType: 'transfer' | 'call'
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
    operationCount: BigInt,
  },
  tokens: Token[], // sorted by value
  uncertifiedTokens: Token[], // paginated, sorted by last transfer date
  nfts: Nft[], // sorted by value
  history: Operation[], // paginated
}

export type CoinResponse = {
  artifactType: 'coin',
  coin: Coin & {
    yearlyTransfers: BigInt, // number of transfers on chain
    yearlyVolume: BigInt, // on chain, in decimals
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
    operationCount: BigInt, // since creation
    immutable: boolean,
    autonomous: boolean,
    averageFee: DollarCents,
    treasuryValue: DollarCents,
    auditCount: BigInt,
    officialWebsite: UrlString,
  },
  history: Operation[], // paginated
}
