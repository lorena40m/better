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
            //   console.log('External API Data:', data);
            console.log('Balance:', data.spendable_balance);

        } else {
          console.error('Failed to fetch external data. Status code:', response.status);
        }
        } catch (error) {
        console.error('Error:', error);
        }
    }

    async function getTransaction(transactionHash) {
        try {
            //const url = `https://api.tzstats.com/explorer/op/${transactionHash}`;
            const url = `https://api.tzkt.io/v1/operations/${transactionHash}`;

            const response = await axios.get(url);
            

            if (response.status === 200) {
                const data = response.data;
                   //console.log(data);
                   const senderAddress = data[0].sender.address;
                   const receiverAddress = data[1].target.address;
                   const amount = data[1].amount;
                   const fee = data[1].bakerFee;
                   const timestamp = data[0].timestamp;
                    // Access the sender address within each object

                    console.log('Sender Address:', senderAddress);
                    console.log('Receiver Address:', senderAddress);
                    console.log('Amount:', amount / 1000000);
                    console.log('Fee:', fee / 1000000);
                    console.log('Timestamp:', timestamp);
                  
    
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
                data.forEach(item => {
                  console.log('Sender: ', item.sender); 
                  console.log('Receiver: ', item.receiver);
                  if (item.parameters.value.amount > 0)
                    console.log('Amount: ', item.parameters.value.amount / 10000000); 
                });
              } else {
                console.error('Failed to fetch external data. Status code:', response.status);
              }
            }
            } catch (error) {
              console.error('Error:', error);
            }
        }

        
          
           
const address = 'tz2QSeubMa6SBJDYZkCns6pn3MH8mnzHKE5C';
const transaction_hash = 'oo2GUBUnwYxwPA8NoCrX2ARhF15QtsWi2Jiz9TZSdWYxgNXAeru';
//const nftAddress = 'KT1EVoe4AbGVJqm9oacTy3SUp6nEmtaEMfzn';
// getBlockNumber();
// getAccountSold(address);
// getAccountLastTenTxs(address);
// getTransaction(transaction_hash);

async function fetchData() {
    const query = `
      query test {
        holder(where: {contract = { _in: ["tz1iCyoF8BbMCvb1Zrw6CBDUrbsJTwBavmRa"]}}) {
          dns
          held_tokens {
            token {
              fa {
                creator_address
                metadata
                floor_price
              }
            }
          }
        }
      }
    `;
  
    // Define the URL of objkt.com's GraphQL endpoint
    const apiUrl = 'https://data.objkt.com/v3/graphql'; 
  
    try {
        const queryResult = await axios.post(apiUrl, { query });
        console.log('Response:', queryResult.data);
        

        const result = queryResult.data.data;
        if (result) {
          // Continue with processing the data.
        } else {
          console.log('No data in the response.');
        }
      } catch (error) {
        console.error('API fetch failed:', error);
        throw error;
      }
}
  fetchData(); 
