import axios from 'axios';
import {TezosToolkit} from '@taquito/taquito'

const rpcEndpoint = 'https://tezosrpc.midl.dev/ak-lpuoz6fm0tjlm1';

function getISODateForLast24Hours() {
  // Get the current date and time
  const currentDate = new Date();

  // Calculate the date and time 24 hours ago
  const twentyFourHoursAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  // Convert the date to an ISO 8601 format string
  const isoDateString = twentyFourHoursAgo.toISOString();

  return isoDateString;
}

async function get_fee() {
  return 0.0015;
}

async function getLastBlockHash() {
  try {
      const url = 'https://api.tzstats.com/explorer/tip';
      const response = await axios.get(url);    

      if (response.status === 200) {
          const data = response.data;
          const block_hash = data.block_hash;
          return block_hash;
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

async function get_trending_nft_collection() {
  const url = 'https://data.objkt.com/v3/graphql';
  const isoDateLast24Hours = getISODateForLast24Hours();

    try {
      const queryResult = await axios.post(url, {
        query: 
              `query test {
                  gallery(order_by: {volume_24h: desc_nulls_last}, limit: 50) {
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
                    gallery_id
                  }
              }`,
      });
  const collections = queryResult.data.data.gallery.map((item) => ({
    id: item.gallery_id, 
    image: item.logo,
    name: item.name,
    supply: item.items, 
    floorPrice: item.floor_price, 
    topSale: "", 
    marketplaceLink: "",
  }));
  return(collections)
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
                gallery(order_by: {volume_total: desc_nulls_last}, limit: 50) {
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
                  gallery_id
                }
              }`,
      });
  const collections = queryResult.data.data.gallery.map((item) => ({
    id: item.gallery_id, 
    image: item.logo,
    name: item.name,
    supply: item.items, 
    floorPrice: item.floor_price, 
    topSale: "", 
    marketplaceLink: "",
  }));
  return(collections)
      }
  catch (error) {
          console.error('Error calling API: ', error);
          throw error;
      }
}

const apiKey = 'f94f3ccd-2ff3-4cee-b028-4c28c3e7166e'; // Get your API key from CoinMarketCap
const apiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';


async function getTop50Cryptos_on_cap() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        start: 1,
        limit: 50,
        sort: "market_cap",
        sort_dir: "desc",
      },
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    if (response.status === 200) {
      const data = response.data.data;
      const cryptoList = [];

      data.forEach((crypto) => {
        const cryptoData = {
          id: "", // TO FILL 
          logo: "", // TO FILL 
          name: crypto.name,  
          ticker: crypto.symbol,  
          decimals : Math.floor(0), // TO FILL
          lastPrice: Math.floor(crypto.quote.USD.price*100),
          circulatingSupplyOnChain: crypto.circulating_supply,
          holders : Math.floor(0), // TO FILL

        };
        cryptoList.push(cryptoData);
      });

      return cryptoList;
    } 
    else {
      throw new Error(`Failed to fetch data. Status code: ${response.status}`);
    }
    
  } catch (error) {
    throw error;
  }
}

async function getTop50Cryptos_on_volume_24() {
  try {
    const response = await axios.get(apiUrl, {
      params: {
        start: 1,
        limit: 50,
        sort: "volume_24h",
        sort_dir: "desc",
      },
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
    });
    if (response.status === 200) {
      const data = response.data.data;
      const cryptoList = [];

      data.forEach((crypto) => {
        const cryptoData = {
          id: "", // TO FILL 
          logo: "", // TO FILL 
          name: crypto.name,  
          ticker: crypto.symbol,  
          decimals : Math.floor(0), // TO FILL
          lastPrice: Math.floor(crypto.quote.USD.price*100),
          circulatingSupplyOnChain: crypto.circulating_supply,
          holders : Math.floor(0), // TO FILL

        };
        cryptoList.push(cryptoData);
      });

      return cryptoList;
    } 
    else {
      throw new Error(`Failed to fetch data. Status code: ${response.status}`);
    }
    
  } catch (error) {
    throw error;
  }
}

export default async () => {
  return {
    stats : {
      ethPrice: await get_xtz_price(),
      normalFee: await get_fee(),
      lastBlockNumber: await getBlockNumber(),
      lastBlockDate: await getBlockDate(),
    },
    collections: {
      trending: await get_trending_nft_collection(), // paginated
      top: await get_top_nft_collection(), // paginated
    },
    // coins: {
    //   byCap: await getTop50Cryptos_on_cap(), // paginated
    //   byVolume: await getTop50Cryptos_on_volume_24(), // paginated
    // },
  }
}
