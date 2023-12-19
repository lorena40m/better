import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    const { rows: tokens } = await pool.query('select "TokenBalances"."Balance", "TokenBalances"."TokenId", "Tokens"."ContractId", "Tokens"."Metadata", a4."Address" from "Accounts" INNER join "TokenBalances" ON "Accounts"."Id" = "TokenBalances"."AccountId" INNER join "Tokens" ON "TokenBalances"."TokenId" = "Tokens"."Id" LEFT JOIN "Accounts" as a4 ON ("Tokens"."ContractId" = a4."Id") where "Accounts"."Address" = $1 and "TokenBalances"."Balance" <> \'0\'', [address]);
    // recuperer le storage des tokens afin de calculer le prix des tokens via : token_pool / tez_pool
    // sinon utiliser : https://temple-api-mainnet.prod.templewallet.com/api/exchange-rates
    res.status(200).json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}