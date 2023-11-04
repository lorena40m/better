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
import { getWallet, getLastOperations, listLastOperations } from './providers/tzstats'
import { getWalletNfts } from './providers/objkt'
import { getXtzPrice,getAverageFeeAddress } from './providers/tzstats'

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
    const NUMBER_OF_TXS=5
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
      history: await listLastOperations(id,NUMBER_OF_TXS), // paginated
    } as WalletResponse
  }

  else if (artifactType === 'collection') {
    const contractData = await getContractData(id)
    const { nativeBalance, operationCount } = await getWallet(id)
    const averageFee = await getAverageFeeAddress(id)
    const NUMBER_OF_TXS=5
    return {
      artifactType: 'collection',
      //collection,
      //items,
      //saleHistory,
      history : await listLastOperations(id,NUMBER_OF_TXS),
      contract : {
        id : id,
        name : "",
        contractName: contractData?.alias,
        creationDate: contractData?.firstActivityTime,
        creator: contractData?.creator.address,
        operationCount: contractData?.numTransactions, // TODO : check why operationCount from tzstats getWallet is different from numTransactions of tzkt
        immutable: 0,
        autonomous : 0,
        averageFee: averageFee, // TODO
        treasuryValue: nativeBalance, // TODO: compute total value
        auditCount: 0,
        officialWebsite: "",
      },
    } as CollectionResponse
  }

  else if (artifactType === 'coin') {
    // const coin = await getCoinData(contractHash, lastPrice)
    const contractData = await getContractData(id)
    const { nativeBalance, operationCount } = await getWallet(id)
    const averageFee = await getAverageFeeAddress(id)
    const NUMBER_OF_TXS=5
    const coin = await getCoinData(id)
    const holders = await getCoinHolders(id)
    const coinYearlyData = await getCoinYearlyTransfersAndVolume(id)
    return {
      artifactType: 'coin',
      coin:{
        ...coin,
        yearlyTransfers: coinYearlyData?.count,
        yearlyVolume: coinYearlyData?.sum,
      },  
      holders : holders,
      //history : await listLastOperations(id,NUMBER_OF_TXS),
      contract : {
        id : id,
        name : "",
        contractName: contractData?.alias,
        creationDate: contractData?.firstActivityTime,
        creator: contractData?.creator.address,
        operationCount: contractData?.numTransactions, // TODO : check why operationCount from tzstats getWallet is different from numTransactions of tzkt
        immutable: 0,
        autonomous : 0,
        averageFee: averageFee, // TODO
        treasuryValue: nativeBalance, // TODO: compute total value
        auditCount: 0,
        officialWebsite: "",
      },
    } as CoinResponse
  }

  else if (artifactType === 'contract') {
    const contractData = await getContractData(id)
    const { nativeBalance, operationCount } = await getWallet(id)
    const averageFee = await getAverageFeeAddress(id)
    const NUMBER_OF_TXS=5
    return {
      artifactType: 'contract',
      contract : {
        id : id,
        name : "",
        contractName: contractData?.alias,
        creationDate: contractData?.firstActivityTime,
        creator: contractData?.creator.address,
        operationCount: contractData?.numTransactions, // TODO : check why operationCount from tzstats getWallet is different from numTransactions of tzkt
        immutable: 0,
        autonomous : 0,
        averageFee: averageFee, // TODO
        treasuryValue: nativeBalance, // TODO: compute total value
        auditCount: 0,
        officialWebsite: "",
      },
      history : await listLastOperations(id,NUMBER_OF_TXS),
    } as ContractResponse
  }

  throw new Error('Impossible to understand the hash: ' + id)
}) as ArtifactEndpoint
