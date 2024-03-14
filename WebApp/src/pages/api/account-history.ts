import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/backend/providers/db'
import { solveAccountType } from '@/backend/solve'
import { eliminateDuplicates, groupBy, sum } from '@/utils/arrays'

/*
  Technical Notes:

  Fetches all operation BATCHES
  where the user is involved in either a root operation, internal operation or token transfer
  and attaches only token changes pertaining to the user.

  TODO: Implement TicketTransfers interpretation
*/

// TODO: Don't use the naïve way of loading asset images
export type Nft = {
  assetType: 'nft',
  id: `${string}_${number}`,
  name: string,
  image: UrlString,
}
export type Coin = {
  assetType: 'coin',
  id: string | 'tezos',
  name: string,
  image: UrlString, // image is null when id = 'tezos'
  ticker: string,
  decimals: number,
}
export type Asset = Nft | Coin

import type { TokenDecimals, UrlString, DateString } from '@/backend/apiTypes'
import type { Account } from '@/backend/apiTypes'
// output
export type History = Array<OperationBatch>
export type OperationBatch = Array<Operation> // ordered ASC
export type Operation = {
  id: string,
  operationType: 'transfer' | 'call' | 'contractCreation' | 'tezosSpecific',
  tezosSpecificType: (typeof OPERATION_TABLES)[number]['type'],
  status: 'waiting' | 'success' | 'failure',
  date: DateString,
  functionName: string,
  counterpartyAddress: string,
  balanceChanges: Array<{
    quantity: TokenDecimals, // -/+ signed balance changes for the user
    asset: Asset,
  }>,
}

