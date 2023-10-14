const axios = require('axios');
const { TezosToolkit } = require('@taquito/taquito');
const { get } = require('http');

function getISODateForLast24Hours() {
    // Get the current date and time
    const currentDate = new Date();
  
    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = new Date(currentDate - 24 * 60 * 60 * 1000);
  
    // Convert the date to an ISO 8601 format string
    const isoDateString = twentyFourHoursAgo.toISOString();
  
    return isoDateString;
  }

async function get_xtz_price() {
    const url = 'https://api.tzstats.com/markets/tickers';

    try {
        const response = await axios.get(url);
        return response.data[16].last; // Retourne les données de la réponse.
    } catch (error) {
        // Gère toutes les erreurs qui peuvent survenir lors de l'appel API.
        console.error('Error calling API: ', error);
        throw error; // L'erreur est lancée pour être éventuellement gérée par l'appelant.
    }
}

async function get_fee() {
  return 0.0015;
}

async function get_top_nft_sales() {
    const url = 'https://data.objkt.com/v3/graphql';
    const isoDateLast24Hours = getISODateForLast24Hours();

      try {
        const queryResult = await axios.post(url, {
          query: 
                `query test {
                    listing_sale(
                        limit: 10
                        where: {timestamp: {_gte: "${isoDateLast24Hours}"}}
                        order_by: {price_xtz: desc_nulls_last}
                      ) {
                        price_xtz
                        timestamp
                        sender_address
                        seller_address
                        buyer_address
                        token {
                          display_uri
                        }
                      }
                }`,
        });
    const result = queryResult.data.data;
    console.log(JSON.stringify(result, null, 4));
        }
    catch (error) {
            console.error('Error calling API: ', error);
            throw error;
        }
}

async function is_nft(address) {
  const url = 'https://data.objkt.com/v3/graphql';

  try {
      const queryResult = await axios.post(url, {
        query:`query MyQuery($distinct_on: [holder_select_column!] = address) {
          fa(where: {contract: {_in: "KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW"}}) {
            contract
          }`
      });
      if (queryResult.data.data.fa.contract === address) {
        return true;
      } else {
        return false;
      }
    }
      catch (error) {
        console.error('Error calling API: ', error);
        throw error;
    }
}

async function get_top_nft_collection() {
    const url = 'https://data.objkt.com/v3/graphql';
    const isoDateLast24Hours = getISODateForLast24Hours();

      try {
        const queryResult = await axios.post(url, {
          query: 
                `query test {
                    gallery(order_by: {volume_24h: desc_nulls_last}, limit: 10) {
                      active_auctions
                      active_listing
                      description
                      editions
                      floor_price
                      items
                      last_metadata_update
                      logo
                      max_items
                      metadata
                      name
                      owners
                      slug
                      volume_24h
                      volume_total
                    }
                }`,
        });
    const result = queryResult.data.data;
    console.log(JSON.stringify(result, null, 4));
        }
    catch (error) {
            console.error('Error calling API: ', error);
            throw error;
        }
}

async function get_10_last_calls_smart_contract(address) {
    const url = `https://api.tzstats.com/explorer/contract/${address}/calls?prim=1&order=desc&limit=10`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        // Handle any errors that may occur during the API call.
        console.error('Error calling API: ', error);
        throw error; // Throw the error to potentially be handled by the caller.
    }
}

