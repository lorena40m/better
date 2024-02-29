import fetch from 'node-fetch';

export default function fetchCoinsInfos(req, res) {
    const requestBody = {
        operationName: "GetToken",
        query: `query GetToken($id: String!, $currency: CurrencyEnum) {
            token(id: $id) {
              id
              standard
              tokenId
              icon
              name
              symbol
              price
              priceChange(currency: $currency) {
                day
                week
                month
                __typename
              }
              liquidity
              liquidityChange {
                day
                week
                month
                __typename
              }
              volume24h
              volumeChange {
                day
                week
                month
                __typename
              }
              transactionsCount24h
              __typename
            }
          }`,
        variables: {
            id: req.query.id,
            currency: "XTZ"
        }
    };

    fetch('https://analytics-api.quipuswap.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        res.status(200).json(data.data.token);
    })
    .catch(error => {
        res.status(500).json({ error: 'Une erreur est survenue' });
    });
}