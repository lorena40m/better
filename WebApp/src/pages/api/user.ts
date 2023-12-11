import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  try {
    const { rows: user} = await pool.query('SELECT "Balance", "Address", "TransactionsCount" FROM "Accounts" WHERE "Address" = $1', [address]);
    const { rows: history } = await pool.query('select t.*, a."Address"  from "Accounts" as a INNER join "TransactionOps" as t on t."SenderId" = A."Id" where a."Address" = $1', [address]);
    const response = {
      user : user,
      history: history
    }
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}