import fetch from 'node-fetch';

export default function fetchCoin(req, res) {
    fetch(`https://api.plenty.network/analytics/tokens/${req.query.symbol}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        res.status(200).json(data);
    })
    .catch(error => {
        res.status(500).json({ error: 'Une erreur est survenue' });
    });
}