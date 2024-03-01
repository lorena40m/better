import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/backend/providers/db'
import { solveAddressName, solveAddressImage } from '@/backend/solve'
import * as tzkt from '@/backend/providers/tzkt'

export type DbAccount = { Address: string, Id: number, Kind: number }
// input
export type DbAccounts = Array<DbAccount>

export type Short = {
  name: string,
  image: string,
}
// output
export type Shorts = Record<string, Short>

const REQUEST_LIMIT = 40

const tezosAddressRegex = /^(tz1|tz2|tz3|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/

const validateAccounts = (accounts) => {
  if (!Array.isArray(accounts)) {
    return 'req.body.accounts must be an array'
  }

  if (accounts.length > REQUEST_LIMIT)
    return `Exceeded the limit of ${REQUEST_LIMIT} accounts.`

  const isValid = accounts.every(account => {
    return (
      account &&
      typeof account.Address === 'string' && tezosAddressRegex.test(account.Address) &&
      typeof account.Id === 'number' && Number.isInteger(account.Id) &&
      (account.Kind === null || typeof account.Kind === 'number' && Number.isInteger(account.Kind))
    )
  })

  if (!isValid) {
    return 'Invalid structure in req.body.accounts'
  }
}

/*
 * Get aliases from the TzKT API for a set of addresses.
 * Note: alias will be null if there is none for the address
 * and undefined if there is a error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accounts: DbAccounts = req.body.accounts

  const error = validateAccounts(accounts)
  if (error) return res.status(400).json({ error })

  try {
    const domainsQuery = accounts.map((a, i) => `(
      SELECT
        d1."Address",
        jsonb_agg(jsonb_build_object(
          'name', d1."Name",
          'lastLevel', d1."LastLevel",
          'data', d1."Data",
          'id', d1."Id"
        )) as "Domains",
        t1."Metadata" as "TokenMetadata"
      FROM "Domains" as d1
      FULL JOIN "Tokens" as t1 ON $${3*i+3} and t1."ContractId" = $${3*i+1} and t1."TokenId" = '0'
      WHERE d1."Address" = $${3*i+2}
      GROUP BY d1."Address", t1."Metadata"
    )`).join(' UNION ')
    const data: Array<{
      Address: string, Domains: any[], TokenMetadata: any
    }> = await query('DOMAINS', domainsQuery, accounts.flatMap(a => [a.Id, a.Address, a.Kind === 2]))

    const shorts: Array<[string, Short]> = accounts.map(account => {
      const accountData = data.find(d => d.Address === account.Address)
      return [account.Address, {
        name: solveAddressName(accountData?.Domains, null, accountData?.TokenMetadata),
        image: solveAddressImage(accountData?.Domains, null, accountData?.TokenMetadata),
      }]
    })

    await Promise.all(
      shorts.filter(s => !s[1].name).map(([address, short]) => tzkt.getAlias(address).then(alias => {
        short.name = alias
      }))
    )

    res.status(200).json({
      shorts: Object.fromEntries(shorts) as Shorts
    })
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}
