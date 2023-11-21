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

async function fetchOperation(id: string, xtzPrice) {
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
  const senderName = await objkt.getAddressDomain(sender)
  const receiverName = await objkt.getAddressDomain(receiver)
 
  if (operationType === 'transfer') {
    return {
      artifactType: 'transfer',
      operation: {
        id: id,
        status: "success", 
        date: timestamp ? (new Date(timestamp)).toISOString() : null,
        nativeQuantity: amount ?? null,
        from: {
          id: sender,
          name: senderName ?? null,
        },
        to: {
          id: receiver,
          name: receiverName,
        },
        transferedAssets: {
          from: {
            id: sender,
            name: senderName,
          },
          to: {
            id: receiver,
            name: receiverName,
          },
          asset: assets,
        }
      },
      fee: {
        nativeValue: fee,
        totalValue: +fee / 1000000 * xtzPrice,
        burned : "0", // No burn in TeZos 
      }
    } // as TransferResponse
  }

  else {
       return {
      artifactType: 'call',
      operation: {
        id: id,
        status: "success", 
        date: timestamp ? (new Date(timestamp)).toISOString() : null,
        from: {
          id: sender,
          name: senderName,
          },
        to: {
          id: receiver,
          name: receiverName,
        },
        transferedAssets: assets?.map(asset => ({
          from: {
            id: sender,
            name: senderName,
          },
          to: {
            id: receiver,
            name: receiverName,
          },
          asset,
        })),
        contractName: contractData?.alias,
        functionName,
      },
      fee: {
        value: null,
        nativeValue: null,
        burned: null,
      },
      }
    } // as CallResponse
}

export async function listLastOperations(address, number) {
  const data = await tzstats.getLastOperations(address, number)
  const xtzPrice = await tzstats.getXtzPrice()
  return await Promise.all(data.map(async operation => {
    return await fetchOperation(operation?.hash, xtzPrice)
  }))
}

export default (async ({
  id,
  pageSize,
}) => {
  const { artifactType, contractData } = await discrimateArtifactType(id)
  const xtzPrice = await tzstats.getXtzPrice()
  if (artifactType === 'operation') {
    const operation = await fetchOperation(id, xtzPrice)
    return {
      ...operation,
      history : {
          from : await listLastOperations(operation.operation.from.id,10),
          to : await listLastOperations(operation.operation.to.id,10)
      }
  }
  }

  const { nativeBalance, operationCount } = await tzstats.getWallet(id)

  if (artifactType === 'wallet') {
    const NUMBER_OF_TXS = pageSize;
    return {
      artifactType: 'wallet',
      wallet: {
        id: id,
        name: await objkt.getAddressDomain(id), // TODO Tezos domains, sinon null=on va afficher "Anonyme" dans le front
        nativeBalance: BigInt(Math.round(+nativeBalance * 1_000_000)).toString(),
        totalValue: (await tzstats.getWalletTotalValue(id)) + +nativeBalance * xtzPrice, // TODO: compute sum of data from TzPro
        operationCount: operationCount?.toString(),
      },
      tokens: await tzstats.getTokenSortedByValue(id),
      uncertifiedTokens: [], // paginated, sorted by last transfer date
      nfts: await objkt.getWalletNfts(id), // sorted by value
      history: await listLastOperations(id, NUMBER_OF_TXS), // paginated
    } as WalletResponse
  }

  const contract = {
    artifactType: 'contract',
    contract: {
      id: id,
      name: contractData?.alias,
      contractName: contractData?.alias,
      creationDate: contractData?.firstActivityTime ? (new Date(contractData.firstActivityTime)).toISOString() : null,
      creator: {
        id: contractData?.creator?.address,
        name: await objkt.getAddressDomain(contractData?.creator?.address),
      },
      operationCount: contractData?.numTransactions?.toString(), // TODO : check why operationCount from tzstats tzstats.getWallet is different from numTransactions of tzkt
      immutable: null,
      autonomous : null,
      averageFee: (await tzstats.getAddressAverageFee(id))?.toString(), // TODO : the fee is in gas
      treasuryValue: (await tzstats.getWalletTotalValue(id) + Math.round(nativeBalance * xtzPrice)).toString(), // TODO: compute sum of data from TzPro
      auditCount: null,
      officialWebsite: contractData?.metadata?.site,
    }
  } as ContractResponse

  if (artifactType === 'collection') {
    const NUMBER_OF_TXS = 5
    return {
      artifactType: 'collection',
      collection : await objkt.getCollection(id),
      // items,
      // saleHistory,
      history: await listLastOperations(id, NUMBER_OF_TXS),
      contract : contract,
    } as CollectionResponse
  }

  if (artifactType === 'coin') {
    // const coin = await tzkt.getCoinData(contractHash, lastPrice)
    const NUMBER_OF_TXS = 5
    const lastPrice = await tzstats.getTokenLastPrice(id)  // TODO
    const coin = await tzkt.getCoinData(id, lastPrice)
    const holders = await tzkt.getCoinHolders(id)
    const coinYearlyData = await tzkt.getCoinYearlyTransfersAndVolume(id)
    return {
      artifactType: 'coin',
      coin: {
        ...coin,
        yearlyTransfers: coinYearlyData?.count?.toString(),
        yearlyVolume: coinYearlyData?.sum?.toString(),
      },
      holders: holders,
      // history: await listLastOperations(id,NUMBER_OF_TXS),
      contract,
    } as CoinResponse
  }

  if (artifactType === 'contract') {
    const NUMBER_OF_TXS = 5
    return contract
  }

  throw new Error('Impossible to understand the hash: ' + id)
}) as ArtifactEndpoint
