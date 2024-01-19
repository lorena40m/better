import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes'

export type Contract = {
  id: string,
  creationDate: DateString,
  balance: string,
  operationCount: number,
  creatorAddress: string,
  creatorDomain: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;

  try {
    const contract = await query('ACCOUNT INFOS', `
    SELECT
      contract."Balance",
      contract."Id",
      contract."TransactionsCount",
      creator."Address",
      creatorDomain."Name",
      creationBlock."Timestamp"
    FROM
      "Accounts" as contract
    INNER JOIN
      "Accounts" as creator ON creator."Id" = contract."CreatorId"
    INNER JOIN
      "Blocks" as creationBlock ON creationBlock."Level" = contract."FirstLevel"
    LEFT JOIN
      "Domains" as creatorDomain ON creatorDomain."Address" = creator."Address"
    WHERE
      contract."Address" = $1
    `, [address]);
    res.status(200).json({
      infos: {
        balance: contract[0].Balance,
        operationCount: contract[0].TransactionsCount,
        id: contract[0].Id,
        creationDate: contract[0].Timestamp,
        creatorAddress: contract[0].Address,
        creatorDomain: contract[0].Name
      } as Contract
    })
  } catch (err) {
    res.status(500).json({ error: 'Erreur du serveur' });
  }
}