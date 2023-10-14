const { TezosToolkit } = require('@taquito/taquito');
const { MichelCodecPacker } = require('@taquito/michel-codec');
const { InMemorySigner } = require('@taquito/signer');
const axios = require('axios');

const rpcEndpoint = 'https://tezosrpc.midl.dev/ak-lpuoz6fm0tjlm1';

async function getBlockNumber() {
  try {
    const tezos = new TezosToolkit(rpcEndpoint);

    const block = await tezos.rpc.getBlock();

    if (block && block.header && block.header.level) {
      const blockNumber = block.header.level;
      console.log(`Current Block Number: ${blockNumber}`);
    } else {
      console.error('Block number not found in the response.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getAccountSold(account_address) {
    try {
        const url = `https://api.tzstats.com/explorer/account/${account_address}`;
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

    async function getTransactionSender(transactionHash) {
        try {
            const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

            const response = await axios.get(url);
            

            if (response.status === 200) {
                const data = response.data;
                   //console.log(data);
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

    async function getAccountLastTenTxs(account_address) {
        try {
            const url = `https://api.tzstats.com/explorer/account/${account_address}/operations?limit=10&order=desc`;
            const response = await axios.get(url);
        
            if (response.status === 200) {
              const data = response.data;

              if (Array.isArray(data)) {
                return data;
              } else {
                console.error('Failed to fetch external data. Status code:', response.status);
              }
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
}

const apiKey = 'f94f3ccd-2ff3-4cee-b028-4c28c3e7166e'; // Get your API key from CoinMarketCap
const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

// Set up parameters for the request (e.g., top 50 cryptocurrencies)
const params = {
  start: 1,
  limit: 100,
};

const headers = {
  'X-CMC_PRO_API_KEY': apiKey,
};

async function getTop50Cryptos() {
    try {
      const response = await axios.get(apiUrl, { params, headers });
  
      if (response.status === 200) {
        const data = response.data.data;
        const cryptoList = [];
  
        data.forEach((crypto) => {
          const cryptoData = {
            name: crypto.name,
            symbol: crypto.symbol,
            price: crypto.quote.USD.price,
          };
          cryptoList.push(cryptoData);
        });
  
        return cryptoList;
      } else {
        throw new Error('Failed to fetch data. Status code:', response.status);
      }
    } catch (error) {
      throw error;
    }
  }

  getTop50Cryptos()
  .then((cryptoList) => {
    cryptoList.forEach((crypto) => {
      console.log('Name:', crypto.name);
      console.log('Symbol:', crypto.symbol);
      console.log('Price:', `$${crypto.price}`);
      console.log('--------------------------');
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });

// async function main() {
//     try {
//       //const senderAddress = await getTransactionSender(transaction_hash);
//       //getSmartContractInfo('KT1Pyd1r9F4nMaHy8pPZxPSq6VCn9hVbVrf4');
//       //console.log('Sender Address:', senderAddress);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }
  
//   main();

