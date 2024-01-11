import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    //TODO : add value in dollars, add lastPrice into Asset object and check that it's the right id 
    const tokens = await query('TOKENS', `

    SELECT
        "TokenBalances"."TokenId",
        CASE
        WHEN (("Tokens"."Metadata"->>'decimals')::INT > 0) THEN
            jsonb_build_object(
                'assetType', 'coin',
                'address', MIN(contract."Address"),
                'id', "Tokens"."ContractId",
                'name', "Tokens"."Metadata"->>'name',
                'ticker', "Tokens"."Metadata"->>'symbol',
                'decimals', ("Tokens"."Metadata"->>'decimals')::INT,
                'logo', "Tokens"."Metadata"->>'thumbnailUri',
                'lastPrice', 0
            )
        WHEN (("Tokens"."Metadata"->>'decimals')::INT = 0) THEN
            jsonb_build_object(
                'assetType', 'nft',
                'id', "Tokens"."ContractId",
                'image', "Tokens"."Metadata"->>'thumbnailUri',
                'name', "Tokens"."Metadata"->>'name',
                'lastSalePrice', 0,
                'collection', 'to_implement' 
            )
    END Asset, 
        SUM("TokenBalances"."Balance"::NUMERIC) AS "quantity"
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
        "Tokens"."ContractId",
        "Tokens"."Metadata"
      `, [address]);
    // recuperer le storage des tokens afin de calculer le prix des tokens via : token_pool / tez_pool
    // sinon utiliser : https://temple-api-mainnet.prod.templewallet.com/api/exchange-rates
    res.status(200).json(tokens);
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` });
    console.error(err)
  }
}
