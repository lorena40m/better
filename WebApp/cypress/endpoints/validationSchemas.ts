import { object, array, string, number, date, boolean } from 'yup'

const integerStringSchema = () => string().required().matches(/^\d+$/)
const dateStringSchema = () => string().required().matches(/^\d\d\d\d-\d\d-\d\dT\d\d-\d\d-\d\d/)
const addressSchema = () => object({
  id: string().required().matches(/^(tz)|(KT).{34}$/),
  name: string().required(),
}).required()
const collectionSchema = () => object({
  id: string().required(),
  image: string().required().url(),
  name: string().required(),
  supply: integerStringSchema(),
  floorPrice: integerStringSchema(),
  topSale: integerStringSchema(),
  marketplaceLink: string().required().url(),
}).required()
const coinSchema = () => object({
  id: string().required(),
  logo: string().required().url(),
  name: string().required(),
  ticker: string().required(),
  decimals: number().required(),
  lastPrice: integerStringSchema(),
  circulatingSupplyOnChain: integerStringSchema(),
  holders: integerStringSchema(),
}).required()
const holderSchema = () => addressSchema().concat(object({
  quantity: integerStringSchema(),
}).required())
const tokenSchema = () => object({
  coin: coinSchema(),
  quantity: integerStringSchema(),
  lastTransferDate: dateStringSchema(),
}).required()
const nftSchema = () => object({
  id: string().required().matches(/^KT.{34}#\d+$/),
  image: string().required().url(),
  name: string().required(),
  lastSalePrice: integerStringSchema(),
  collection: collectionSchema(),
  lastTransferDate: dateStringSchema(),
}).required()
const transferSchema = () => object({
  id: string().required(),
  status: string().required().matches(/(waiting)|(success)|(failure)/),
  date: dateStringSchema(),
  from: addressSchema(),
  to: addressSchema(),
  transferedAssets: object({
    from: addressSchema(),
    to: addressSchema(),
    asset: array().required().min(1).of(coinSchema()),
  }).required(),
}).required()
const callSchema = () => transferSchema().concat(object({
  contractName: string().required(),
  functionName: string().required(),
}).required())

export let homeResponseSchema = (params: { pageSize: number }) => object({
  stats: object({
    normalFee: integerStringSchema(),
    lastBlockNumber: integerStringSchema(),
    lastBlockDate: dateStringSchema(),
  }).required(),
  collections: object({
    trending: array().required().length(params.pageSize).of(collectionSchema()),
    top: array().required().length(params.pageSize).of(collectionSchema()),
  }).required(),
  coins: object({
    byCap: array().required().length(params.pageSize).of(coinSchema()),
    byVolume: array().required().length(params.pageSize).of(coinSchema()),
  }).required(),
}).required()

export let miscellaneousResponseSchema = () => object({
  rates: object({
    'EUR/USD': integerStringSchema(),
  }).required(),
  xtzPrice: integerStringSchema(),
})

const abstractOperationSchema = (params: { id: string, pageSize: number, }) => object({
  fee: object({
    value: integerStringSchema(),
    nativeValue: integerStringSchema(),
    burned: integerStringSchema(),
  }).required(),
  history: object({
    from: array().required().length(params.pageSize).of(transferSchema()),
    to: array().required().length(params.pageSize).of(transferSchema()),
  }).required(),
})

const historySchema = (params: { pageSize: number }) => array().required().length(params.pageSize).of(transferSchema())

export let transferResponseSchema = (params: { id: string, pageSize: number, }) =>
  abstractOperationSchema(params).concat(object({
    artifactType: string().required().matches(/^transfer$/),
    operation: transferSchema(),
  }).required())
export let callResponseSchema = (params: { id: string, pageSize: number, }) =>
  abstractOperationSchema(params).concat(object({
    artifactType: string().required().matches(/^call$/),
    operation: callSchema(),
  }).required())

export let walletResponseSchema = (params: { id: string, pageSize: number, }) => object({
  artifactType: string().required().matches(/^wallet$/),
  wallet: addressSchema().concat(object({
    nativeBalance: integerStringSchema(),
    totalValue: integerStringSchema(),
    operationCount: integerStringSchema(),
  }).required()),
  tokens: array().required().of(tokenSchema())
    .test('sorted by value', 'Tokens should be sorted by value',
      (tokens: any) => tokens.reduce((acc: any, token: any, index: any) =>
        acc && (index === tokens.length - 1 || (
          +token.quantity * +token.coin.lastPrice > +tokens[index + 1].quantity * +tokens[index + 1].coin.lastPrice
        )),
        true
      )
    ),
  uncertifiedTokens: array().required().length(params.pageSize).of(tokenSchema())
    .test('sorted by last transfer date', 'Tokens should be sorted by last transfer date',
      (tokens: any) => tokens.reduce((acc: any, token: any, index: any) =>
        acc && (index === tokens.length - 1 || (
          +token.lastTransferDate >= +tokens[index + 1].lastTransferDate
        )),
        true
      )
    ), // paginated, sorted by last transfer date
  nfts: array().required().of(nftSchema()), // sorted by value
  history: historySchema(params), // paginated
})

export let contractResponseSchema = (params: { id: string, pageSize: number, }) => object({
  artifactType: string().required().matches(/^contract$/),
  contract: addressSchema().concat(object({
    contractName: string().required(),
    creationDate: dateStringSchema(),
    creator: addressSchema(),
    operationCount: integerStringSchema(), // since creation
    immutable: boolean().required(),
    autonomous: boolean().required(),
    averageFee: integerStringSchema(),
    treasuryValue: integerStringSchema(),
    auditCount: number().required(),
    officialWebsite: string().required().url(),
  }).required()),
  history: historySchema(params), // paginated
})

export let coinResponseSchema = (params: { id: string, pageSize: number, }) => object({
  artifactType: string().required().matches(/^coin$/),
  coin: coinSchema().concat(object({
    yearlyTransfers: integerStringSchema(),
    yearlyVolume: integerStringSchema(),
  }).required()),
  holders: array().required().length(params.pageSize).of(holderSchema())
    .test('sorted by share', 'Holders should be sorted by share',
      (holders: any) => holders.reduce((acc: any, holder: any, index: any) =>
        acc && (index === holders.length - 1 || (
          +holder.quantity >= +holders[index + 1].quantity
        )),
        true
      )
    ), // paginated, sorted by share
  history: historySchema(params), // paginated
  contract: contractResponseSchema(params),
})

export let collectionResponseSchema = (params: { id: string, pageSize: number, }) => object({
  artifactType: string().required().matches(/^collection$/),
  collection: collectionSchema(),
  items: array().required().length(params.pageSize).of(nftSchema())
    .test('sorted by last transfer date', 'Nfts should be sorted by last transfer date',
      (tokens: any) => tokens.reduce((acc: any, token: any, index: any) =>
        acc && (index === tokens.length - 1 || (
          +token.lastTransferDate >= +tokens[index + 1].lastTransferDate
        )),
        true
      )
    ), // paginated, sorted by last transaction
  saleHistory: array().required().of(object({
    itemId: string().required(),
    date: dateStringSchema(),
    price: integerStringSchema(),
  })),
  history: historySchema(params), // paginated
  contract: contractResponseSchema(params),
})
