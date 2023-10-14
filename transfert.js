const axios = require('axios');

async function getTransactionSender(transactionHash) {
    try {
      const url = `https://api.tzkt.io/v1/operations/${transactionHash}?meta=true`;
  
      const response = await axios.get(url);
  
      if (response.status === 200) {
        const data = response.data;
        return data;
      } else {
        console.error('Failed to fetch external data. Status code:', response.status);
        console.error('Response Data:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  
  const hash = 'opUKYEyngxGtd9w5k8kHJJaCL4hbvmi5hSHa1NnoXugpEhE3ra5';
  getTransactionSender(hash)
    .then(result => {
      if (result) {
        console.log('Transaction Meta Data:', result);
        console.log('THE TOKEN value = ', result.value[0].txs.amount);
      } else {
        console.log('Transaction meta data not available or error occurred.');
      }
    });
  
    //node transfert.js
    // on voit alors apparaitre le token dans la console avec son alias, par exemple dans
    // cette tx "Tether Token (usdct)"
    // la value est dans array 
    // la valeur en USDT est de 3100,26$