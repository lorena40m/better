const gateways = process.env.IPFS_GATEWAY.split(',')

export function ipfsToHttps(url: string | null) {
  return url?.slice(0, 4) === 'ipfs' ? gateways[0] + url.split('://')[1] : url
}

// via objkt's collection.logo
// Collections that uses https like dogami (aws), stables (rarible) are available via collection.logo
// Special collections like hicetnunc, objktone, fxhash, 8bidou 8x8 are stored on obkjt and also available in collection.logo
// https://assets.objkt.media/file/assets-002/collection-logos/hicetnunc.jpeg
// Other that use IPFS id
// https://assets.objkt.media/file/assets-003/Qmf7NzaxhfmVTKuMGyBXoASX26EsP4uJeGigua9k3K19XL/thumb288
export function getCollectionSources(url: string | null): string[] | null {
  if (!url) return

  if (url.startsWith('http')) {
    return [url]
  }
  if (url.startsWith('ipfs')) {
    const ipfsId = url.split('://')[1]
    return [
      `https://assets.objkt.media/file/assets-003/${ipfsId}/thumb288`,
      ...gateways.map((gateway) => (gateway + ipfsId)), // Defaults with gateways
    ]
  }
}

// asset
// https://assets.objkt.media/file/assets-003/KT1AESo9UrxV3fEErfMeBhFuCdAXz2UFC2ek/1/thumb400
export function getAssetSources(url: string | null, contractHash: string, tokenId: string): string[] | null {
  if (!url) return

  if (url.startsWith('http')) {
    return [url]
  }
  if (url.startsWith('ipfs')) {
    const ipfsId = url.split('://')[1]
    if (contractHash && tokenId) {
      return [
        `https://assets.objkt.media/file/assets-003/${contractHash}/${tokenId}/thumb400`,
        ...gateways.map((gateway) => (gateway + ipfsId)), // Defaults with gateways
      ]
    } else {
      return [
        ...gateways.map((gateway) => (gateway + ipfsId)),
      ]
    }
  }
}
