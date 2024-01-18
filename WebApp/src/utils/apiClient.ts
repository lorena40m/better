import axios from "axios";

async function fetchApi(url) {
	try {
		const response = await axios.get(`/api/${url}`);
		return (response.data);
	} catch (err) {
		console.error(`Error on /api/${url}:`, err);
	}
}

export async function fetchAccountTokens(address) {
	const response = await fetchApi(`account-tokens?address=${address}`);
	const domains = [];
	const nfts = [];
	const coins = [];
	const othersTokens = [];
	response.map((token) => {
		if (token.asset?.assetType === 'coin') {
			coins.push(token);
		} else if (token.asset?.assetType === 'nft') {
			nfts.push(token);
		} else if (token.asset?.id === 1262424) {
			domains.push(token);
		} else {
			othersTokens.push(token);
		}
	});

	return({
		domains: domains,
		nfts: nfts,
		coins: coins,
		othersTokens: othersTokens,
	});
};

export async function fetchAccountInfos(address) {
	const response = await fetchApi(`account-infos?address=${address}`);
	return ({
		balance: response.Balance,
		transactionsCount: response.TransactionsCount,
		id: response.Id,
	});
}

export async function fetchContractInfos(address) {
	const response = await fetchApi(`contract-infos?address=${address}`);
	return ({
		balance: response.Balance,
		transactionsCount: response.TransactionsCount,
		id: response.Id,
		creatorAddress: response.Address
	});
}
export function fetchAccountHistory(address, limit) {
	const history$ = fetchApi(`/account-history?address=${address}&limit=${limit}`)
		.then(response => response.history)
	const aliases$ = history$.then(history => {
		const addresses = history.flat(1).map(operation => operation.counterparty.address)
		return fetchApi(`/account-names?addresses=${addresses.join(',')}`)
			.then(response => response.aliases)
	})
	return [history$, aliases$];
}
