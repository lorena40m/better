import axios from 'axios'
import { UrlString, Dollars, Integer } from '@/backend/apiTypes'

export type ExtendedCollection = {
  id: string,
  name: string,
  image: UrlString,
  floorPrice: Dollars,
  topSale: Dollars,
  marketplaceLink: UrlString,
  supply: Integer,
}

async function fetch(query) {
  const url = 'https://data.objkt.com/v3/graphql'

  try {
    const queryResult = await axios.post(url, { query })
    return queryResult.data.data
  }
  catch (error) {
    console.error('Error calling API: ', error)
  }

  return null
}

export async function getTopNftCollection(pageSize = 10) {
  const makeRequest = criteria => `
    fa(order_by: {${criteria}: desc_nulls_last}, limit: ${pageSize}) {
      volume_total
      volume_24h
      contract
      name
      items
      floor_price
      logo
      category
      short_name
      path
    }
  `

  const data = await fetch(`query collections {
    top: ${makeRequest('volume_total')}
    trending: ${makeRequest('volume_24h')}
  }
  `)

  const formatCollections = collections => collections.map((collection) => ({
    id: collection?.contract,
    image: collection?.logo,
    name: collection?.short_name || collection?.name,
    supply: collection?.items?.toString(),
    floorPrice: collection?.floor_price ?? null,
    topSale: null,
    marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? collection?.contract),
  } as ExtendedCollection)) as ExtendedCollection[]

  return {
    top: formatCollections(data.top),
    trending: formatCollections(data.trending),
  }
}

export async function getCollection(address: string) {
  const queryResult = await fetch(`query collection_by_id {
    fa(where: {contract: {_eq: ${address}}}) {
      name
      logo
      floor_price
      items
      path
      timestamp
      volume_24h
    }
  }`)
  const collection = queryResult.fa[0]
  return {
    id: address,
    name: collection?.short_name || collection?.name,
    image: collection?.logo,
    supply: collection?.items.toString(),
    floorPrice: collection?.floor_price,
    marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? address),
    timestamp: collection?.timestamp,
    volume_24h: collection?.volume_24h,
  }
}
