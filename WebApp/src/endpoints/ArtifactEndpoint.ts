import axios from 'axios';
import {
  ArtifactEndpoint,
  TransferResponse, CallResponse, WalletResponse,
  CollectionResponse, CoinResponse, ContractResponse,
} from './API'
import {
  getTransaction, getTransactionStatus, isCollection,
  getCoinData, getTransactionAssets ,getContractData,
  getTransactionFunctionName, getTokenSortedByValue,
  getCoinHolders, getCoinYearlyTransfersAndVolume,
} from './providers/tzkt'
import { getWallet, getLastOperations } from './providers/tzstats'
import { getWalletNfts } from './providers/objkt'
import { getXtzPrice, getAddressAverageFee } from './providers/tzstats'

// Return contractData to avoid requesting multiple times
async function discrimateArtifactType(hash: string): Promise<{
  artifactType: 'wallet' | 'operation' | 'collection' | 'coin' | 'contract' | null,
  contractData: any | null
}> {
  if (typeof hash !== 'string')
    throw new Error('Input must be a string');

  const hashType = hash.startsWith('tz') ? 'wallet' :
    hash.startsWith('o') ? 'operation' : // can start with: op | oo | on // should return: 'transfer' | 'call'
    hash.startsWith('KT') ? 'contract' :
    null

  if (hashType === 'contract') {
    const contractData = await getContractData(hash)
    const contractType = contractData.kind === 'asset' ? (
      (await isCollection(hash)) ? 'collection' : 'coin'
    ) : 'contract'

    return { artifactType: contractType, contractData }
  }

  return { artifactType: hashType, contractData: null }
}

function discrimateOperationType(receiver, contractData, functionName) {
  return receiver.startsWith('tz') // native xtz transfer
    || contractData.kind === 'asset' && functionName === 'transfer' // fa2 transfer
    ? 'transfer' : 'call'
}

async function fetchOperation(id: string) {
  const [ transaction, status, functionName ] = await Promise.all([
    await getTransaction(id),
    await getTransactionStatus(id),
    await getTransactionFunctionName(id),
  ])
  const { tzktId, sender, receiver, amount, fee, timestamp } = transaction
  const [ assets, contractData ] = await Promise.all([
    await getTransactionAssets(tzktId),
    await getContractData(receiver),
  ])
  const operationType = discrimateOperationType(receiver, contractData, functionName)

  if (operationType === 'transfer') {
    return {
      artifactType: 'transfer',
      operation: {
        id: id,
        status: status,
        date: timestamp,
        from: sender,
        to: receiver,
        transferedAssets: {
          from: sender,
          to: receiver,
          asset: assets,
        }
      },
    } as TransferResponse
  }

  else {
    return {
      artifactType: 'call',
      operation: {
        id: id,
        status: status,
        date: timestamp,
        from: sender,
        to: receiver,
        transferedAssets: assets.map(asset => ({
          from: sender,
          to: receiver,
          asset,
        })),
        contractName: contractData?.alias,
        functionName,
      },
    } as CallResponse
  }
}

export async function listLastOperations(address, number) {
  const data = await getLastOperations(address, number)
  return await Promise.all(data.map(async operation => {
    return await fetchOperation(operation?.hash)
  }))
}

export default (async ({
  id,
  pageSize,
}) => {
  const { artifactType, contractData } = await discrimateArtifactType(id)

  if (artifactType === 'operation') {
    return fetchOperation(id)
  }

  const { nativeBalance, operationCount } = await getWallet(id)
  const contractObject = {
    id : id,
    name : contractData?.alias,
    contractName: contractData?.alias,
    creationDate: contractData?.firstActivityTime,
    creator: contractData?.creator.address,
    operationCount: contractData?.numTransactions, // TODO : check why operationCount from tzstats getWallet is different from numTransactions of tzkt
    immutable: 0,
    autonomous : 0,
    //averageFee: await getAddressAverageFee(id), // TODO
    treasuryValue: nativeBalance, // TODO: compute total value
    auditCount: 0,
    officialWebsite: contractData?.metadata?.site,
  }

  if (artifactType === 'wallet') {
    const NUMBER_OF_TXS = 5
    return {
      artifactType: 'wallet',
      wallet: {
        id: id,
        name: id, // TODO
        nativeBalance,
        totalValue: nativeBalance, // TODO: compute total value
        operationCount,
      },
      tokens: await getTokenSortedByValue(id, +(await getXtzPrice()) / 100), // sorted by value
      uncertifiedTokens: [], // paginated, sorted by last transfer date
      nfts: await getWalletNfts(id), // sorted by value
      history: await listLastOperations(id, NUMBER_OF_TXS), // paginated
    } as WalletResponse
  }

  if (artifactType === 'collection') {
    const NUMBER_OF_TXS = 5
    return {
      artifactType: 'collection',
      // collection,
      // items,
      // saleHistory,
      // history: await listLastOperations(id, NUMBER_OF_TXS),
      contract: contractObject,
    } as CollectionResponse
  }

  if (artifactType === 'coin') {
    // const coin = await getCoinData(contractHash, lastPrice)
    const NUMBER_OF_TXS=5
    const coin = await getCoinData(id)
    const holders = await getCoinHolders(id)
    const coinYearlyData = await getCoinYearlyTransfersAndVolume(id)
    return {
      artifactType: 'coin',
      coin: {
        ...coin,
        yearlyTransfers: coinYearlyData?.count,
        yearlyVolume: coinYearlyData?.sum,
      },
      holders: holders,
      // history: await listLastOperations(id,NUMBER_OF_TXS),
      contract : contractObject,
    } as CoinResponse
  }

  if (artifactType === 'contract') {
    const NUMBER_OF_TXS = 5
    return {
      artifactType: 'contract',
      contract: contractObject,
      // history: await listLastOperations(id, NUMBER_OF_TXS),
    } as ContractResponse
  }

  throw new Error('Impossible to understand the hash: ' + id)
}) as ArtifactEndpoint
