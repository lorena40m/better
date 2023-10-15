import axios from 'axios';
import { get } from 'http';
import { createBrotliCompress } from 'zlib';

async function parsing_hash(hash) {
  if (typeof hash !== 'string') {
      throw new Error('Input must be a string');
  }
  if (hash.startsWith('tz')) {
      return "wallet";
  }
  else if (hash.startsWith('KT')){
      return "smartContract";
  }
  else if (hash.startsWith('op') || hash.startsWith('oo') || hash.startsWith('on')){
      return "operation";
  }
  else {
      throw new Error('This Hash is not a transaction, a wallet or a smart contract');
  }
}

async function getTransactionSender(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

      const response = await axios.get(url);

      if (response.status === 200) {
          const data = response.data;
             const senderAddress = data[0].sender.address;

              return senderAddress;
      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}

async function getTransactionReceiver(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

      const response = await axios.get(url);


      if (response.status === 200) {
          const data = response.data;

             const receiverAddress = data[1].target.address;

              return receiverAddress;

      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}


async function getTransactionAmount(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

      const response = await axios.get(url);


      if (response.status === 200) {
          const data = response.data;
             const amount = data[1].amount;

              return amount;

      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}

async function getTransactionFee(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

      const response = await axios.get(url);


      if (response.status === 200) {
          const data = response.data;
             const fee = data[1].bakerFee;

              return fee;

      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}

async function getTransactionTimestamp(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

      const response = await axios.get(url);


      if (response.status === 200) {
          const data = response.data;
             const timestamp = data[0].timestamp;

              return timestamp;

      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}

async function getTransactionStatus(transactionHash) {
  try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}/status`;

      const response = await axios.get(url);


      if (response.status === 200) {
          const data = response.data;

          return data;

      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
}

async function getHashNativeBalance(address) {

  const url = `https://api.tzstats.com/explorer/account/${address}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data.spendable_balance; // Extract and return the creator address
  } catch (error) {
    // Handle any errors that may occur during the API call.
    console.error('Error calling API: ', error);
    throw error; // Throw the error to potentially be handled by the caller.
  }
}

async function getWalletOperationCount(address) {

  const url = `https://api.tzstats.com/explorer/account/${address}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data.n_tx_success; // Extract and return the creator address
  } catch (error) {
    // Handle any errors that may occur during the API call.
    console.error('Error calling API: ', error);
    throw error; // Throw the error to potentially be handled by the caller.
  }
}

async function getTransactionAssets() {
  return []
}

async function getTransactionContractName() {
  return ""
}

async function getTransactionFunctionName() {
  return ""
}

async function getTokenSortedByValue() {
  return []
}

async function getWalletNft() {
  return null
}

async function getWalletOperations() {
  return []
}

async function getContractName() {
  return ""
}

async function getSmartContractCreationDate() {
  return ""
}

async function getSmartContractCreator() {
  return ""
}

async function getSmartContractOperationCount() {
  return 0
}

async function getContractAverageFee() {
  return 0
}

export default async ({
  id,
  pageSize,
}) => {

  // TO DO : implement a function that tells if it's an operation or an address
  if (await parsing_hash(id) == "operation") {

    const sender = await getTransactionSender(id);
    const receiver = await getTransactionReceiver(id);
    const amount = await getTransactionAmount(id);
    const fee = await getTransactionFee(id);
    const date = await getTransactionTimestamp(id);
    const status = await getTransactionStatus(id); // TODO : check if return value is correct (waiting, success, failure)
    const assets = await getTransactionAssets(id);

    // if it's a transfer
    if(await parsing_hash(receiver) == "wallet" && await parsing_hash(sender)=="wallet") {
      const transfer = {
        id: id,
        status: status,
        date: date,
        from: sender,
        to: receiver,
        transferedAssets: {
          from: sender,
          to: receiver,
          asset: assets,
        }
      }
      return{
        artifactType: 'transfer',
        operation : transfer,
      }
    }
    else {
      const contractName = await getTransactionContractName(id);
      const functionName = await getTransactionFunctionName(id);
      const call = {
        id: id,
        status: status,
        date: date,
        from: sender,
        to: receiver,
        transferedAssets: {
          from: sender,
          to: receiver,
          asset: amount,
        },
        contractName: contractName,
        functionName: functionName,
      }
      return{
        artifactType: functionName === 'transfer' ? 'transfer' : 'call',
        operation : call,
      }
    }
  }

  else if (await parsing_hash(id) == "wallet"){
    const wallet = {
      id : id,
      name : id, // TODO : getWalletName(id),
      nativeBalance : await getHashNativeBalance(id),
      totalValue : await getHashNativeBalance(id),
      operationCount : await getWalletOperationCount(id),
    }
    return {
      artifactType: 'wallet',
      wallet: wallet,
      tokens: await getTokenSortedByValue(), // sorted by value
      uncertifiedTokens: [], // paginated, sorted by last transfer date
      nfts: await getWalletNft(), // sorted by value
      history: await getWalletOperations(), // paginated
    }

  }
  else if (await parsing_hash(id) == "smartContract"){
    const contract = {
      id : id,
      name : "",
      contractName: await getContractName(id),
      creationDate: await getSmartContractCreationDate(id),
      creator: await getSmartContractCreator(id),
      operationCount: await getSmartContractOperationCount(id),
      immutable: 0,
      autonomous : 0,
      averageFee: await getContractAverageFee(id),
      treasuryValue : await getHashNativeBalance(id),
      auditCount: 0,
      officialWebsite: "",
    }
    return {
      artifactType: 'contract',
      contract : contract
    }

// }
//  // TO DO : implement the case where the hash is a collection
//   else if (await parsing_hash(id) == "collection"){


//   }

// // TO DO : implement the case where the hash is a coin contract
//   else if (await parsing_hash(id) == "coin") {

//   }
}
}
