import axios from "axios";

async function fetch(url) {
	try {
		const response = await axios.get(`/api/${url}`);
		return (response.data);
	} catch (err) {
		console.error(`Error on /api/${url} :`, err);
	}
}

export async function fetchAccountTokens(address) {
	const response = await fetch(`account-tokens?address=${address}`);
	const domains = [];
	const nfts = [];
	const coins = [];
	const othersTokens = [];
	response.map((token) => {
		if (token.Metadata) {
			if (token.Metadata.decimals) {
				if (token.Metadata.decimals === "0") {
					if (token.Metadata.artifactUri) {
						nfts.push(token);
					} else if (token.ContractId === 1262424) {
						domains.push(token);
					} else {
						othersTokens.push(token);
					}
				} else {
					coins.push(token);
				}
			} else {
				othersTokens.push(token);
			}
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
	const response = await fetch(`account-infos?address=${address}`);
	return ({
		balance: response.Balance,
		transactionsCount: response.TransactionsCount,
		id: response.Id,
	});
}

export async function fetchAccountTransactionsHistory(address, limit) {
	const response = await fetch(`/account-history?address=${address}&limit=${limit}`);
	return (response);
}