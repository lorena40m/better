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
} from './providers/tzkt'
import { getWallet, get10LastOperations } from './providers/tzstats'
import { getWalletNfts } from './providers/objkt'
import { getXtzPrice } from './providers/tzstats'

async function discrimateArtifactType(hash: string) {
  if (typeof hash !== 'string')
    throw new Error('Input must be a string');

  return hash.startsWith('tz') ? 'wallet' :
    hash.startsWith('o') ? 'operation' : // can start with: op | oo | on // should return: 'transfer' | 'call'
    hash.startsWith('KT') ? (
      (await getContractData(hash)).kind === 'asset' ? (
        (await isCollection(hash)) ? 'collection' : 'coin'
      ) : 'contract'
    ) : null
}

async function discrimateOperationType(receiver, contractData, functionName) {
  return receiver.startsWith('tz') // native xtz transfer
    || contractData.kind === 'asset' && functionName === 'transfer' // fa2 transfer
    ? 'transfer' : 'call'
}

export default (async ({
  id,
  pageSize,
}) => {
  const artifactType = await discrimateArtifactType(id)

  if (artifactType === 'operation') {
    const { tzktId, sender, receiver, amount, fee, timestamp } = await getTransaction(id)
    const status = await getTransactionStatus(id)
    const assets = await getTransactionAssets(tzktId);
    const contractData = await getContractData(receiver)
    const functionName = await getTransactionFunctionName(id);
    const operationType = await discrimateOperationType(receiver, contractData, functionName)

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

  else if (artifactType === 'wallet') {
    const { nativeBalance, operationCount } = await getWallet(id)

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
      history: [], // paginated
    } as WalletResponse
  }

  else if (artifactType === 'collection') {
    return {
      artifactType: 'collection',
    } as CollectionResponse
  }

  else if (artifactType === 'coin') {
    // const coin = await getCoinData(contractHash, lastPrice)

    return {
        artifactType: 'coin',
    } as CoinResponse
  }

  else if (artifactType === 'contract') {
    const contractData = await getContractData(id)
    const { nativeBalance, operationCount } = await getWallet(id)

    return {
      artifactType: 'contract',
      contract : {
        id : id,
        name : "",
        contractName: contractData?.alias,
        creationDate: contractData?.firstActivityTime, // TODO
        creator: contractData?.creator.address, // TODO
        operationCount: contractData?.numTransactions, // TODO
        immutable: 0,
        autonomous : 0,
        averageFee: null, // TODO
        treasuryValue: nativeBalance, // TODO: compute total value
        auditCount: 0,
        officialWebsite: "",
      },
      history : get10LastOperations(id),
    } as ContractResponse
  }

  throw new Error('Impossible to understand the hash: ' + id)
}) as ArtifactEndpoint
