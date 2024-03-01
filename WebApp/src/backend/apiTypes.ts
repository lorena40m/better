import { Operation } from '@/pages/api/account-history';
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

export type AssetOp = {
  assetType: string,
  id: string,
  name: string,
  image: UrlString,
  decimals: string,
  ticker: string
}

export type Nft = {
  assetType: 'nft',
  id: string,
  name: string,
  image: UrlString[],
}

export type Coin = {
  assetType: 'coin',
  id: string | 'tezos',
  name: string,
  image: UrlString, // image is null when id = 'tezos'
  ticker: string,
  decimals: number,
}

export type Asset = Nft | Coin

export type OperationType =  'operationGroup' | 'transfer' | 'call' | 'contractCreation' | 'stakingOperation'
export type StakingType = ''
export type StatusType = 'waiting' | 'success' | 'failure'


export type OperationBatch = 
  {
    operationGroupList: Array<OperationGroup>,
    date: DateString,
    block: number,
    fees: number,
  };
export type OperationGroup = {
  status : StatusType,
  fees: number,
  operationList: Array<{
    operationType: OperationType,
    from: Account,
    to: Account,
    assets: Array<{
      quantity: TokenDecimals,
      asset: AssetOp,
      from: any,
      to: any
    }>,
    entrypoint: string, // = functionName
    fees: number,
  }>,
}
export type Execution = {
  from: Account,
  to : Account,
  operationType : OperationType,
  stakingType : StakingType,
  functionName : string,
}

