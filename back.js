const axios = require('axios');

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

async function isSmartContract(string) {
    return 0;
}

async function isOperation(string) {
    return 0;
}

async function  parsing(string) {
    if (typeof string !== 'string') {
        throw new Error('Input must be a string');
    }
    if (string.startsWith('tz')) {
        return isWallet(string); 
    }
    else if (string.startsWith('KT')){
        return isSmartContract(string);
    }
    else {
        return isOperation(string); 
    }
}

parsing(`tz1TWrPXuG3T3rR9NR5EqsBegJMwiMcobjkt`);
