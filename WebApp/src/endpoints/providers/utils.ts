export const ipfsToHttps = (url: string | null) => url?.slice(0, 4) === 'ipfs' ? process.env.IPFS_GATEWAY + url.split('://')[1] : url