async function get_creator_address(address) {
  const url = `https://api.tzstats.com/explorer/contract/${address}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data && data.creator) {
      return data.creator; // Extract and return the creator address
    } else {
      throw new Error('Creator address not found in the API response.');
    }
  } catch (error) {
    // Handle any errors that may occur during the API call.
    console.error('Error calling API: ', error);
    throw error; // Throw the error to potentially be handled by the caller.
  }
}
async function get_publication_date(address) {
    const url = `https://api.tzstats.com/explorer/contract/${address}`;
  
    try {
      const response = await axios.get(url);
      const data = response.data;
      return data.first_seen_time; // Extract and return the creator address
    } catch (error) {
      // Handle any errors that may occur during the API call.
      console.error('Error calling API: ', error);
      throw error; // Throw the error to potentially be handled by the caller.
    }
  }


  async function get_sold(address) {
  
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

  get_sold("KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC")
  .then(data => {
      console.log('Data from API: ', data);
  })
  .catch(error => {
      console.error('Error: ', error);
  });

  async function get_nft(address) {
    const url = 'https://data.objkt.com/v3/graphql';

    try {
        const queryResult = await axios.post(url, {
            query: 
            `query test {holder(where: {address: { _in: [${address}]}}){
held_tokens {
token {
fa {
creator_address
metadata
floor_price
}
display_uri
}
}
}}`,
        });
        const result = queryResult.data.data;
        return result;
    }
    catch (error) {
        console.error('Error calling API: ', error);
        throw error;
    }
}

async function getAccountLastTenTxs(account_address) {
  const tmp = [];
  const txs = [];

  try {
      const url = `https://api.tzstats.com/explorer/account/${account_address}/operations?limit=10&order=desc`;
      const response = await axios.get(url);

      if (response.status === 200) {
          const data = response.data;
          return data;
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

async function isWallet(string) {
  const   wallet = [];

  wallet.push(getAccountSold(string));
  wallet.push(getAccountLastTenTxs(string));
  wallet.push(get_nft(string));
  console.log(wallet);
}


async function  parsing_address(string) {
  if (typeof string !== 'string') {
      throw new Error('Input must be a string');
  }
  if (string.startsWith('tz')) {
      return "wallet"; 
  }
  else if (string.startsWith('KT')){
      return "smartContract";
  }
  else if (string.startsWith('op') || string.startsWith('oo') || string.startsWith('on')){
      return "operation"; 
  }
  else {
      throw new Error('This Hash is not a transaction, a wallet or a smart contract');
  }
}

async function getBlockNumber() {
  try {
    const tezos = new TezosToolkit(rpcEndpoint);

    const block = await tezos.rpc.getBlock();

    if (block && block.header && block.header.level) {
      const blockNumber = block.header.level;
      return blockNumber;
    } else {
      console.error('Block number not found in the response.');
    }
  } catch (error) {
    console.error('Error:', error);
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

async function getBlockDate() {
  try {
      const last_block = await getLastBlockHash();
      const url = `https://api.tzstats.com/explorer/block/${last_block}`;

      const response = await axios.get(url);    

      if (response.status === 200) {
          const data = response.data;
             const timestamp = data.time;
            
              return timestamp;
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

async function getSmartContractInfo(contractAddress) {

  try {
      const url = `https://api.tzstats.com/explorer/contract/${contractAddress}`;
      const response = await axios.get(url);
      
      if (response.status === 200) {
      const data = response.data;
      // console.log(data.address);
      // console.log(data.creator);
      // data.features.forEach((feature) => {
      //     console.log(feature);
      //   });
        return {
          address : data.address,
          creator : data.creator,
          features :data.features
        };

      } else {
      console.error('Failed to fetch external data. Status code:', response.status);
      }
      } catch (error) {
      console.error('Error:', error);
      }
      

    getT



// const apiKey = 'f94f3ccd-2ff3-4cee-b028-4c28c3e7166e'; // Get your API key from CoinMarketCap
// const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

// // Set up parameters for the request (e.g., top 50 cryptocurrencies)
// const params = {
//   start: 1,
//   limit: 50,
// };

// const headers = {
//   'X-CMC_PRO_API_KEY': apiKey,
// };

// async function getTop50Cryptos() {
//     try {
//       const response = await axios.get(apiUrl, { params, headers });
  
//       if (response.status === 200) {
//         const data = response.data.data;
//         const cryptoList = [];
  
//         data.forEach((crypto) => {
//           const cryptoData = {
//             name: crypto.name,
//             symbol: crypto.symbol,
//             price: crypto.quote.USD.price,
//           };
//           cryptoList.push(cryptoData);
//         });
  
//         return cryptoList;
//       } else {
//         throw new Error('Failed to fetch data. Status code:', response.status);
//       }
//     } catch (error) {
//       throw error;
//     }
//   }

//   getTop50Cryptos()
//   .then((cryptoList) => {
//     cryptoList.forEach((crypto) => {
//       console.log('Name:', crypto.name);
//       console.log('Symbol:', crypto.symbol);
//       console.log('Price:', `$${crypto.price}`);
//       console.log('--------------------------');
//     });
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });
