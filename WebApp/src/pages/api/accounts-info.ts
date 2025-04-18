import type { Account } from '@/backend/apiTypes'
import { query } from '@/backend/providers/db'
import * as tzkt from '@/backend/providers/tzkt'
import { solveAccountType, solveAddressImage, solveAddressName } from '@/backend/solve'
import type { NextApiRequest, NextApiResponse } from 'next'

const validate = addresses => {
  const REQUEST_LIMIT = 40
  const tezosAddressRegex = /^(tz1|tz2|tz3|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/

  if (!Array.isArray(addresses)) {
    return 'req.body.addresses must be an array'
  }

  if (addresses.length > REQUEST_LIMIT) return `Exceeded the limit of ${REQUEST_LIMIT} addresses.`

  const isValid = addresses.every(address => {
    return address && typeof address === 'string' && tezosAddressRegex.test(address)
  })

  if (!isValid) {
    return 'Invalid structure in req.body.addresses'
  }
}

async function backend(addresses: string[]) {
  const tzktAliases$ = Promise.all(addresses.map(tzkt.getAlias))

  const accounts$ = query(
    'ACCOUNT INFOS',
    addresses
      .map(
        (a, i) => `(
    SELECT
      a."Id",
      a."Address",
      a."Balance",
      a."TransactionsCount",
      a."Type",
      a."Kind",
      a."Metadata",
      t1."Metadata" as "TokenMetadata",
      jsonb_agg(jsonb_build_object(
        'name', d."Name",
        'lastLevel', d."LastLevel",
        'data', d."Data",
        'id', d."Id"
      )) as "Domains"
    FROM "Accounts" as a
    LEFT JOIN "Domains" as d ON d."Address" ILIKE $${i + 1}
    LEFT JOIN "Tokens" as t1 ON a."Kind" = '2' and t1."ContractId" = a."Id" and t1."TokenId" = '0'
    WHERE a."Address" ILIKE $${i + 1}
    GROUP BY
      a."Id",
      a."Address",
      a."Balance",
      a."TransactionsCount",
      a."Type",
      a."Kind",
      a."Metadata",
      t1."Metadata"
  )`,
      )
      .join(' UNION '),
    addresses,
  )

  const [accounts, tzktAliases] = await Promise.all([accounts$, tzktAliases$])

  
  return addresses.map((address, i) => {
    const account = accounts.find(a => a.Address.toLowerCase() === address.toLowerCase())
    console.log("hellohello");
    console.log(account);
    return {
      account: {
        address: account.Address,
        accountType: solveAccountType(account.Type, account.Kind),
        name: tzktAliases[i] || solveAddressName(account.Domains, account.Metadata, account.TokenMetadata),
        image: solveAddressImage(account.Domains, account.Metadata, account.TokenMetadata),
      } as Account,
      balance: account.Balance as string,
      operationCount: account.TransactionsCount as number,
    }
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const addresses: string[] = req.body.addresses

  const error = validate(addresses)
  if (error) return res.status(400).json({ error })

  try {
    res.status(200).json(await backend(addresses))
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

export type Info = Awaited<ReturnType<typeof backend>>[number]
