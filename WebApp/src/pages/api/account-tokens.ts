import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    const tokens = await query('TOKENS', `

    SELECT
        "TokenBalances"."TokenId",
        SUM("TokenBalances"."Balance"::NUMERIC) AS "TotalBalance",
        "Tokens"."ContractId",
        "Tokens"."Metadata"
    FROM
        "Accounts"
    INNER JOIN
        "TokenBalances" ON "Accounts"."Id" = "TokenBalances"."AccountId"
    INNER JOIN
        "Tokens" ON "TokenBalances"."TokenId" = "Tokens"."Id"
    WHERE
        "Accounts"."Address" = $1 AND "TokenBalances"."Balance" <> '0'
    GROUP BY
        "TokenBalances"."TokenId",
        "Tokens"."ContractId",
        "Tokens"."Metadata"
    HAVING
        MAX(("Tokens"."Metadata"->>'decimals')::INT) > 0;
      `, [address]);
    // recuperer le storage des tokens afin de calculer le prix des tokens via : token_pool / tez_pool
    // sinon utiliser : https://temple-api-mainnet.prod.templewallet.com/api/exchange-rates
    res.status(200).json(tokens);
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` });
    console.error(err)
  }
}
