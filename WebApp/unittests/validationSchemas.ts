import { InferType, array, number, object, string } from 'yup'
import {
  CallResponse,
  CoinResponse,
  CollectionResponse,
  ContractResponse,
  HomeResponse,
  MiscellaneousResponse,
  TransferResponse,
  WalletResponse,
} from '../src/endpoints/API'

const integerStringSchema = () => string().required().matches(/^\d+$/)
const dateStringSchema = () =>
  string()
    .required()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
const urlSchema = () =>
  string()
    .required()
    .url()
    .matches(/^https:\/\//)
const addressSchema = () =>
  object({
    id: string()
      .required()
      .matches(/^(tz)|(KT).{34}$/),
    name: string().nullable(),
  }).required()
const collectionSchema = () =>
  object({
    id: string().required(),
    image: urlSchema(),
    name: string().required(),
    floorPrice: number().required(),
  }).required()
const extendedCollectionSchema = () =>
  collectionSchema().concat(
    object({
      supply: integerStringSchema(),
      topSale: integerStringSchema(),
      marketplaceLink: urlSchema(),
    }).required(),
  )
const coinSchema = () =>
  object({
    id: string().required(),
    logo: urlSchema(),
    name: string().required(),
    ticker: string().required(),
    decimals: number().required(),
    lastPrice: number().required(),
  }).required()
const extendedCoinSchema = () =>
  coinSchema().concat(
    object({
      circulatingSupplyOnChain: integerStringSchema(),
      holders: integerStringSchema(),
    }).required(),
  )
const holderSchema = () =>
  addressSchema().concat(
    object({
      quantity: integerStringSchema(),
    }).required(),
  )
const holdingSchema = assetSchema =>
  object({
    asset: assetSchema,
    quantity: integerStringSchema(),
    value: number().required(),
    lastTransferDate: dateStringSchema(),
  }).required()
const nftSchema = () =>
  object({
    id: string()
      .required()
      .matches(/^KT.{34}(_\d+)?$/),
    tokenId: integerStringSchema(),
    image: urlSchema(),
    name: string().required(),
    lastSalePrice: number().required(),
    collection: collectionSchema(),
  }).required()
const transferSchema = () =>
  object({
    id: string().required(),
    status: string()
      .required()
      .matches(/(waiting)|(success)|(failure)/),
    date: dateStringSchema(),
    from: addressSchema(),
    to: addressSchema(),
    transferedAssets: array()
      .required()
      .of(
        object({
          from: addressSchema(),
          to: addressSchema(),
          asset: coinSchema(),
        }),
      )
      .required()
      .min(1),
  }).required()
const callSchema = () =>
  transferSchema().concat(
    object({
      contractName: string().required(),
      functionName: string().required(),
    }).required(),
  )

export let homeResponseSchema = (params: { pageSize: number }) =>
  object({
    stats: object({
      normalFee: integerStringSchema(),
      lastBlockNumber: integerStringSchema(),
      lastBlockDate: dateStringSchema(),
    }).required(),
    collections: object({
      trending: array().required().length(params.pageSize).of(extendedCollectionSchema()),
      top: array().required().length(params.pageSize).of(extendedCollectionSchema()),
    }).required(),
    coins: object({
      byCap: array().required().length(params.pageSize).of(extendedCoinSchema()),
      byVolume: array().required().length(params.pageSize).of(extendedCoinSchema()),
    }).required(),
  }).required()

export let miscellaneousResponseSchema = () =>
  object({
    rates: object({
      'EUR/USD': integerStringSchema(),
    }).required(),
    xtzPrice: integerStringSchema(),
  })

const abstractOperationSchema = (params: { id: string; pageSize: number }) =>
  object({
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

export let transferResponseSchema = (params: { id: string; pageSize: number }) =>
  abstractOperationSchema(params).concat(
    object({
      artifactType: string()
        .required()
        .matches(/^transfer$/),
      operation: transferSchema(),
    }).required(),
  )
export let callResponseSchema = (params: { id: string; pageSize: number }) =>
  abstractOperationSchema(params).concat(
    object({
      artifactType: string()
        .required()
        .matches(/^call$/),
      operation: callSchema(),
    }).required(),
  )

export let walletResponseSchema = (params: { id: string; pageSize: number }) =>
  object({
    artifactType: string()
      .required()
      .matches(/^wallet$/),
    wallet: addressSchema().concat(
      object({
        nativeBalance: integerStringSchema(),
        totalValue: number().required(),
        operationCount: integerStringSchema(),
      }).required(),
    ),
    tokens: array()
      .required()
      .of(
        holdingSchema(coinSchema()).test(
          'value is correct',
          'Token value is incorrect',
          (token: any) =>
            Math.abs(
              (token.value - (+token.quantity * +token.asset.lastPrice) / 10 ** token.asset.decimals) / token.value,
            ) < 0.05,
        ),
      )
      .test('sorted by value', 'Tokens should be sorted by value', (tokens: any) =>
        tokens.reduce(
          (acc: any, token: any, index: any) =>
            acc && (index === tokens.length - 1 || +token.value > +tokens[index + 1].value),
          true,
        ),
      ),
    nfts: array()
      .required()
      .of(holdingSchema(nftSchema()))
      .test('sorted by value', 'Nfts should be sorted by value', (tokens: any) =>
        tokens.reduce(
          (acc: any, token: any, index: any) =>
            acc && (index === tokens.length - 1 || +token.lastSalePrice > +tokens[index + 1].lastSalePrice),
          true,
        ),
      ),
    history: historySchema(params), // paginated
  })

export let contractResponseSchema = (params: { id: string; pageSize: number }) =>
  object({
    artifactType: string()
      .required()
      .matches(/^contract$/),
    contract: addressSchema().concat(
      object({
        contractName: string().required(),
        creationDate: dateStringSchema(),
        creator: addressSchema(),
        operationCount: integerStringSchema(), // since creation
        averageFee: number().required(),
        treasuryValue: number().required(),
        officialWebsite: urlSchema(),
      }).required(),
    ),
    history: historySchema(params), // paginated
  })

export let coinResponseSchema = (params: { id: string; pageSize: number }) =>
  object({
    artifactType: string()
      .required()
      .matches(/^coin$/),
    coin: extendedCoinSchema().concat(
      object({
        yearlyTransfers: integerStringSchema(),
        yearlyVolume: integerStringSchema(),
      }).required(),
    ),
    holders: array()
      .required()
      .length(params.pageSize)
      .of(holderSchema())
      .test('sorted by share', 'Holders should be sorted by share', (holders: any) =>
        holders.reduce(
          (acc: any, holder: any, index: any) =>
            acc && (index === holders.length - 1 || +holder.quantity >= +holders[index + 1].quantity),
          true,
        ),
      ), // paginated, sorted by share
    history: historySchema(params), // paginated
    contract: contractResponseSchema(params),
  })

export let collectionResponseSchema = (params: { id: string; pageSize: number }) =>
  object({
    artifactType: string()
      .required()
      .matches(/^collection$/),
    collection: extendedCollectionSchema(),
    items: array()
      .required()
      .length(params.pageSize)
      .of(nftSchema())
      .test('sorted by last transfer date', 'Nfts should be sorted by last transfer date', (tokens: any) =>
        tokens.reduce(
          (acc: any, token: any, index: any) =>
            acc && (index === tokens.length - 1 || +token.lastTransferDate >= +tokens[index + 1].lastTransferDate),
          true,
        ),
      ), // paginated, sorted by last transaction
    saleHistory: array()
      .required()
      .of(
        object({
          itemId: string().required(),
          date: dateStringSchema(),
          price: integerStringSchema(),
        }),
      ),
    history: historySchema(params), // paginated
    contract: contractResponseSchema(params),
  })

/**** TYPE CHECKING ****/

// Let Typescript check is the yup schemas are compatible with the respective Typescript type

// How it works:
// yup generates a Typescript type with InferType
// If compatibility is broken, InferedType will not extend MiscellaneousResponse
// Therefore CheckedResponse will resolve at `never`
// It will then trigger a Typescript error on `ShouldNotBeNever`!
// Try to change a yup schema and you will see :p

// TL;DR:
// if shouldNotBeNever triggers an error,
// it means there are inconsistencies between yup schema and API.ts

const testHomeResponseSchema = homeResponseSchema({ pageSize: 100 })
type HomeInferedType = InferType<typeof testHomeResponseSchema>
type HomeCheckedResponse = HomeInferedType extends HomeResponse ? HomeResponse : never
const HomeShouldNotBeNever: HomeCheckedResponse = <any>null

const testMiscellaneousResponseSchema = miscellaneousResponseSchema()
type MiscellaneousInferedType = InferType<typeof testMiscellaneousResponseSchema>
type MiscellaneousCheckedResponse = MiscellaneousInferedType extends MiscellaneousResponse
  ? MiscellaneousResponse
  : never
const MiscShouldNotBeNever: MiscellaneousCheckedResponse = <any>null

const testTransferResponseSchema = transferResponseSchema({ id: '0x', pageSize: 100 })
type TransferInferedType = InferType<typeof testTransferResponseSchema>
type TransferCheckedResponse = TransferInferedType extends TransferResponse ? TransferResponse : never
const TransferShouldNotBeNever: TransferCheckedResponse = <any>null

const testCallResponseSchema = callResponseSchema({ id: '0x', pageSize: 100 })
type CallInferedType = InferType<typeof testCallResponseSchema>
type CallCheckedResponse = CallInferedType extends CallResponse ? CallResponse : never
const CallShouldNotBeNever: CallCheckedResponse = <any>null

const testCoinResponseSchema = coinResponseSchema({ id: '0x', pageSize: 100 })
type CoinInferedType = InferType<typeof testCoinResponseSchema>
type CoinCheckedResponse = CoinInferedType extends CoinResponse ? CoinResponse : never
const CoinShouldNotBeNever: CoinCheckedResponse = <any>null

const testCollectionResponseSchema = collectionResponseSchema({ id: '0x', pageSize: 100 })
type CollectionInferedType = InferType<typeof testCollectionResponseSchema>
type CollectionCheckedResponse = CollectionInferedType extends CollectionResponse ? CollectionResponse : never
const CollectionShouldNotBeNever: CollectionCheckedResponse = <any>null

const testWalletResponseSchema = walletResponseSchema({ id: '0x', pageSize: 100 })
type WalletInferedType = InferType<typeof testWalletResponseSchema>
type WalletCheckedResponse = WalletInferedType extends WalletResponse ? WalletResponse : never
const WalletShouldNotBeNever: WalletCheckedResponse = <any>null

const testContractResponseSchema = contractResponseSchema({ id: '0x', pageSize: 100 })
type ContractInferedType = InferType<typeof testContractResponseSchema>
type ContractCheckedResponse = ContractInferedType extends ContractResponse ? ContractResponse : never
const ContractShouldNotBeNever: ContractCheckedResponse = <any>null
