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

  return (await fetch(`query test {
    gallery(order_by: ${orderBy}, limit: ${pageSize}) {
      active_auctions
      active_listing
      description
      editions
      floor_price
      items
      last_metadata_update
      logo
      max_items
      metadata
      name
      owners
      slug
      volume_24h
      volume_total
      gallery_id
    }
  }`))?.gallery?.map((item) => ({
    id: item.gallery_id,
    image: ipfsToHttps(item?.logo),
    name: item.name,
    supply: item.items ? item.items.toString() : "0",
    floorPrice: item.floor_price ? item.floor_price.toString(): "0",
    topSale: "", // TODO : request topSale
    marketplaceLink:"", // TODO : request marketplaceLink
  } as Collection)) as Collection[]
}

export async function getWalletNfts(address: string) {
  const queryResult = await fetch(`query test {
    holder(where: {address: {_in: [${address}]}}) {
      held_tokens {
        token {
          fa {
            creator_address
            metadata
            floor_price
            name
            contract
            token_link
            index_contract_metadata
            website
            collection_id
            collection_type
          }
          display_uri
          token_id
          galleries {
            gallery {
              floor_price
              items
              max_items
              logo
            }
            fa_contract
          }
        }
      }
    }
  }
  `)

  const heldTokens = queryResult.holder[0].held_tokens

  return heldTokens.map((token) => {
    const faData = token.token.fa
    const galleryData = token.token.galleries?.[0]?.gallery
    // const creatorAddress = faData.creator_address

    return {
      id : faData.contract.concat("#", token.token.token_id),
      image : token.token.display_uri,
      name : faData.name,
      collection : {
        id : faData.contract,
        image : galleryData?.logo,
        name : galleryData?.name,
        supply : galleryData?.max_items,
        floorPrice : galleryData?.floor_price,
        topSale : 0, // TO FILL
        marketplaceLink : "", // TO FILL
      } as Collection,
    } as Nft
  }) as Nft[]
}
