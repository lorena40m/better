import { Coin, Nft as _Nft } from '@/backend/apiTypes'
import { query } from '@/backend/providers/db'
import type { NextApiRequest, NextApiResponse } from 'next'

export type Nft = _Nft & {
  collection: {
    name: string
  }
}

export type { Coin }

export type Holding<T> = {
  ContractId: number
  TokenId: number
  Address: string
  quantity: string
  asset: T
}

export type AccountTokens = {
  coins: Holding<Coin>[]
  nfts: Holding<Nft>[]
  domains: Holding<Nft>[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address

  try {
    type DbToken = {
      ContractId: number
      TokenId: number
      Address: string
      quantity: string
      asset: Coin | Nft
    }

    //TODO : add value in dollars, add lastPrice into Asset object and check that it's the right id
    const tokens: DbToken[] = await query(
      'TOKENS',
      `
      SELECT
        "Tokens"."ContractId",
        "Tokens"."TokenId",
        contract."Address" as "Address",
        SUM("TokenBalances"."Balance"::NUMERIC) AS "quantity",
        CASE
          WHEN (("Tokens"."Metadata"->>'decimals')::INT > 0) THEN
            jsonb_build_object(
              'assetType', 'coin',
              'id', "Tokens"."ContractId",
              'name', "Tokens"."Metadata"->>'name',
              'image', COALESCE("Tokens"."Metadata"->>'displayUri', "Tokens"."Metadata"->>'artifactUri', "Tokens"."Metadata"->>'thumbnailUri'),
              'ticker', "Tokens"."Metadata"->>'symbol',
              'decimals', ("Tokens"."Metadata"->>'decimals')::INT
            )
          WHEN (("Tokens"."Metadata"->>'decimals')::INT = 0) THEN
            jsonb_build_object(
              'assetType', 'nft',
              'id', contract."Address" || '_' || "Tokens"."TokenId",
              'name', "Tokens"."Metadata"->>'name',
              'image', COALESCE("Tokens"."Metadata"->>'thumbnailUri', "Tokens"."Metadata"->>'displayUri', "Tokens"."Metadata"->>'artifactUri'),
              'collection', jsonb_build_object(
                'name', contract."Metadata"->>'name'
              )
            )
        END asset
      FROM
        "Accounts"
      INNER JOIN
        "TokenBalances" ON "Accounts"."Id" = "TokenBalances"."AccountId"
      INNER JOIN
        "Tokens" ON "TokenBalances"."TokenId" = "Tokens"."Id"
      LEFT JOIN
        "Accounts" as contract ON "Tokens"."ContractId" = contract."Id"
      WHERE
        "Accounts"."Address" = $1 AND "TokenBalances"."Balance" <> '0'
      GROUP BY
        "TokenBalances"."TokenId",
        "Tokens"."TokenId",
        "Tokens"."ContractId",
        "Tokens"."Metadata",
        contract."Metadata",
        contract."Address"
    `,
      [address],
    )

    const domains: Holding<Nft>[] = []
    const nfts: Holding<Nft>[] = []
    const coins: Holding<Coin>[] = []

    tokens.forEach(token => {
      if (token.asset?.assetType === 'coin') {
        coins.push(token as Holding<Coin>)
      } else if (token.ContractId === 1262424) {
        domains.push(token as Holding<Nft>)
      } else if (token.asset?.assetType === 'nft') {
        nfts.push(token as Holding<Nft>)
      } else {
        console.warn('WHAT IS THIS TOKEN?!? not displayed', token)
      }
    })

    res.status(200).json({
      domains,
      nfts,
      coins,
    } as AccountTokens)
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` })
    console.error(err)
  }
}
