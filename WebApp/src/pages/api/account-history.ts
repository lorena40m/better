import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../endpoints/providers/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  const limit = req.query.limit;

  try {
    const { rows: history } = await pool.query('select t."Id", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", t."Amount" from "Accounts" as a INNER join "TransactionOps" as t on (t."SenderId" = A."Id" or t."TargetId" = A."Id") where a."Address" = $1 order by t."Timestamp" DESC limit $2', [address, limit]);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}