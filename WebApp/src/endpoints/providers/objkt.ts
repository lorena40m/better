import axios from 'axios'
import { ExtendedCollection, Collection, Nft, Holding } from '../API'
import { getAssetSources, getCollectionSources } from '@/utils/link'

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

export async function getTopNftCollection(pageSize, criteria: 'top' | 'trending') {
  const orderBy = {
    top: '{volume_total: desc_nulls_last}',
    trending: '{volume_24h: desc_nulls_last}',
  }[criteria]

  return (await fetch(`query collections {
    fa(order_by: ${orderBy}, limit: ${pageSize}) {
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
  }
  `))?.fa?.map((collection) => ({
    id: collection?.contract,
    image: getCollectionSources(collection?.logo),
    name: collection?.short_name || collection?.name,
    supply: collection?.items?.toString(),
    floorPrice: collection?.floor_price ?? null,
    topSale: null,
    marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? collection?.contract),
  } as ExtendedCollection)) as ExtendedCollection[]
}

export async function getAddressDomain(address: string) {
  const queryResult = await fetch(`query MyQuery {
     tzd_domain( where: {owner: {_eq: ${address}}}
      order_by: {expiry: desc}
  ) {
    id
    owner
    expiry
  }
}`)
  const domain = queryResult?.tzd_domain[0]?.id
  return domain ?? null
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
    image: getCollectionSources(collection?.logo),
    supply: collection?.items.toString(),
    floorPrice: collection?.floor_price,
    marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? address),
    timestamp: collection?.timestamp,
    volume_24h: collection?.volume_24h,
  }
}

// NB: Could be extended to get tokens also!
export async function getWalletNfts(address: string, xtzPrice: number) {
  const queryResult = await fetch(`query test {
    holder(where: {address: {_eq: "${address}"}}) {
      tzdomain
      held_tokens(where: {quantity: {_gt: "0"}, token: {decimals: {_eq: 0}}}) {
        quantity
        last_incremented_at
        token {
          name
          artifact_uri
          token_id
          fa {
            floor_price
            short_name
            name
            contract
            logo
          }
          events(
            limit: 1
            order_by: {timestamp: desc_nulls_last}
            where: {marketplace_event_type: {_in: ["list_buy","english_auction_settle","dutch_auction_buy","offer_accept","offer_floor_accept"]}}
          ) {
            timestamp
            price_xtz
            amount
          }
        }
      }
    }
  }`)

  return {
    tzDomain: queryResult.holder[0]?.tzdomain as string,
    nfts: (queryResult.holder[0].held_tokens.map(token => {
      const collection = token?.token?.fa
      const lastSalePrice = (+token?.token?.events?.[0]?.price_xtz || 0) * xtzPrice / 10**6 / (token?.token?.events?.[0]?.amount ?? 1)

      return {
        quantity: token?.quantity?.toString(),
        lastTransferDate: token?.last_incremented_at,
        value: lastSalePrice,
        asset: {
          id: collection?.contract + '_' + token?.token?.token_id,
          tokenId: token?.token?.token_id?.toString(),
          image: getAssetSources(token?.token?.artifact_uri, address, token?.token?.token_id),
          name: token?.token?.name,
          lastSalePrice,
          collection: ({
            id: collection?.contract,
            image: getCollectionSources(collection?.logo),
            name: collection?.short_name || collection?.name,
            floorPrice: collection?.floor_price ?? null,
          } as Collection),
        } as Nft
      } as Holding<Nft>
    }) as Holding<Nft>[])
      .sort((nft1, nft2) => nft2.value - nft1.value)
  }
}
