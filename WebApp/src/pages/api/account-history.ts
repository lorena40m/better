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
  { type: 'Origination', sender: 'SenderId', target: 'ContractId', initiator: true, amount: 'Balance', pageSize: 50, otherProperties: [
    "Status"
  ] },
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
    "Entrypoint", "Status"
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
  },
}

async function identifyLastBatches(
  accountId: number,
  limit = 10,
  previousOldestId: number | null,
) {
  let operations: Array<DbOperation> = []
  let tablesThatDidntReachEnd = OPERATION_TABLES.map(table => table.type)
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
      (${[
        table.sender && `"${table.sender}" = $1`,
        table.target && `"${table.target}" = $1`,
      ].filter(x => x).join(` or `)})
      ${previousOldestId ? ` and "Id" < $2` : ``}
    ORDER BY "Id" DESC
    LIMIT ${table.pageSize}
    OFFSET ${offset * table.pageSize}
  `

  while (tablesThatDidntReachEnd.length) {
    const operationsQuery = OPERATION_TABLES
      .filter(table => tablesThatDidntReachEnd.includes(table.type))
      .map(table => '(' + makeOperationQuery(table, offset) + ')')
      .join(' UNION ')

    const params = [accountId]
    if (previousOldestId) params.push(previousOldestId)
    const newOperations: Array<DbOperation> = await query('OPERATIONS', operationsQuery, params)

    operations = operations.concat(newOperations).sort((o1, o2) => o2.Id - o1.Id)
    const hashes = eliminateDuplicates(operations.map(o => o.OpHash))
    const newOperationsByType = groupBy(newOperations, o => o.OperationType)

    if (process.env.NODE_ENV === 'development')
      console.info(Array.from(newOperationsByType).map(([type, ops]) => ([type, ops.length])))

    tablesThatDidntReachEnd = tablesThatDidntReachEnd.filter(type => {
      const operations = newOperationsByType.get(type)
      const pageSize = OPERATION_TABLES.find(table => table.type === type).pageSize
      return operations && operations.length === pageSize &&
        hashes.indexOf(operations[operations.length - 1].OpHash) < limit
    })
    offset += 1
  }

  const batches = Array.from(groupBy(operations, o => o.OpHash))
    .slice(0, limit)
    .map(([OpHash, operations]) => ({
      OpHash,
      oldestId: +operations[operations.length - 1].Id,
      operationsAndTransfers: <Array<DbOperation | DbTransfer>> operations
    }))

  return { operations, batches }
}

type DbTransfer = {
  Id: number,
  Amount: number,
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

async function queryTransfers(
  accountId: number,
  oldestId: number | false, // pass false when we don't have enough hashes
  previousOldestId: number | null,
  batches: Array<{ OpHash: string, oldestId: number }>,
  limit: number
) {
  let transfers: Array<DbTransfer> = []
  let didntReachEnd = true
  let offset = 0
  batches = batches.slice() // make sure not to modify the original array

  const PAGE_SIZE = 500
  const makeTransferQuery = (offset: number) => `
    SELECT
      t."Id",
      t."Amount",
      t."FromId" as "SenderId",
      t."ToId" as "TargetId",
      tok."Id" as "AssetId",
      tok."Metadata",
      tok."ContractId",
      tok."TokenId",
      contract."Address" as "ContractAddress",
      'Transfer' as "OperationType",
      false as "IsRoot",
      COALESCE("TransactionOps"."OpHash", "OriginationOps"."OpHash") AS "OpHash"
    FROM "TokenTransfers" as t
    INNER JOIN "Tokens" as tok ON tok."Id" = t."TokenId"
    LEFT JOIN "TransactionOps" ON "TransactionOps"."Id" = t."TransactionId"
    LEFT JOIN "OriginationOps" ON "OriginationOps"."Id" = t."OriginationId"
    LEFT JOIN "Accounts" as contract ON contract."Id" = tok."ContractId"
    WHERE
      (t."FromId" = $1 OR t."ToId" = $1)
      ${oldestId ? ` AND $2 <= t."Id"` : ``}
      ${previousOldestId ? ` AND t."Id" < $` + (oldestId ? `3` : `2`) : ``}
    ORDER BY t."Id" DESC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset * PAGE_SIZE}
  `

  while (didntReachEnd) {
    const transfersQuery = makeTransferQuery(offset)

    const params = [accountId]
    if (oldestId) params.push(oldestId)
    if (previousOldestId) params.push(previousOldestId)
    let newTransfers: Array<DbTransfer> = await query('TRANSFERS', transfersQuery, params)

    // NOTE: Migration can also be a root operation for a transfer
    // Migrations are not implemented in the explorer because they don't have an OpHash
    // Therefore exclude Migration related transfers
    const count = newTransfers.length
    newTransfers = newTransfers.filter(t => t.OpHash)
    if (newTransfers.length !== count)
      console.warn('EXCLUDED transfer with no OpHash')

    transfers = transfers.concat(newTransfers)
    // Update batches
    transfers.forEach(transfer => {
      const batch = batches.find(batch => batch.OpHash === transfer.OpHash)
      if (!batch) {
        batches.push({
          OpHash: transfer.OpHash,
          oldestId: transfer.Id,
        })
      }
      // don't bother computing the oldestId, any id if enough to sort
    })
    batches.sort((b1, b2) => b2.oldestId - b1.oldestId) // DESC
    const hashes = batches.map(b => b.OpHash)

    if (process.env.NODE_ENV === 'development')
      console.info(['Transfer', newTransfers.length])

    didntReachEnd = newTransfers.length === PAGE_SIZE &&
      hashes.indexOf(newTransfers[newTransfers.length - 1].OpHash) < limit
    offset += 1
  }

  return transfers
}

async function queryRoots(addressId: number, hashes: string[]) {
  const rootsQuery = `
    (
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
          'Status', "Status"
        ) as "otherProperties"
      FROM "TransactionOps"
      WHERE "OpHash" in (${"'" + hashes.join("','") + "'"}) and "InitiatorId" is null
      ORDER BY "Id" DESC
    )
    UNION
    (
      SELECT
        'Origination' AS "OperationType",
        "Id",
        "OpHash",
        "Timestamp",
        "SenderId",
        "ContractId" as "TargetId",
        "Balance" as "Amount",
        jsonb_build_object(
          'Status', "Status"
        ) as "otherProperties"
      FROM "OriginationOps"
      WHERE "OpHash" in (${"'" + hashes.join("','") + "'"}) and "InitiatorId" is null
      ORDER BY "Id" DESC
    )
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
  const addressesQuery = `
    SELECT "Id", "Address"
    FROM "Accounts"
    WHERE "Id" in (${"" + ids.join(",") + ""})
  `

  const addresses: Array<DbAddress> = await query('ADDRESSES', addressesQuery, [])

  return addresses
}

