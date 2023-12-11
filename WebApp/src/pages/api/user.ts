import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  const historyLimit = req.query.historyLimit;

  try {
    const { rows: user} = await pool.query('SELECT "Balance", "Address", "TransactionsCount" FROM "Accounts" WHERE "Address" = $1', [address]);
    const { rows: history } = await pool.query('select t.*, a."Address"  from "Accounts" as a INNER join "TransactionOps" as t on (t."SenderId" = A."Id" or t."TargetId" = A."Id") where a."Address" = $1 order by t."Timestamp" DESC limit $2', [address, historyLimit]);
    const { rows: tokens } = await pool.query('select "TokenBalances"."Balance", "TokenBalances"."TokenId", "Tokens"."ContractId", "Tokens"."Metadata" from "Accounts" INNER join "TokenBalances" ON "Accounts"."Id" = "TokenBalances"."AccountId" INNER join "Tokens" ON "TokenBalances"."TokenId" = "Tokens"."Id" where "Accounts"."Address" = $1 and "TokenBalances"."Balance" <> \'0\'', [address]);
    // recuperer le storage des tokens afin de calculer le prix des tokens via : token_pool / tez_pool
    // sinon utiliser : https://temple-api-mainnet.prod.templewallet.com/api/exchange-rates
    const response = {
      user: user[0],
      history: history,
      tokens: tokens
    }
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}