import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  const limit = req.query.limit;

  try {
    const queryTransactions = `
      SELECT t."Id", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", t."Amount"
      FROM "Accounts" as a
      INNER JOIN "TransactionOps" as t ON (t."SenderId" = A."Id" or t."TargetId" = A."Id")
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2
    `;
    const { rows: history } = await pool.query(queryTransactions, [address, limit]);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}