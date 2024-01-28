import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/endpoints/providers/db'
import { solveAccountType, solveAddressName, solveAddressImage } from '@/pages/api/_solve'
import { Account } from '@/pages/api/_apiTypes'
import { DbAccount } from '@/pages/api/account-history-shorts'

export type Infos = {
  account: Account,
  balance: string,
  operationCount: number,
  userDbAccount: DbAccount,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address

  try {
    const user = await query('ACCOUNT INFOS', `
      SELECT
        a."Id",
        a."Balance",
        a."TransactionsCount",
        a."Type",
        a."Kind",
        jsonb_agg(jsonb_build_object(
          'name', d."Name",
          'lastLevel', d."LastLevel",
          'data', d."Data",
          'id', d."Id"
        )) as "Domains"
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
          name: solveAddressName(user[0].Domains, null, null),
          image: solveAddressImage(user[0].Domains, null, null),
        },
        balance: user[0].Balance,
        operationCount: user[0].TransactionsCount,
        userDbAccount: {
          Address: address,
          Id: user[0].Id,
          Kind: null,
        }
      } as Infos
    })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}
