import axios from 'axios'
import { Collection, Nft } from '../API'
import { ipfsToHttps } from './utils'

// function getISODateForLast24Hours() {
//   // Get the current date and time
//   const currentDate = new Date();

//   // Calculate the date and time 24 hours ago
//   const twentyFourHoursAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

//   // Convert the date to an ISO 8601 format string
//   const isoDateString = twentyFourHoursAgo.toISOString();

//   return isoDateString;
// }

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
    image: ipfsToHttps(collection?.logo),
    name: collection?.short_name || collection?.name,
    supply: collection?.items?.toString(),
    floorPrice: collection?.floor_price ?? null,
    topSale: null,
    marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? collection?.contract),
  } as Collection)) as Collection[]
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
  }
}
`)
  const collection = queryResult.fa[0]
  const collectionObject = {
    id: address,
    name: collection?.name,
    image: ipfsToHttps(collection?.logo),
    supply: collection?.items.toString(),
    floorPrice: collection?.floor_price,
    topSale: null,
    marketplaceLink: 'https://objkt.com/collection/' + collection?.path, // TODO : request marketplaceLink
  }
  return collectionObject
}

export async function getWalletNfts(address: string, xtzPrice: number) {
  const queryResult = await fetch(`query test {
    holder(where: {address: {_in: [tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX]}}) {
      held_tokens(where: {quantity: {_gt: "0"}, token: {decimals: {_eq: 0}}}) {
        token {
          display_uri
          token_id
          fa_contract
          fa {
            floor_price
            name
            contract
            volume_total
            logo
            items
            path
            short_name
          }
          events(
            limit: 1
            order_by: {timestamp: desc_nulls_last}
            where: {marketplace_event_type: {_in: ["list_buy","english_auction_settle","dutch_auction_buy","offer_accept","offer_floor_accept"]}}
          ) {
            timestamp
            price_xtz
            amount
            marketplace_event_type
            event_type
          }
        }
        quantity
        last_incremented_at
      }
    }
  }
  `)

  const heldTokens = queryResult.holder[0].held_tokens

  return heldTokens.map(token => {
    const collection = token?.token?.fa

    return {
      id: collection?.contract + '_' + token?.token?.token_id,
      image: token?.token?.display_uri,
      name: collection?.name,
      lastSalePrice: token?.token?.events?.price_xtz * xtzPrice / 10**6 / token?.token?.events?.amount,
      lastTransferDate: token.last_incremented_at,
      collection: ({
        id: collection?.contract,
        image: ipfsToHttps(collection?.logo),
        name: collection?.short_name || collection?.name,
        supply: collection?.items,
        floorPrice: collection?.floor_price ?? null,
        topSale: null,
        marketplaceLink: 'https://objkt.com/collection/' + (collection?.path ?? collection?.contract),
      } as Collection),
    } as Nft
  }) as Nft[]
}
