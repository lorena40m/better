import axios from 'axios';
import {
  ArtifactEndpoint,
  TransferResponse, CallResponse, WalletResponse,
  CollectionResponse, CoinResponse, ContractResponse,
} from './API'
import * as tzkt from './providers/tzkt'
import * as tzstats from './providers/tzstats'
import * as objkt from './providers/objkt'

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
    const contractData = await tzkt.getContractData(hash)
    const contractType = contractData.kind === 'asset' ? (
      (await tzkt.isCollection(hash)) ? 'collection' : 'coin'
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
    await tzkt.getTransaction(id),
    await tzkt.getTransactionStatus(id),
    await tzkt.getTransactionFunctionName(id),
  ])
  const { tzktId, sender, receiver, amount, fee, timestamp } = transaction
  const [ assets, contractData ] = await Promise.all([
    await tzkt.getTransactionAssets(tzktId),
    await tzkt.getContractData(receiver),
  ])
  const operationType = discrimateOperationType(receiver, contractData, functionName)

  if (operationType === 'transfer') {
    return {
      artifactType: 'transfer',
      operation: {
        id: id,
        status: status.toString(),
        date: timestamp ? (new Date(timestamp)).toISOString().replace(/[:]/g, '-').slice(0,-1) : null,
        from: {
          id : sender,
          name : "",
        },
        to: {
          id: receiver,
          name : "",
        },
        transferedAssets: {
          from: {
          id : sender,
          name : ""
          },
          to: {
            id : receiver,
            name : "",
          },
          asset: assets,
        }
      },
    } // as TransferResponse
  }

  else {
    return {
      artifactType: 'call',
      operation: {
        id: id,
        status: status.toString(),
        date: timestamp ? (new Date(timestamp)).toISOString().replace(/[:]/g, '-').slice(0,-1) : null,
        from: {
          id : sender,
          name : ""
          },
        to: {
          id : receiver,
          name : ""
          },
        transferedAssets: assets.map(asset => ({
          from: {
          id : sender,
          name : ""
          },
          to: {
          id : receiver,
          name : ""
          },
          asset,
        })),
        contractName: contractData?.alias,
        functionName,
      },
    } // as CallResponse
  }
}

export async function listLastOperations(address, number) {
  const data = await tzstats.getLastOperations(address, number)
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

  const { nativeBalance, operationCount } = await tzstats.getWallet(id)
  const contractObject = {
    id : id,
    name : contractData?.alias,
    contractName: contractData?.alias,
    creationDate: contractData?.firstActivityTime ? (new Date(contractData.firstActivityTime)).toISOString().replace(/[:]/g, '-').slice(0,-1) : null,
    creator: {
        id : contractData?.creator.address,
        name : "",
      },
    operationCount: contractData?.numTransactions.toString(), // TODO : check why operationCount from tzstats tzstats.getWallet is different from numTransactions of tzkt
    immutable: false, 
    autonomous : false,
    averageFee: await tzstats.getAddressAverageFee(id).toString(), // TODO
    treasuryValue: nativeBalance.toString(), // TODO: compute total value
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
      tokens: await tzkt.getTokenSortedByValue(id, +(await tzstats.getXtzPrice()) / 100), // sorted by value
      uncertifiedTokens: [], // paginated, sorted by last transfer date
      nfts: await objkt.getWalletNfts(id), // sorted by value
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
      contract: {
          artifactType:'contract',
          contractObject,}
    } // as CollectionResponse
  }

  if (artifactType === 'coin') {
    // const coin = await tzkt.getCoinData(contractHash, lastPrice)
    const NUMBER_OF_TXS = 5
    const lastPrice = null // TODO
    const coin = await tzkt.getCoinData(id, lastPrice)
    const holders = await tzkt.getCoinHolders(id)
    const coinYearlyData = await tzkt.getCoinYearlyTransfersAndVolume(id)
    return {
      artifactType: 'coin',
      coin: {
        ...coin,
        yearlyTransfers: coinYearlyData?.count.toString(),
        yearlyVolume: coinYearlyData?.sum.toString(),
      },
      holders: holders,
      // history: await listLastOperations(id,NUMBER_OF_TXS),
      contract : {
          artifactType:'contract',
          contractObject,}
    } // as CoinResponse
  }

  if (artifactType === 'contract') {
    const NUMBER_OF_TXS = 5
    return {
      artifactType: 'contract',
      contract: contractObject,
      // history: await listLastOperations(id, NUMBER_OF_TXS),
    } // as ContractResponse
  }

  throw new Error('Impossible to understand the hash: ' + id)
}) as ArtifactEndpoint
