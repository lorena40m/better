import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { Nft as _Nft, Coin } from './_apiTypes'
import { getAssetSources } from '@/utils/link'

export type Nft = _Nft & {
  collection: {
    name: string,
  }
}

export type { Coin }

export type Holding<T> = {
  ContractId: number,
  TokenId: number,
  Address: string,
  quantity: string,
  asset: T,
}

export type AccountTokens = {
  coins: Holding<Coin>[],
  nfts: Holding<Nft>[],
  domains: Holding<Nft>[],
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    //TODO : add value in dollars, add lastPrice into Asset object and check that it's the right id
    const tokens = await query('TOKENS', `
      SELECT
        "Tokens"."ContractId",
        "Tokens"."TokenId",
        MIN(contract."Address") as "Address",
        SUM("TokenBalances"."Balance"::NUMERIC) AS "quantity",
        CASE
          WHEN (("Tokens"."Metadata"->>'decimals')::INT > 0) THEN
            jsonb_build_object(
              'assetType', 'coin',
              'id', "Tokens"."ContractId",
              'name', "Tokens"."Metadata"->>'name',
              'image', COALESCE("Tokens"."Metadata"->>'thumbnailUri', "Tokens"."Metadata"->>'displayUri', "Tokens"."Metadata"->>'artifactUri'),
              'ticker', "Tokens"."Metadata"->>'symbol',
              'decimals', ("Tokens"."Metadata"->>'decimals')::INT
            )
          WHEN (("Tokens"."Metadata"->>'decimals')::INT = 0) THEN
            jsonb_build_object(
              'assetType', 'nft',
              'id', "Tokens"."ContractId",
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
        contract."Metadata"
    `, [address]);

    const domains: Holding<Nft>[] = [];
    const nfts: Holding<Nft>[] = [];
    const coins: Holding<Coin>[] = [];

    tokens.forEach((token) => {
      if (token.asset?.assetType === 'coin') {
        coins.push(token);
      } else if (token.asset?.ContractId === 1262424) {
        domains.push(token);
      } else if (token.asset?.assetType === 'nft') {
        if (token?.asset?.image) {
          token.asset.image = getAssetSources(token.asset.image, token.Address, token.TokenId)
        }

        nfts.push(token);
      } else {
        console.error('WHAT IS THIS TOKEN?!? not displayed', token);
      }
    });

    res.status(200).json({
      domains,
      nfts,
      coins,
    } as AccountTokens);
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` });
    console.error(err)
  }
}
