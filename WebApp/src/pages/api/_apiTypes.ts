import { Operation } from './account-history';
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
  assetType: 'nft',
  id: string,
  name: string,
  image: UrlString,
  decimals: string,
  ticker: string
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
    quantity: TokenDecimals,
    from: Account,
    to: Account,
    asset: AssetOp,
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

