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
      (SELECT t."Id", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", t."Amount",
      a."Address" as "SenderAddress", a2."Address" as "TargetAddress"
      FROM "Accounts" as a
      INNER JOIN "TransactionOps" as t ON (t."SenderId" = a."Id")
      LEFT JOIN "Accounts" as a2 ON t."TargetId" = a2."Id"
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      UNION
      (SELECT t."Id", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", t."Amount",
      a3."Address" as "SenderAddress", a."Address" as "TargetAddress"
      FROM "Accounts" as a
      INNER JOIN "TransactionOps" as t ON (t."TargetId" = a."Id")
      LEFT JOIN "Accounts" as a3 ON t."SenderId" = a3."Id"
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      ORDER BY "Timestamp" DESC
      LIMIT $2
    `; // t."TargetId" = A."Id"
    const { rows: history } = await pool.query(queryTransactions, [address, limit]);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}
