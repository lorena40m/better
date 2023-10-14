import axios from 'axios';
import { get } from 'http';
import { createBrotliCompress } from 'zlib';

async function parsing_hash(hash: any) {
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

async function getTransactionSender(transactionHash:any) {
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

async function getTransactionReceiver(transactionHash:any) {
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


async function getTransactionAmount(transactionHash:any) {
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

async function getTransactionTimestamp(transactionHash:any) {
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

async function getTransactionStatus(transactionHash:any) {
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

async function getHashNativeBalance(address:any) {
  
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

async function getWalletOperationCount(address:any) {
  
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

export default (params: {
  id : string,
  pagesize : BigInt,
}) => {

  // TO DO : implement a function that tells if it's an operation or an address
  if (await parsing_hash(params.id) == "operation") {

    const sender = getTransactionSender(params.id);
    const receiver = getTransactionReceiver(params.id);
    const amount = getTransactionAmount(params.id);
    const fee = getTransactionFee(params.id);
    const date = getTransactionTimestamp(params.id);
    const status = getTransactionStatus(params.id); // TODO : check if return value is correct (waiting, success, failure)
    const assets = getTransactionAssets(params.id);

    // if it's a transfer
    if(await parsing_hash(receiver) == "wallet" && await parsing_hash(sender)=="wallet") {
      const transfer = {
        id: params.id,
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
      const contractName = getTransactionContractName(params.id);
      const functionName = getTransactionFunctionName(params.id);
      const call = {
        id: params.id,
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
        artifactType: 'call',
        operation : call,
      }
    }
  }

  else if (await parsing_hash(params.id) == "wallet"){
    const wallet = {
      id : params.id,
      name : params.id, // TODO : getWalletName(params.id),
      nativeBalance : getHashNativeBalance(params.id),
      totalValue : getHashNativeBalance(params.id),
      operationCount : getWalletOperationCount(params.id),
    }
    return {
      artifactType: 'wallet',
      wallet: wallet,
      tokens: getTokenSortedByValue(), // sorted by value
      uncertifiedTokens: [], // paginated, sorted by last transfer date
      nfts: getWalletNft(), // sorted by value
      history: getWalletOperations(), // paginated
    }
    
  }
  else if (await parsing_hash(params.id) == "smartContract"){
    const contract = {
      id : params.id,
      name : ,
      contractName: getContractName(params.id),
      creationDate: getSmartContractCreationDate(params.id),
      creator: getSmartContractCreator(params.id),
      operationCount: getSmartContractOperationCount(params.id),
      immutable: 0,
      autonomous : 0,
      averageFee: getContractAverageFee(params.id),
      treasuryValue : getHashNativeBalance(params.id),
      auditCount: 0,
      officialWebsite: "",
    }
    return {
      artifactType: 'contract',
      contract : contract
    }

// }
//  // TO DO : implement the case where the hash is a collection
//   else if (await parsing_hash(params.id) == "collection"){


//   }

// // TO DO : implement the case where the hash is a coin contract
//   else if (await parsing_hash(params.id) == "coin") {

//   }
}
}
