import axios from "axios";

async function fetchDatabase(url) {
	try {
		const response = await axios.get(`/api/${url}`);
		return (response.data);
	} catch (err) {
		console.error(`Error on /api/${url} :`, err);
	}
}

export async function fetchAccountTokens(address) {
	const response = await fetchDatabase(`account-tokens?address=${address}`);
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
	const response = await fetchDatabase(`account-infos?address=${address}`);
	return ({
		balance: response.Balance,
		transactionsCount: response.TransactionsCount,
		id: response.Id,
	});
}

export async function fetchContractInfos(address) {
	const response = await fetchDatabase(`contract-infos?address=${address}`);
	return ({
		balance: response.Balance,
		transactionsCount: response.TransactionsCount,
		id: response.Id,
		creatorAddress: response.Address
	});
}

export async function fetchAccountTransactionsHistory(address, limit) {
	const response = await fetchDatabase(`/account-history?address=${address}&limit=${limit}`);
	return (response);
}