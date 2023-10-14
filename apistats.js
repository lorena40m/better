const axios = require('axios');

function getISODateForLast24Hours() {
    // Get the current date and time
    const currentDate = new Date();
  
    // Calculate the date and time 24 hours ago
    const twentyFourHoursAgo = new Date(currentDate - 24 * 60 * 60 * 1000);
  
    // Convert the date to an ISO 8601 format string
    const isoDateString = twentyFourHoursAgo.toISOString();
  
    return isoDateString;
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