const OPERATION_TABLES = [
  { type: 'Activation', sender: null, target: 'AccountId', initiator: false, amount: 'Balance', pageSize: 50, otherProperties: [] },
  //// { type: 'Autostacking', sender: null, target: null, initiator: false, amount: 'Amount', pageSize: 50, otherProperties: [] }, // note: no OpHash
  { type: 'Ballot', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'Delegation', sender: 'SenderId', target: 'DelegateId', initiator: true, amount: 'Amount', pageSize: 50, otherProperties: [] },
  { type: 'DoubleBaking', sender: 'AccuserId', target: 'OffenderId', initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'DoubleEndorsing', sender: 'AccuserId', target: 'OffenderId', initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'DoublePreendorsing', sender: 'AccuserId', target: 'OffenderId', initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'DrainDelegate', sender: 'DelegateId', target: 'TargetId', initiator: false, amount: 'Amount', pageSize: 50, otherProperties: [] },
  // { type: 'Endorsement', sender: 'DelegateId', target: null, initiator: false, amount: null, pageSize: 1, otherProperties: [] }, // request takes too much time ; Reward, Deposit?
  //// { type: 'EndorsingReward', sender: null, target: 'BakerId', initiator: false, amount: null, pageSize: 50, otherProperties: [] }, // no OpHash, Expected + 3 Reward
  { type: 'IncreasePaidStorage', sender: 'SenderId', target: 'ContractId', initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  //// { type: 'Migration', sender: null, target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] }, // no OpHash
  { type: 'NonceRevelation', sender: 'SenderId', target: 'BakerId', initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'Origination', sender: 'SenderId', target: 'ContractId', initiator: true, amount: 'Balance', pageSize: 50, otherProperties: [] },
  { type: 'Preendorsement', sender: 'DelegateId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'Proposal', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'RegisterConstant', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'Reveal', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  //// { type: 'RevelationPenalty', sender: 'BakerId', target: null, initiator: false, amount: 'Loss', pageSize: 50, otherProperties: [] }, // no OpHash
  { type: 'SetDepositsLimit', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupAddMessages', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupCement', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupExecute', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupOriginate', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupPublish', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupRecoverBond', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'SmartRollupRefute', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'Staking', sender: 'SenderId', target: 'BakerId', initiator: false, amount: 'Amount', pageSize: 50, otherProperties: [] },
  { type: 'Transaction', sender: 'SenderId', target: 'TargetId', initiator: true, amount: 'Amount', pageSize: 1000, otherProperties: [
    "Entrypoint", "Status", "TokenTransfers"
  ] },
  { type: 'TransferTicket', sender: 'SenderId', target: 'TargetId', initiator: false, amount: null, pageSize: 50, otherProperties: [] }, // Amount = not xtz
  { type: 'TxRollupCommit', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupDispatchTickets', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupFinalizeCommitment', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupOrigination', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupRejection', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupRemoveCommitment', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupReturnBond', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'TxRollupSubmitBatch', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'UpdateConsensusKey', sender: 'SenderId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
  { type: 'VdfRevelation', sender: 'BakerId', target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] },
]

type DbOperation = {
  OpHash: string,
  OperationType: string,
  Id: number,
  Timestamp: string,
  IsRoot: boolean,
  // Only if defined
  SenderId?: number,
  TargetId?: number,
  Amount?: number,
  // Only for Transaction
  otherProperties: {
    Entrypoint?: string | null,
    Status?: number,
    TokenTransfers?: number,
  },
}

async function identifyLastBatches(accountId: number, limit = 10) {
  let operations: Array<DbOperation> = []
  let tablesThatDidntReachedEnd = OPERATION_TABLES.map(table => table.type)
  let offset = 0

  const makeOperationQuery = (table: typeof OPERATION_TABLES[number], offset: number) => `
    SELECT
      "OpHash",
      '${table.type}' as "OperationType",
      "Id",
      "Timestamp",
      ${table.sender ? `"${table.sender}"` : `null`} as "SenderId",
      ${table.target ? `"${table.target}"` : `null`} as "TargetId",
      ${table.amount ? `"${table.amount}"` : `null`} as "Amount",
      ${table.initiator ? `("InitiatorId" is null)` : `true`} as "IsRoot",
      ${`jsonb_build_object(
        ${table.otherProperties.map(p => `'${p}', "${p}"`).join(`, `)}
      )`} as "otherProperties"
    FROM "${table.type}Ops"
    WHERE
      ${[
        table.sender && `"${table.sender}" = $1`,
        table.target && `"${table.target}" = $1`,
      ].filter(x => x).join(` or `)}
    ORDER BY "Id" DESC
    LIMIT ${table.pageSize}
    OFFSET ${offset * table.pageSize}
  `

  while (tablesThatDidntReachedEnd.length) {
    if (process.env.NODE_ENV === 'development')
      console.log('offset', offset)

    const operationsQuery = OPERATION_TABLES
      .filter(table => tablesThatDidntReachedEnd.includes(table.type))
      .map(table => '(' + makeOperationQuery(table, offset) + ')')
      .join(' UNION ')

    const newOperations: Array<DbOperation> = await query('OPERATIONS', operationsQuery, [accountId])

    operations = operations.concat(newOperations).sort((o1, o2) => o2.Id - o1.Id)
    const hashes = eliminateDuplicates(operations.map(o => o.OpHash))
    const newOperationsByType = groupBy(newOperations, o => o.OperationType)

    if (process.env.NODE_ENV === 'development')
      console.info(Array.from(newOperationsByType).map(([type, ops]) => ([type, ops.length])))

    tablesThatDidntReachedEnd = tablesThatDidntReachedEnd.filter(type => {
      const operations = newOperationsByType.get(type)
      const pageSize = OPERATION_TABLES.find(table => table.type === type).pageSize
      return operations && operations.length === pageSize &&
        hashes.indexOf(operations[operations.length - 1].OpHash) < 10
    })
    offset += 1
  }

  const batches = Array.from(groupBy(operations, o => o.OpHash))
    .slice(0, limit)
    .map(([OpHash, operations]) => ({
      OpHash,
      oldestId: operations[operations.length - 1].Id,
      operationsAndTransfers: <Array<DbOperation | DbTransfer>> operations
    }))

  return { operations, batches }
}

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
  ContractAddress: string,
  OperationType: 'Transfer',
  IsRoot: false,
}

async function queryTransfers(accountId: string, oldestId: number) {
  const transfersQuery = `
    SELECT
      t."Id", t."Amount", t."TransactionId" as "OpId", t."FromId" as "SenderId", t."ToId" as "TargetId",
      tok."Id" as "AssetId", tok."Metadata", tok."ContractId", tok."TokenId",
      tr."OpHash", contract."Address" as "ContractAddress",
      'Transfer' as "OperationType", false as "IsRoot"
    FROM "TokenTransfers" as t
    INNER JOIN "Tokens" as tok ON tok."Id" = t."TokenId"
    LEFT JOIN "TransactionOps" as tr ON tr."Id" = t."TransactionId"
    LEFT JOIN "Accounts" as contract ON contract."Id" = tok."ContractId"
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

  const transfers: Array<DbTransfer> = await query('TRANSFERS', transfersQuery, [accountId, oldestId])

  return transfers
}

async function queryRoots(addressId: string, hashes: string[]) {
  const rootsQuery = `
    SELECT
      'Transaction' AS "OperationType",
      "Id",
      "OpHash",
      "Timestamp",
      "SenderId",
      "TargetId",
      "Amount",
      jsonb_build_object(
        'Entrypoint', "Entrypoint",
        'Status', "Status",
        'TokenTransfers', "TokenTransfers"
      ) as "otherProperties"
    FROM "TransactionOps"
    WHERE "OpHash" in (${"'" + hashes.join("','") + "'"}) and "InitiatorId" is null
    ORDER BY "Id" DESC
  `

  const roots: Array<DbOperation> = await query('ROOTS', rootsQuery, [])

  return roots
}

type DbAddress = {
  Id: number,
  Address: string,
}

async function queryAddresses(ids: number[]) {
  console.log(ids)
  const addressesQuery = `
    SELECT "Id", "Address"
    FROM "Accounts"
    WHERE "Id" in (${"" + ids.join(",") + ""})
  `

  const addresses: Array<DbAddress> = await query('ADDRESSES', addressesQuery, [])

  return addresses
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = req.query.address
  const limit = +req.query.limit

  try {
    const addressQuery = `SELECT "Id" FROM "Accounts" WHERE "Address" = $1`
    const addressId = (await query('ADDRESS', addressQuery, [address]))[0].Id

    /// 1. On récupère les X derniers hashes

    // Missing: in the edge case where an account has less than 10 transactions
    // this script can missing additional transfers that are older

    const { operations, batches } = await identifyLastBatches(addressId, limit)
    const oldestId = batches[batches.length - 1].oldestId

    /// 2. On récupère les tokens transfers, où User est impliqué, plus récents
    // TODO: Add ticket transfers

    const transfers = await queryTransfers(addressId, oldestId)

    // merge transfers into batches[].operationsAndTransfers
    transfers.forEach(transfer => {
      const batch = batches.find(b => b.OpHash === transfer.OpHash)
      if (batch) {
        batch.operationsAndTransfers.push(transfer) // note: breaks order
        batch.oldestId = Math.min(batch.oldestId, transfer.Id)
      }
      else {
        batches.push({
          OpHash: transfer.OpHash,
          oldestId: transfer.Id,
          operationsAndTransfers: [transfer]
        })
      }
    })

    // re-sort and slice
    const hashes = batches
      .sort((b1, b2) => b2.oldestId - b1.oldestId) // DESC
      .slice(0, limit)
      .map(b => b.OpHash)

    // 3. Je récupère les opérations racines

    const allRoots = await queryRoots(addressId, hashes)

    // On identifie les root operations qui nous intéressent

    const rootsOf: Record<string, DbOperation> = {}
    batches.forEach(batch => {
      batch.operationsAndTransfers.forEach(op => {
        // l'op racine est la plus grande op avec le meme hash
        // dont l'id reste plus petit que l'op interne
        rootsOf[op.Id] = op.IsRoot ? op :
          allRoots.find(root => root.OpHash === batch.OpHash && root.Id <= op.Id)
      })
    })

    const uniqueRoots = eliminateDuplicates(Object.values(rootsOf), 'Id')
      .sort((a, b) => b.Id - a.Id) // DESC

    // keeps ordering
    const rootsByHash = groupBy(uniqueRoots, r => r.OpHash)
    const operationsByRoot = groupBy(operations.filter(o => hashes.includes(o.OpHash)), o => rootsOf[o.Id].Id)
    const transfersByRoot = groupBy(transfers.filter(o => hashes.includes(o.OpHash)), t => rootsOf[t.Id].Id)

    const counterpartyIdOfRoot: Record<string, number> = {}
    uniqueRoots.forEach(root => {
      const transfers = transfersByRoot.get(root.Id) ?? []
      const transferSenders = eliminateDuplicates(transfers.map(t => t.SenderId)).filter(s => s !== addressId)
      const transferTargets = eliminateDuplicates(transfers.map(t => t.TargetId)).filter(t => t !== addressId)
      const lengthierSide = transferTargets.length > transferSenders.length ? transferTargets : transferSenders
      const isThereBurnOrMint = transfers.find(t => !t.SenderId || !t.TargetId)
      counterpartyIdOfRoot[root.Id] =
        // if there are transfers with a single counterparty, display this counterparty
        lengthierSide.length === 1 && !isThereBurnOrMint ? lengthierSide[0] :
        // otherwise, take the smart contract name
        !root.SenderId || root.SenderId === addressId && root.TargetId ? root.TargetId :
        // or the sender
        root.SenderId
    })

    const counterparties = await queryAddresses(eliminateDuplicates(Object.values(counterpartyIdOfRoot)))

    // 4. On fabrique la réponse

    const history: History = Array.from(rootsByHash).map(([hash, roots]) =>
      roots.map(root => {
        const operationType =
          root.OperationType === 'Origination' ? 'contractCreation' :
          root.OperationType === 'Transaction' ? (
            (!root.otherProperties.Entrypoint // native xtz transfer
            || /*root.TargetAccountKind === 2 &&*/ root.otherProperties.Entrypoint === 'transfer') // fa transfer
            ? (
              'transfer'
            ) :
            'call'
          ) :
          'tezosSpecific'

        const xtzAmount = sum(
          (operationsByRoot.get(root.Id) ?? [])
            .map(o => o.SenderId === addressId ? -o.Amount : +o.Amount)
        )

        return {
          id: root.OpHash,
          operationType,
          tezosSpecificType: operationType === 'tezosSpecific' ? root.OperationType : null,
          status: root.otherProperties?.Status === null ? 'success' : root.otherProperties?.Status === 1 ? 'success' : 'failure',
          date: root.Timestamp,
          functionName: root.otherProperties?.Entrypoint,
          counterpartyAddress: counterparties.find(c => c.Id === counterpartyIdOfRoot[root.Id]).Address,
          balanceChanges:
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
                asset: transfers[0].Metadata?.decimals == 0 ? {
                  assetType: 'nft',
                  id: transfers[0].ContractAddress + '_' + transfers[0].TokenId,
                  name: transfers[0].Metadata?.name,
                  image: transfers[0].Metadata?.thumbnailUri,
                } as Nft : {
                  assetType: 'coin',
                  id: transfers[0].ContractAddress + '_' + transfers[0].TokenId,
                  name: transfers[0].Metadata?.name,
                  ticker: transfers[0].Metadata?.symbol,
                  decimals: transfers[0].Metadata?.decimals,
                  image: transfers[0].Metadata?.thumbnailUri ?? transfers[0].Metadata?.icon ?? null,
                } as Coin,
              }))
            )
        } as Operation
      })
    )

    res.status(200).json({ history })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.toString() })
  }
}
