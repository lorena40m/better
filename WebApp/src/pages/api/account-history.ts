import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { solveAccountType } from '@/pages/api/_solve'
import { ipfsToHttps } from '@/endpoints/providers/utils'
import { eliminateDuplicates, groupBy, sum } from '@/utils/arrays'
import { DbAccount } from '@/pages/api/account-history-shorts'

/*
  Technical Notes:

  Fetches all operation BATCHES
  where the user is involved in either a root operation, internal operation or token transfer
  and attaches only token changes pertaining to the user.
*/

import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes'
import { Account, Asset } from '@/pages/api/_apiTypes'
// output
export type History = Array<OperationBatch>
export type OperationBatch = Array<Operation> // ordered ASC
export type Operation = {
  id: string,
  nonce: number,
  operationType: 'transfer' | 'call' | 'contractCreation' | 'stakingOperation',
  stakingType: '',
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  functionName: string,
  counterparty: Account,
  counterpartyDbAccount: DbAccount,
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

    const operationsQuery = `
      (
        SELECT "OpHash", o."Id", o."InitiatorId", o."Amount", "Nonce", "SenderId", "TargetId"
        FROM "TransactionOps" as o
        WHERE o."SenderId" = $1 or o."TargetId" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
      UNION
      (
        SELECT "OpHash", o."Id", o."InitiatorId", o."Balance" as "Amount", "Nonce", "SenderId", "ContractId" as "TargetId"
        FROM "OriginationOps" as o
        WHERE o."SenderId" = $1 or o."ContractId" = $1
        ORDER BY o."Id" DESC
        LIMIT 1000
      )
    `;

    // TODO: if limit reached, load more?

    const batchesQuery = `
      SELECT "OpHash", jsonb_agg(o.*) as operations
      FROM (${operationsQuery}) as o
      GROUP BY "OpHash"
      ORDER BY min(o."Id") DESC
      LIMIT $2
    `;

    type DbOperation = {
      Id: number,
      OpHash: string,
      // InitiatorId: number,
      // Nonce: number,
      Amount: number,
      SenderId: number,
      TargetId: number,
    }
    const batchRows: Array<{
      Id: number,
      OpHash: string,
      operations: Array<DbOperation>
    }> = await query('BATCHES', batchesQuery, [addressId, limit])
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
    const oldestId: number = (await query('OLDEST_ID', oldestIdQuery, [oldestBatchHash]))[0].Id

    const transfersQuery = `
      SELECT
        t."Id", t."Amount", t."TransactionId" as "OpId", t."FromId" as "SenderId", t."ToId" as "TargetId",
        tok."Id" as "AssetId", tok."Metadata", tok."ContractId", tok."TokenId",
        tr."OpHash"
      FROM "TokenTransfers" as t
      INNER JOIN "Tokens" as tok ON tok."Id" = t."TokenId"
      LEFT JOIN "TransactionOps" as tr ON tr."Id" = t."TransactionId"
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
    type DbTransfer = {
      Id: number,
      Amount: number,
      OpId: number,
      AssetId: number,
      Metadata: any,
      ContractId: number,
      TokenId: number,
      OpHash: string,
      SenderId: number,
      TargetId: number,
    }
    const transferRows: Array<DbTransfer> = await query('TRANSFERS', transfersQuery, [addressId, oldestId])

    // 3. Nouvelle technique :
    // je récupère toutes les opérations des 10 batches

    // merge transfers into batches[].operations
    transferRows.forEach(transfer => {
      const batch = batchRows.find(b => b.OpHash === transfer.OpHash)
      if (batch)
        batch.operations.push(transfer)
      else
        batchRows.push({ Id: null, OpHash: transfer.OpHash, operations: [transfer] })
    })
    // fill batches[].Id
    batchRows.forEach(batch => batch.Id = Math.min(...batch.operations.map(o => o.Id)))
    batchRows.sort((a, b) => a.Id - b.Id)

    const hashesToFetch = batchRows.map(b => b.OpHash)

    const rootsQuery = `
      SELECT
        'TransactionOps' AS "OperationType",
        o."Id",
        o."OpHash",
        o."Nonce",
        o."Entrypoint",
        o."Status",
        o."Timestamp",
        o."TokenTransfers",
        o."SenderId",
        o."TargetId",
        o."Amount",
        a1."Address" as "SenderAddress",
        a2."Address" as "TargetAddress",
        a1."Type" as "SenderAccountType",
        a2."Type" as "TargetAccountType",
        a1."Kind" as "SenderAccountKind",
        a2."Kind" as "TargetAccountKind",
        a1."Metadata" as "SenderAccountMetadata",
        a2."Metadata" as "TargetAccountMetadata"
      FROM "TransactionOps" as o
      LEFT JOIN "Accounts" as a1 ON o."SenderId" != ${addressId} and a1."Id" = o."SenderId"
      LEFT JOIN "Accounts" as a2 ON a2."Id" = o."TargetId"

      WHERE o."OpHash" in (${"'" + hashesToFetch.join("','") + "'"}) and o."InitiatorId" is null

      ORDER BY o."Id" DESC
    `
    type DbRoot = {
      OperationType: 'TransactionOps',
      Id: number,
      OpHash: string,
      Nonce: number,
      Entrypoint: string | null,
      Status: number,
      Timestamp: string,
      TokenTransfers: number,
      SenderId: number,
      TargetId: number,
      Amount: number,
      SenderAddress: string,
      TargetAddress: string,
      SenderAccountType: number,
      TargetAccountType: number,
      SenderAccountKind: number,
      TargetAccountKind: number,
      SenderAccountMetadata: any,
      TargetAccountMetadata: any,
    }
    const allRoots: Array<DbRoot> = await query('ROOTS', rootsQuery, [])

    /// 3. On identifie les root operations qui nous intéresse (pour chaque opération et transfert)

    const rootsOf: Record<string, DbRoot> = {}
    batchRows.forEach(batch => {
      batch.operations.forEach(subOp => {
        // l'op racine est la plus grande op avec le meme hash
        // dont l'id reste plus petit que l'op interne
        rootsOf[subOp.Id] = allRoots.find(root => root.OpHash === batch.OpHash && root.Id <= subOp.Id)
      })
    })

    const uniqueRoots = eliminateDuplicates(Object.values(rootsOf), "Id")
      .sort((a, b) => b.Id - a.Id) // DESC

    // keeps ordering
    const batches = Array.from(groupBy(uniqueRoots, r => r.OpHash)).slice(0, limit)
    const operationsByRoot = groupBy(operationRows, o => rootsOf[o.Id].Id)
    const transfersByRoot = groupBy(transferRows, t => rootsOf[t.Id].Id)

    // 4. On fabrique la réponse

    const history: History = batches.map(([hash, batch]) => batch.map(root => {
      // TODO: for a transfer with single recipient, take the recipient
      // TODO: for several recipients, take the smart contract name
      const counterparty = root.SenderId === addressId ? 'Target' : 'Sender'
      const operationType = //root.OperationType === 'OriginationOps' ? 'contractCreation' :
        (!root.Entrypoint // native xtz transfer
        || root.TargetAccountKind === 2 && root.Entrypoint === 'transfer') // fa transfer
        ? 'transfer' :
        'call'
        // TODO: add staking operations
      const xtzAmount = sum((operationsByRoot.get(root.Id) ?? []).map(o => o.SenderId === addressId ? -o.Amount : +o.Amount))

      return {
        id: root.OpHash,
        nonce: root.Nonce,
        operationType,
        stakingType: '',
        status: root.Status === 1 ? 'success' : 'failure',
        date: root.Timestamp,
        functionName: root.Entrypoint,
        counterparty: {
          accountType: solveAccountType(root[counterparty + 'AccountType'], root[counterparty + 'AccountKind']),
          address: root[counterparty + 'Address'],
          name: root[counterparty + 'AccountMetadata']?.name,
          image: ipfsToHttps(root[counterparty + 'AccountMetadata']?.imageUri),
        },
        counterpartyDbAccount: {
          Address: root[counterparty + 'Address'],
          Id: root[counterparty + 'Id'],
          Kind: root[counterparty + 'AccountKind'],
        },
        transferedAssets:
          (xtzAmount ? [{
            quantity: xtzAmount.toString(),
            asset: {
              assetType: 'coin',
              id: 'tezos',
              name: 'Tezos',
              ticker: 'XTZ',
              decimals: 6,
              image: null, // will be stored by frontend
            } as Asset,
          }] : [])
          .concat(
            Array.from(groupBy(transfersByRoot.get(root.Id) ?? [], t => t.AssetId))
            .map(([assetId, transfers]) => ({
              quantity: sum(transfers.map(t => BigInt(t.SenderId === addressId ? -1 : 1) * BigInt(t.Amount))).toString(),
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
    console.error(err)
    res.status(500).json({ error: err.toString() });
  }
}
