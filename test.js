const axios = require('axios');

async function is_nft(address) {
    const url = 'https://data.objkt.com/v3/graphql';
  
    try {
        const queryResult = await axios.post(url, {
          query:
          `query test {
            fa(where: {contract: {_in: "${address}"}}) {
              contract
            }}`
        });
        console.log(queryResult.data);
        if (
            queryResult.data.data.length > 0
        ) {
            return 1;
        } else {
            return 0;
        }
      }
        catch (error) {
          console.error('Error calling API: ', error);
          throw error;
      }
  }
//doit print true si il detecte que c'est un nft sauf que ca le fait pas 
  if (is_nft('KT1LjmAdYQCLBjwv4S2oFkEzyHVkomAf5MrW') === 1) {
      console.log('true')
  } else {  
      console.log('false')
  }