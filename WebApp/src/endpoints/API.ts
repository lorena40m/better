/*
  Note on format:
  Integers will have to be stringified when passed in JSON.

  We could aso use bigint integrals with custom serializers:
  https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/BigInt#utilisation_avec_json
*/

export type Integer = string // integers are stored as string to avoid precisions errors
export type TokenDecimals = Integer // in decimals
export type Dollars = number // in $
export type UrlString = string // url
export type DateString = string // ISO string

/*****************************************/
/*************** ENDPOINTS ***************/
/*****************************************/

export type MiscellaneousEndpoint = ({}) => Promise<MiscellaneousResponse>

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
}) => Promise<ExtendedCollection[] | ExtendedCoin[]>

// Endpoint used to load a page from an id
// Can be an operation (transfer or call),
// or an address (wallet, token, collection or contract)
export type ArtifactEndpoint = (params: {
  id: string,
  pageSize: number,
}) => Promise<TransferResponse | CallResponse | // operations
  WalletResponse | CoinResponse | CollectionResponse | ContractResponse | // addresses
  NotFoundResponse>

// Endpoint to load more of history
// Sorted by date
export type LoadMoreHistoryEndpoint = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Operation[]>

export type LoadMoreWalletTokens = (params: {
  id: string,
  page: number,
  pageSize: number,
}) => Promise<Holding<Coin>[]>

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
  image: UrlString,
  floorPrice: Dollars,
}

export type ExtendedCollection = Collection & {
  topSale: Dollars,
  marketplaceLink: UrlString,
  supply: Integer,
}

export type Nft = {
  assetType: 'nft',
  id: string,
  tokenId: string,
  image: UrlString,
  name: string,
  lastSalePrice: Dollars,
  collection: Collection,
}

export type Coin = {
  assetType: 'coin',
  id: string | 'tezos',
  name: string,
  ticker: string,
  decimals: number,
  logo: UrlString,
  lastPrice: number,
}

export type ExtendedCoin = Coin & {
  circulatingSupplyOnChain: TokenDecimals,
  holders: Integer,
}

export type Asset = Coin | Nft

export type Address = {
  id: string,
  // name is the best description of an address that we can have
  // it can be a domain name, social pseudo,
  // app or contract name, or by default the entire address
  name: string | null,
}

export type Holder = Address & {
  quantity: TokenDecimals,
}

export type Holding<A extends Asset> = {
  asset: A,
  quantity: TokenDecimals,
  value: Dollars,
  lastTransferDate: DateString,
}

/*****************************************/
/********** ENDPOINTS RESPONSES **********/
/*****************************************/

export type MiscellaneousResponse = {
  rates: {
    "EUR/USD": Dollars,
  },
  xtzPrice: Dollars,
}

export type HomeResponse = {
  stats: {
    normalFee: TokenDecimals,
    lastBlockNumber: Integer,
    lastBlockDate: DateString,
  },
  collections: {
    trending: ExtendedCollection[], // paginated
    top: ExtendedCollection[], // paginated
  },
  coins: {
    byCap: ExtendedCoin[], // paginated
    byVolume: ExtendedCoin[], // paginated
  },
}

export type Operation = {
  id: string,
  operationType: 'transfer' | 'call' | 'contractCreation' | 'stakingOperation',
  stakingType: '',
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  from: Address,
  to: Address,
  functionName: string | null, // only for Call
  contractCreated: string | null,
  contractName: string | null,
  transferedAssets: {
    from: Address,
    to: Address,
    asset: Asset,
    quantity: TokenDecimals,
  }[],
  fee: {
    value: Dollars,
    nativeValue: TokenDecimals,
  },
}

export type MinimalTransfer = {
  id: string,
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  from: Address,
  to: Address,
  quantity: TokenDecimals,
}

export type OperationResponse = {
  artifactType: 'operation',
  operation: Operation,
  history: {
    from: Operation[], // paginated
    to: Operation[], // paginated
  },
}

export type WalletResponse = {
  artifactType: 'wallet',
  wallet: Address & {
    nativeBalance: TokenDecimals,
    totalValue: Dollars,
    operationCount: Integer,
  },
  tokens: Holding<Coin>[], // sorted by value
  nfts: Holding<Nft>[], // sorted by value
  history: Operation[], // paginated
}

export type CoinResponse = {
  artifactType: 'coin',
  coin: ExtendedCoin & {
    yearlyTransfers: Integer, // number of transfers on chain
    yearlyVolume: Integer, // on chain, in decimals
  },
  holders: Holder[], // paginated, sorted by share
  history: Operation[], // paginated
  contract: ContractResponse,
}

export type CollectionResponse = {
  artifactType: 'collection',
  collection: ExtendedCollection,
  items: Nft[], // paginated, sorted by last transaction
  saleHistory: {
    itemId: string,
    date: DateString,
    price: Dollars,
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
    averageFee: Dollars,
    treasuryValue: Dollars,
    officialWebsite: UrlString,
  },
  history: MinimalTransfer[], // paginated
}

export type NotFoundResponse = 'not-found'
