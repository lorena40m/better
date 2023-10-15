import axios from 'axios';

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

export default (params: {
  pageSize: number,
}) => {
  return {
    rateEurUsd: 0.95,
    xtzPrice: get_xtz_price(), // TODO
  }
}
