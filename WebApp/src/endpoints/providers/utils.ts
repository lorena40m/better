export const ipfsToHttps = (url: string | null) => url?.slice(0, 4) === 'ipfs' ? `https://ipfs.io/ipfs/${url.split('://')[1]}` : url
