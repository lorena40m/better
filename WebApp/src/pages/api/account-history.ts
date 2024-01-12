import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { solveAddressName, solveAddressImage } from '@/utils/solve';
import { ipfsToHttps } from '@/endpoints/providers/utils'

// keeps ordering
function eliminateDuplicates(arr: any[], property: string): any[] {
  const seenIds = new Set();
  return arr.filter(obj => {
    if (!seenIds.has(obj[property])) {
      seenIds.add(obj[property]);
      return true;
    }
    return false;
  });
}

// keeps ordering
function groupBy(arr, keyFn): Map<any, any> {
  return arr.reduce((acc, obj) => {
    const keyValue = keyFn(obj);
    if (!acc.has(keyValue)) {
      acc.set(keyValue, []);
    }
    acc.get(keyValue).push(obj);
    return acc;
  }, new Map());
}

function sum(numbers: number[] | BigInt[]) {
  return (numbers as number[]).reduce((total, num) => (total as number) + num, typeof numbers[0] === 'number' ? 0 : BigInt(0));
}

const accountTypes = {
  0: 'user',
  1: 'baker',
  2: 'kt',
  3: 'ghostContract',
} // type
const contractTypes = {
  0: 'delegator',
  1: 'contract',
  2: 'asset',
} // kind

/*
  Technical Notes:

  Fetches all operation BATCHES
  where the user is involved in either a root operation, internal operation or token transfer
  and attaches only token transfers pertaining to the user.
*/

