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
      (SELECT t."Id", t."Entrypoint", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", CAST(t."Amount" as TEXT), CAST(NULL as JSONB) as "Metadata",
      a."Address" as "SenderAddress", a2."Address" as "TargetAddress"
      FROM "Accounts" as a
      INNER JOIN "TransactionOps" as t ON (t."SenderId" = a."Id")
      LEFT JOIN "Accounts" as a2 ON t."TargetId" = a2."Id"
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      UNION
      (SELECT t."Id", t."Entrypoint", t."OpHash", t."SenderId", t."TargetId", t."Timestamp", t."Status", CAST(t."Amount" as TEXT), CAST(NULL as JSONB) as "Metadata",
      a3."Address" as "SenderAddress", a."Address" as "TargetAddress"
      FROM "Accounts" as a
      INNER JOIN "TransactionOps" as t ON (t."TargetId" = a."Id")
      LEFT JOIN "Accounts" as a3 ON t."SenderId" = a3."Id"
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      UNION
      (SELECT t."Id", t."Entrypoint", t."OpHash", tt."FromId" as "SenderId", tt."ToId" as "TargetId", t."Timestamp", t."Status", tt."Amount", tok."Metadata",
      a4."Address" as "TargetAddress", a."Address" as "SenderAddress"
      FROM "Accounts" as a
      INNER JOIN "TokenTransfers" as tt ON (tt."ToId" = a."Id")
      INNER JOIN "Tokens" as tok ON tok."Id" = tt."TokenId"
      INNER JOIN "TransactionOps" as t ON (t."Id" = tt."TransactionId")
      LEFT JOIN "Accounts" as a4 ON (tt."FromId" = a4."Id")
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      UNION
      (SELECT t."Id", t."Entrypoint", t."OpHash", tt."FromId" as "SenderId", tt."ToId" as "TargetId", t."Timestamp", t."Status", tt."Amount", tok."Metadata",
      a."Address" as "SenderAddress", a4."Address" as "TargetAddress"
      FROM "Accounts" as a
      INNER JOIN "TokenTransfers" as tt ON (tt."FromId" = a."Id")
      INNER JOIN "Tokens" as tok ON tok."Id" = tt."TokenId"
      INNER JOIN "TransactionOps" as t ON (t."Id" = tt."TransactionId")
      LEFT JOIN "Accounts" as a4 ON (tt."ToId" = a4."Id")
      WHERE a."Address" = $1
      ORDER BY t."Timestamp" DESC
      LIMIT $2)
      ORDER BY "Id" DESC
      LIMIT $2
    `; // t."TargetId" = A."Id"
    const { rows: history } = await pool.query(queryTransactions, [address, limit]);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` });
  }
}