async function backend(address: string, limit: number, previousPagePayload) {
  let addressId: number = +previousPagePayload?.addressId
  const previousOldestId: number | null = +previousPagePayload?.oldestId

  if (!addressId) {
    const addressQuery = `SELECT "Id" FROM "Accounts" WHERE "Address" = $1`
    addressId = (await query('ADDRESS', addressQuery, [address]))[0].Id
  }

  // 1. On récupère les X derniers hashes

  let { operations, batches } = await identifyLastBatches(addressId, limit, previousOldestId)
  let oldestId = batches[batches.length - 1].oldestId

  // 2. On récupère les tokens transfers, jusqu'à avoir X hashes
  // Not Implemented Yet: ticket transfers

  // Idea for better performance: identifyLastBatches and queryTransfers could be parallelized
  // as they are the 2 bottlenecks (would load a bit more transfers as it wouldn't have oldestId and batches)
  // or both could be merged in the same function

  const transfers = await queryTransfers(addressId, batches.length === limit && oldestId, previousOldestId, batches, limit)

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
  batches = batches
    .sort((b1, b2) => b2.oldestId - b1.oldestId) // DESC
    .slice(0, limit)

  oldestId = batches[batches.length - 1].oldestId
  const hashes = batches.map(b => b.OpHash)

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

      if (!rootsOf[op.Id])
        console.warn('THIS OPERATION HAS NO ROOT?!? not displayed', op.OperationType, op.Id)
    })
  })

  const uniqueRoots = eliminateDuplicates(Object.values(rootsOf), 'Id')
    .filter(r => r)
    .sort((a, b) => b.Id - a.Id) // DESC

  // keeps ordering
  const rootsByHash = groupBy(uniqueRoots, r => r.OpHash)
  const operationsByRoot = groupBy(operations.filter(o => hashes.includes(o.OpHash)), o => rootsOf[o.Id].Id)
  const transfersByRoot = groupBy(transfers.filter(o => hashes.includes(o.OpHash)), t => rootsOf[t.Id].Id)

  // 4. Identify and query adresses of every counterparty

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

  // 5. On fabrique la réponse

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

  const nextPageToken = encodeURIComponent(btoa(JSON.stringify({ addressId, oldestId })).replace(/=+$/, ''))

  return { history, nextPageToken }
}

const validate = (address, limit, nextPageToken): string | undefined => {
  const tezosAddressRegex = /^(tz1|tz2|tz3|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/

  if (!(address && typeof address === 'string' && tezosAddressRegex.test(address))) {
    return 'Invalid tezos address in req.body.address'
  }

  if (!(limit && Number.isInteger(limit) && 0 < limit && limit < 100)){
    return 'Invalid limit in req.body.limit'
  }

  if (nextPageToken && !(typeof nextPageToken === 'string')){
    return 'Invalid nextPageToken in req.body.nextPageToken'
  }
}

const validatePagePayload = (pagePayload): string | undefined => {
  if (!(
    'addressId' in pagePayload &&
    typeof pagePayload.addressId === 'number' &&
    Number.isInteger(pagePayload.addressId) &&
    0 < pagePayload.addressId
  )) {
    return 'Invalid addressId in pagePayload'
  }

  if (!(
    'oldestId' in pagePayload &&
    typeof pagePayload.oldestId === 'number' &&
    Number.isInteger(pagePayload.oldestId) &&
    0 < pagePayload.oldestId
  )) {
    return 'Invalid oldestId in pagePayload'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address
  const limit = +req.query.limit || 0
  const nextPageToken = req.query.nextPageToken
  let pagePayload

  const error = validate(address, limit, nextPageToken)
  if (error) return res.status(400).json({ error })

  if (nextPageToken) {
    try {
      pagePayload = JSON.parse(atob(decodeURIComponent(nextPageToken as string)))
    } catch (error) {
      return res.status(400).json({ error: 'Impossible to decode req.body.nextPageToken' })
    }

    const error = validatePagePayload(pagePayload)
    if (error) return res.status(400).json({ error })
  }

  try {
    res.status(200).json(await backend(address as string, limit, pagePayload))
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}

export type AccountHistoryOutput = Awaited<ReturnType<typeof backend>>