import { TokenDecimals, UrlString, DateString } from '@/endpoints/API'
export type History = Array<OperationBatch>
export type OperationBatch = Array<Operation>
export type Operation = {
  id: string,
  operationType: 'transferGroup' | 'transfer' | 'call' | 'contractCreation' | 'stakingOperation',
  stakingType: '',
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  functionName: string,
  counterparty: Account | null, // counterparty is null when operationType is 'transferGroup'
  transferedAssets: Array<{
    quantity: TokenDecimals, // -/+ signed balance changes for the user
    asset: Asset,
  }>,
}
export type Account = {
  accountType: 'user' | 'baker' | 'ghostContract' | 'delegator' | 'contract' | 'asset',
  address: string,
  name: string,
  image: UrlString | null,
}
export type Asset = {
  assetType: 'nft',
  id: string,
  name: string,
  image: UrlString,
} | {
  assetType: 'coin',
  id: string | 'tezos',
  name: string,
  ticker: string,
  decimals: number,
  image: UrlString, // image is null when id = 'tezos'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  const limit = +req.query.limit;

  try {
    /// 1. On récupère les dernières opérations où User est impliqué
    /// groupés par batch limités aux X derniers batch

    // Missing: in the edge case where an account has less than 10 transactions
    // this script can missing additional transfers that are older

    // TODO: Discover why it takes time with "TargetId"
    const operationsQuery = `
      (
        SELECT a."Id" as "AddressId", "OpHash", o."Id", o."InitiatorId", o."Amount"
        FROM "Accounts" as a
        INNER JOIN "TransactionOps" as o ON o."SenderId" = a."Id"
        WHERE a."Address" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
      UNION
      (
        SELECT a."Id" as "AddressId", "OpHash", o."Id", o."InitiatorId", o."Balance" as "Amount"
        FROM "Accounts" as a
        INNER JOIN "OriginationOps" as o ON o."SenderId" = a."Id"
        WHERE a."Address" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
    `;

    const batchesQuery = `
      SELECT o."OpHash",
        min(o."AddressId") as "AddressId",
        array_agg(o."Id") as "Ids",
        array_agg(o."InitiatorId") as "InitiatorIds",
        array_agg(o."Amount") as "Amounts"
      FROM (${operationsQuery}) as o
      GROUP BY o."OpHash"
      ORDER BY min(o."Id") DESC
      LIMIT $2
    `;

    const batchRows = await query('BATCHES', batchesQuery, [address, limit])
    const operationRows = batchRows.flatMap(b => b.Ids.map((id, i) => ({
      Id: id, InitiatorIds: b.InitiatorIds[i], Amount: b.Amounts[i]
    })))
    const addressId = batchRows[0].AddressId

    /// 2. On récupère les tokens transfers où User est impliqué
    /// qui sont plus récents que le batch le plus vieux

    const oldestBatchHash = batchRows[batchRows.length - 1].OpHash
    const oldestIdQuery = `
      SELECT o."Id"
      FROM (
        (SELECT "Id", "OpHash" FROM "TransactionOps")
        UNION
        (SELECT "Id", "OpHash" FROM "OriginationOps")
      ) as o
      WHERE o."OpHash" = $1
      ORDER BY o."Id" ASC
      LIMIT 1
    `;
    const oldestId = (await query('OLDEST_ID', oldestIdQuery, [oldestBatchHash]))[0].Id

    const transfersQuery = `
      SELECT
        t."Id", t."Amount", t."TransactionId" as "OpId",
        tok."Id" as "AssetId", tok."Metadata", tok."ContractId", tok."TokenId"
      FROM "TokenTransfers" as t
      INNER JOIN "Tokens" as tok ON tok."Id" = t."TokenId"
      WHERE (t."FromId" = $1 OR t."ToId" = $1) AND t."Id" >= $2
      ORDER BY t."Id" DESC
    `;
    /*
      SELECT ,
        COALESCE("TransactionOps"."Id", "OriginationOps"."Id") AS "OpId",
        COALESCE("TransactionOps"."OpHash", "OriginationOps"."OpHash") AS "OpHash"
      LEFT JOIN "TransactionOps" ON "TransactionOps"."Id" = t."TransactionId"
      LEFT JOIN "OriginationOps" ON "OriginationOps"."Id" = t."OriginationId"
      // TODO: add MigrationId
    */
    const transferRows = await query('TRANSFERS', transfersQuery, [addressId, oldestId])

    /// 3. On identifie les root operations pour chaque opération et transfert

    const idsForSearchingRoot = operationRows.map(o => o.Id).concat(transferRows.map(o => o.OpId))

    // l'op racine est la plus grande op avec le meme hash
    // dont l'id reste plus petit que l'op interne
    const rootQuery = `
      SELECT
        jsonb_agg(root.*) as root,
        array_agg(d1."Name") as "SenderDomains",
        array_agg(d1."Data") as "SenderDomainData"
      FROM (
        SELECT
          'TransactionOps' AS "OperationType",
          root."Id",
          root."OpHash",
          root."Entrypoint",
          root."Status",
          root."Timestamp",
          root."TokenTransfers",
          a1."Address" as "SenderAddress",
          a2."Address" as "TargetAddress",
          a1."Type" as "SenderAccountType",
          a2."Type" as "TargetAccountType",
          a1."Kind" as "SenderAccountKind",
          a2."Kind" as "TargetAccountKind"
        FROM "TransactionOps" as internal
        JOIN "TransactionOps" as root ON
          root."InitiatorId" is null
          AND root."OpHash" = internal."OpHash"
          AND root."Id" <= $1
        LEFT JOIN "Accounts" as a1 ON a1."Id" = root."SenderId"
        LEFT JOIN "Accounts" as a2 ON a2."Id" = root."TargetId"
        WHERE internal."Id" = $1
        ORDER BY root."Id" DESC
        LIMIT 1
      ) as root
      LEFT JOIN "Domains" as d1 ON d1."Address" = root."SenderAddress"
      GROUP BY root."Id"
    `;
    const rootRows = (await Promise.all(
      idsForSearchingRoot.map((id,i) => query('ROOTS.' + i, rootQuery, [id]))
    )).flat()
      // unduplicate root
      .map(({ root, SenderDomains, SenderDomainData }) => ({ ...root[0], SenderDomains, SenderDomainData }))

    const rootsOf = {}
    idsForSearchingRoot.forEach((id, i) => rootsOf[id] = rootRows[i])

    /// 4. On trie, on groupe par root, par batch et on limite

    const uniqueRoots = eliminateDuplicates(Object.values(rootsOf), "Id")
      .sort((a, b) => b - a) // DESC
    const rootsById = {}
    uniqueRoots.forEach(r => rootsById[r.Id] = r)

    // keeps ordering
    const batches = Array.from(groupBy(uniqueRoots, r => r.OpHash)).slice(0, limit)
    const operationsByRoot = Object.fromEntries(groupBy(operationRows, o => rootsOf[o.Id].Id))
    const transfersByRoot = Object.fromEntries(groupBy(transferRows, t => rootsOf[t.OpId].Id))

    const history: History = batches.map(([hash, batch]) => batch.map(root => {
      const operationType = root.OperationType === 'OriginationOps' ? 'contractCreation' :
        (root.TargetAddress.startsWith('tz') // native xtz transfer
        || contractTypes[root.TargetAccountKind] === 'asset' && root.Entrypoint === 'transfer') // fa transfer
        ? (root.TokenTransfers > 1 ? 'transferGroup' : 'transfer') :
        'call'
        // TODO: add staking operations

      return {
        id: root.OpHash,
        operationType,
        stakingType: '',
        status: root.Status === 1 ? 'success' : 'failure',
        date: root.Timestamp,
        functionName: root.Entrypoint,
        // Note: if operationType === 'transferGroup', don't specify, counterparty = false
        counterparty: operationType === 'transferGroup' ? null : (
          party => ({
            accountType: root[party + 'AccountType'] == 2 ? contractTypes[root[party + 'AccountKind']] : accountTypes[root[party + 'AccountType']],
            address: root[party + 'Address'],
            name: solveAddressName(root[party + 'Domains'], root[party + 'DomainData']),
            image: solveAddressImage(root[party + 'DomainData']),
          })
        )(root.SenderAddress !== address ? 'Sender' : 'Target'),
        transferedAssets:
          (xtzAmount => xtzAmount ? [{
            quantity: xtzAmount.toString(),
            asset: {
              assetType: 'coin',
              id: 'tezos',
              name: 'Tezos',
              ticker: 'XTZ',
              decimals: 6,
              image: null, // will be stored by frontend
            } as Asset,
          }] : [])(sum(operationsByRoot[root.Id].map(o => (/*isSender()*/true ? -1 : 1) * +o.Amount)))
          .concat(
            Array.from(groupBy(transfersByRoot[root.Id] ?? [], t => t.AssetId))
            .map(([assetId, transfers]) => ({
              quantity: sum(transfers.map(t => BigInt(t.SenderAddress === address ? -1 : 1) * BigInt(t.Amount))).toString(),
              asset: transfers[0].Metadata.decimals == 0 ? {
                assetType: 'nft',
                id: transfers[0].ContractId + '_' + transfers[0].TokenId,
                name: transfers[0].Metadata.name,
                image: ipfsToHttps(transfers[0].Metadata.thumbnailUri),
              } : {
                assetType: 'coin',
                id: transfers[0].ContractId + '_' + transfers[0].TokenId,
                name: transfers[0].Metadata.name,
                ticker: transfers[0].Metadata.symbol,
                decimals: transfers[0].Metadata.decimals,
                image: ipfsToHttps(transfers[0].Metadata?.thumbnailUri ?? transfers[0].Metadata?.icon ?? null),
              },
            }))
          )
      } as Operation
    }))

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
