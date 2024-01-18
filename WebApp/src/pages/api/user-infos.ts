import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/endpoints/providers/db'
import { solveAccountType, solveAddressName, solveAddressImage } from '@/pages/api/_solve'
import { Account } from '@/pages/api/_apiTypes'

export type Infos = {
  account: Account,
  balance: string,
  operationCount: number,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address

  try {
    const user = await query('ACCOUNT INFOS', `
      SELECT
        a."Balance",
        a."TransactionsCount",
        a."Type",
        a."Kind",
        array_agg(d."Name") as "Domains",
        array_agg(d."Data") as "DomainData"
      FROM "Accounts" as a
      LEFT JOIN "Domains" as d ON d."Address" = $1
      WHERE a."Address" = $1
      GROUP BY a."Id"
    `, [address]);
    res.status(200).json({
      infos: {
        account: {
          accountType: solveAccountType(user[0].Type, user[0].Kind),
          address,
          name: solveAddressName(user[0].Domains, user[0].DomainData, null, null),
          image: solveAddressImage(user[0].DomainData, null, null),
        },
        balance: user[0].Balance,
        operationCount: user[0].TransactionsCount,
      } as Infos
    })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}
