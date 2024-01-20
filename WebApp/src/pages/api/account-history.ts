import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { solveAddressName, solveAddressImage, solveAccountType } from '@/pages/api/_solve'
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

/*
  Technical Notes:

  Fetches all operation BATCHES
  where the user is involved in either a root operation, internal operation or token transfer
  and attaches only token transfers pertaining to the user.
*/

import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes'
import { Account, Asset } from '@/pages/api/_apiTypes'
export type History = Array<OperationBatch>
export type OperationBatch = Array<Operation> // ordered ASC
export type Operation = {
  id: string,
  nonce: number,
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address;
  const limit = +req.query.limit;

  try {
    const addressQuery = `SELECT "Id" FROM "Accounts" WHERE "Address" = $1`
    const addressId = (await query('ADDRESS', addressQuery, [address]))[0].Id

    /// 1. On récupère les dernières opérations où User est impliqué
    /// groupés par batch limités aux X derniers batch

    // Missing: in the edge case where an account has less than 10 transactions
    // this script can missing additional transfers that are older

    // TODO: Discover why it takes time with "TargetId"
    const operationsQuery = `
      (
        SELECT "OpHash", o."Id", o."InitiatorId", o."Amount", "Nonce"
        FROM "TransactionOps" as o
        WHERE o."SenderId" = $1 or o."TargetId" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
      UNION
      (
        SELECT "OpHash", o."Id", o."InitiatorId", o."Balance" as "Amount", "Nonce"
        FROM "OriginationOps" as o
        WHERE o."SenderId" = $1 or o."ContractId" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
    `;

    const batchesQuery = `
      SELECT "OpHash", jsonb_agg(o.*) as operations
      FROM (${operationsQuery}) as o
      GROUP BY "OpHash"
      LIMIT $2
    `;

    const batchRows = await query('BATCHES', batchesQuery, [addressId, limit])
    // sort operations in a batch ASC
    const operationRows = batchRows.flatMap(batch => batch.operations.sort((o1, o2) => o1.Id - o2.Id))

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
        array_agg(d1."Data") as "SenderDomainData",
        array_agg(t1."Metadata") as "SenderTokenMetadata",
        array_agg(d2."Name") as "TargetDomains",
        array_agg(d2."Data") as "TargetDomainData",
        array_agg(t2."Metadata") as "TargetTokenMetadata"
      FROM (
        SELECT
          'TransactionOps' AS "OperationType",
          root."Id",
          root."OpHash",
          root."Nonce",
          root."Entrypoint",
          root."Status",
          root."Timestamp",
          root."TokenTransfers",
          root."SenderId",
          root."TargetId",
          a1."Address" as "SenderAddress",
          a2."Address" as "TargetAddress",
          a1."Type" as "SenderAccountType",
          a2."Type" as "TargetAccountType",
          a1."Kind" as "SenderAccountKind",
          a2."Kind" as "TargetAccountKind",
          a1."Metadata" as "SenderAccountMetadata",
          a2."Metadata" as "TargetAccountMetadata"
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
      LEFT JOIN "Domains" as d2 ON d2."Address" = root."TargetAddress"
      LEFT JOIN "Tokens" as t1 ON t1."ContractId" = root."SenderId" and t1."TokenId" = '0'
      LEFT JOIN "Tokens" as t2 ON t2."ContractId" = root."TargetId" and t2."TokenId" = '0'
      GROUP BY root."Id"
    `;
    const rootRows = (await Promise.all(
      idsForSearchingRoot.map((id, i) => query('ROOTS.' + i, rootQuery, [id]))
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
        || root.TargetAccountKind === 2 && root.Entrypoint === 'transfer') // fa transfer
        ? (root.TokenTransfers > 1 ? 'transferGroup' : 'transfer') :
        'call'
        // TODO: add staking operations

      return {
        id: root.OpHash,
        nonce: root.Nonce,
        operationType,
        stakingType: '',
        status: root.Status === 1 ? 'success' : 'failure',
        date: root.Timestamp,
        functionName: root.Entrypoint,
        // Note: if operationType === 'transferGroup', don't specify, counterparty = false
        counterparty: operationType === 'transferGroup' ? null : (
          party => ({
            accountType: solveAccountType(root[party + 'AccountType'], root[party + 'AccountKind']),
            address: root[party + 'Address'],
            name: solveAddressName(root[party + 'Domains'], root[party + 'DomainData'], root[party + 'AccountMetadata'], root[party + 'TokenMetadata']),
            image: solveAddressImage(root[party + 'DomainData'], root[party + 'AccountMetadata'], root[party + 'TokenMetadata']),
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
