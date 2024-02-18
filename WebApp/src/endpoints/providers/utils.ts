export const ipfsToHttps = (url: string | null) => {
	const gateways = process.env.IPFS_GATEWAY.split(',');
	return url?.slice(0, 4) === 'ipfs' ? gateways[0] + url.split('://')[1] : url;
};
