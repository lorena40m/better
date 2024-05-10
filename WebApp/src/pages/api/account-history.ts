import { query } from '@/backend/providers/db'
import { eliminateDuplicates, groupBy, sum } from '@/utils/arrays'
import type { NextApiRequest, NextApiResponse } from 'next'

/*
  Technical Notes:

  Fetches all operation BATCHES
  where the user is involved in either a root operation, internal operation or token transfer
  and attaches only token changes pertaining to the user.

  TODO: Implement TicketTransfers interpretation
*/

// TODO: Don't use the naïve way of loading asset images
export type Nft = {
  assetType: 'nft'
  id: `${string}_${number}`
  name: string
  image: UrlString
}
export type Coin = {
  assetType: 'coin'
  id: string | 'tezos'
  name: string
  image: UrlString // image is null when id = 'tezos'
  ticker: string
  decimals: number
}
export type Asset = Nft | Coin

import type { DateString, TokenDecimals, UrlString } from '@/backend/apiTypes'
// output
export type History = Array<OperationBatch>
export type OperationBatch = Array<Operation> // ordered ASC
export type Operation = {
  id: string
  operationType: 'transfer' | 'call' | 'contractCreation' | 'tezosSpecific'
  tezosSpecificType: (typeof TABLES)[number]['type']
  status: 'waiting' | 'success' | 'failure'
  date: DateString
  functionName: string
  counterpartyAddress: string
  balanceChanges: Array<{
    quantity: TokenDecimals // -/+ signed balance changes for the user
    asset: Asset
  }>
}

const TABLES = [
  { type: 'TokenTransfer', pageSize: 100 }, // Special processing for TokenTransfers
  {
    type: 'Activation',
    sender: null,
    target: 'AccountId',
    initiator: false,
    amount: 'Balance',
    pageSize: 50,
    otherProperties: [],
  },
  //// { type: 'Autostacking', sender: null, target: null, initiator: false, amount: 'Amount', pageSize: 50, otherProperties: [] }, // note: no OpHash
  {
    type: 'Ballot',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Delegation',
    sender: 'SenderId',
    target: 'DelegateId',
    initiator: true,
    amount: 'Amount',
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'DoubleBaking',
    sender: 'AccuserId',
    target: 'OffenderId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'DoubleEndorsing',
    sender: 'AccuserId',
    target: 'OffenderId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'DoublePreendorsing',
    sender: 'AccuserId',
    target: 'OffenderId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'DrainDelegate',
    sender: 'DelegateId',
    target: 'TargetId',
    initiator: false,
    amount: 'Amount',
    pageSize: 50,
    otherProperties: [],
  },
  // { type: 'Endorsement', sender: 'DelegateId', target: null, initiator: false, amount: null, pageSize: 1, otherProperties: [] }, // request takes too much time ; Reward, Deposit?
  //// { type: 'EndorsingReward', sender: null, target: 'BakerId', initiator: false, amount: null, pageSize: 50, otherProperties: [] }, // no OpHash, Expected + 3 Reward
  {
    type: 'IncreasePaidStorage',
    sender: 'SenderId',
    target: 'ContractId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  //// { type: 'Migration', sender: null, target: null, initiator: false, amount: null, pageSize: 50, otherProperties: [] }, // no OpHash
  {
    type: 'NonceRevelation',
    sender: 'SenderId',
    target: 'BakerId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Origination',
    sender: 'SenderId',
    target: 'ContractId',
    initiator: true,
    amount: 'Balance',
    pageSize: 50,
    otherProperties: ['Status'],
  },
  {
    type: 'Preendorsement',
    sender: 'DelegateId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Proposal',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'RegisterConstant',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Reveal',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  //// { type: 'RevelationPenalty', sender: 'BakerId', target: null, initiator: false, amount: 'Loss', pageSize: 50, otherProperties: [] }, // no OpHash
  {
    type: 'SetDepositsLimit',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupAddMessages',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupCement',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupExecute',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupOriginate',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupPublish',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupRecoverBond',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'SmartRollupRefute',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Staking',
    sender: 'SenderId',
    target: 'BakerId',
    initiator: false,
    amount: 'Amount',
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'Transaction',
    sender: 'SenderId',
    target: 'TargetId',
    initiator: true,
    amount: 'Amount',
    pageSize: 250,
    otherProperties: ['Entrypoint', 'Status'],
  },
  {
    type: 'TransferTicket',
    sender: 'SenderId',
    target: 'TargetId',
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  }, // Amount = not xtz
  {
    type: 'TxRollupCommit',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupDispatchTickets',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupFinalizeCommitment',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupOrigination',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupRejection',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupRemoveCommitment',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupReturnBond',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'TxRollupSubmitBatch',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'UpdateConsensusKey',
    sender: 'SenderId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
  {
    type: 'VdfRevelation',
    sender: 'BakerId',
    target: null,
    initiator: false,
    amount: null,
    pageSize: 50,
    otherProperties: [],
  },
]

type DbOperation = {
  Id: string
  OpHash: string
  OperationType: string
  // Only if defined
  SenderId?: number
  TargetId?: number
  Amount?: number
  IsRoot: boolean
  // specific to operations
  Timestamp: string
  otherProperties: {
    Entrypoint?: string | null
    Status?: number
  }
}

type DbTransfer = {
  Id: string
  OpHash: string
  OperationType: 'TokenTransfer'
  SenderId: number
  TargetId: number
  Amount: number
  IsRoot: false
  // specific to transfers
  AssetId: string
  Metadata: any
  TokenId: string
  ContractAddress: string
}

type PropertiesThatAreOnlyInTransfer = Omit<DbTransfer, keyof DbOperation>
type PropertiesThatAreOnlyInOperation = Omit<DbOperation, keyof DbTransfer>

async function queryBatches(accountId: number, limit = 10, previousOldestId: string | null) {
  let operationsAndTransfers: Array<DbOperation | DbTransfer> = []
  let tablesThatDidntReachEnd = TABLES.map(table => table.type)
  let offset = 0

  const makeOperationQuery = (table: (typeof TABLES)[number], limit: number, offset: number) => `
    SELECT
      "Id",
      "OpHash",
      '${table.type}' as "OperationType",
      ${table.sender ? `"${table.sender}"` : `null`} as "SenderId",
      ${table.target ? `"${table.target}"` : `null`} as "TargetId",
      ${table.amount ? `"${table.amount}"` : `null`}::TEXT as "Amount",
      ${table.initiator ? `("InitiatorId" is null)` : `true`} as "IsRoot",
      "Timestamp",
      ${`jsonb_build_object(
        ${table.otherProperties.map(p => `'${p}', "${p}"`).join(`, `)}
      )`} as "otherProperties",
      null as "AssetId",
      null as "Metadata",
      null as "TokenId",
      null as "ContractAddress"
    FROM "${table.type}Ops"
    WHERE
      (${[table.sender && `"${table.sender}" = $1`, table.target && `"${table.target}" = $1`]
        .filter(x => x)
        .join(` or `)})
      ${previousOldestId ? ` and "Id" < $2` : ``}
    ORDER BY "Id" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `
  const makeTransferQuery = (table: (typeof TABLES)[number], limit: number, offset: number) => `
    SELECT
      t."Id",
      COALESCE("TransactionOps"."OpHash", "OriginationOps"."OpHash") AS "OpHash",
      'TokenTransfer' as "OperationType",
      t."FromId" as "SenderId",
      t."ToId" as "TargetId",
      t."Amount",
      false as "IsRoot",
      null as "Timestamp",
      null as "otherProperties",
      tok."Id" as "AssetId",
      tok."Metadata",
      tok."TokenId",
      contract."Address" as "ContractAddress"
    FROM "TokenTransfers" as t
    INNER JOIN "Tokens" as tok ON tok."Id" = t."TokenId"
    LEFT JOIN "TransactionOps" ON "TransactionOps"."Id" = t."TransactionId"
    LEFT JOIN "OriginationOps" ON "OriginationOps"."Id" = t."OriginationId"
    LEFT JOIN "Accounts" as contract ON contract."Id" = tok."ContractId"
    WHERE
      (t."FromId" = $1 OR t."ToId" = $1)
      ${previousOldestId ? ` AND t."Id" < $2` : ``}
    ORDER BY t."Id" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `
  const makeQuery = (table: (typeof TABLES)[number]) => (offset: number) => {
    const evolutiveLimit = (offset + 1) * table.pageSize
    const evolutiveOffset = sum(Array.from({ length: offset + 1 }, (_, index) => index)) * table.pageSize

    return table.type === 'TokenTransfer'
      ? makeTransferQuery(table, evolutiveLimit, evolutiveOffset)
      : makeOperationQuery(table, evolutiveLimit, evolutiveOffset)
  }

  while (tablesThatDidntReachEnd.length) {
    const operationsQuery = TABLES.filter(table => tablesThatDidntReachEnd.includes(table.type))
      .map(table => '(' + makeQuery(table)(offset) + ')')
      .join(' UNION ')

    const params: any[] = [accountId]
    if (previousOldestId) params.push(previousOldestId)
    let newOperationsAndTransfers: Array<DbOperation | DbTransfer> = await query('OPERATIONS', operationsQuery, params)

    // NOTE: Migration can also be a root operation for a transfer
    // Migrations are not implemented in the explorer because they don't have an OpHash
    // Therefore exclude Migration related transfers
    const count = newOperationsAndTransfers.length
    newOperationsAndTransfers = newOperationsAndTransfers.filter(t => t.OpHash)
    if (newOperationsAndTransfers.length !== count)
      console.warn(`EXCLUDED ${count - newOperationsAndTransfers.length} operations or transfers with no OpHash`)

    operationsAndTransfers = operationsAndTransfers
      .concat(newOperationsAndTransfers)
      .sort((o1, o2) => Number(BigInt(o2.Id) - BigInt(o1.Id)))
    const hashes = eliminateDuplicates(operationsAndTransfers.map(o => o.OpHash))
    const newOperationsByType = groupBy(newOperationsAndTransfers, o => o.OperationType)

    if (process.env.NODE_ENV === 'development')
      console.info(Array.from(newOperationsByType).map(([type, ops]) => [type, ops.length]))

    tablesThatDidntReachEnd = tablesThatDidntReachEnd.filter(type => {
      const operationsAndTransfers = newOperationsByType.get(type)
      const pageSize = TABLES.find(table => table.type === type).pageSize
      return (
        operationsAndTransfers &&
        operationsAndTransfers.length === pageSize &&
        hashes.indexOf(operationsAndTransfers[operationsAndTransfers.length - 1].OpHash) < limit
      )
    })
    offset += 1
  }

  const batches = Array.from(groupBy(operationsAndTransfers, o => o.OpHash))
    .slice(0, limit)
    .map(([OpHash, operationsAndTransfers]) => ({
      OpHash,
      oldestId: operationsAndTransfers[operationsAndTransfers.length - 1].Id,
      operationsAndTransfers: <Array<DbOperation | DbTransfer>>operationsAndTransfers,
    }))

  const hashes = batches.map(o => o.OpHash)
  operationsAndTransfers = operationsAndTransfers.filter(o => hashes.includes(o.OpHash))

  return { operationsAndTransfers, batches, hashes }
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
  Id: number
  Address: string
}

async function queryAddresses(ids: number[]) {
  const addressesQuery = `
    SELECT "Id", "Address"
    FROM "Accounts"
    WHERE "Id" in (${'' + ids.join(',') + ''})
  `

  const addresses: Array<DbAddress> = await query('ADDRESSES', addressesQuery, [])

  return addresses
}

async function backend(address: string, limit: number, previousPagePayload) {
  let addressId: number = previousPagePayload?.addressId
  const previousOldestId: string | null = previousPagePayload?.oldestId

  if (!addressId) {
    const addressQuery = `SELECT "Id" FROM "Accounts" WHERE "Address" = $1`
    addressId = (await query('ADDRESS', addressQuery, [address]))[0].Id
  }

  // 1. On récupère les X derniers hashes

  // Not Implemented Yet: ticket transfers
  let { operationsAndTransfers, batches, hashes } = await queryBatches(addressId, limit, previousOldestId)
  let oldestId = batches[batches.length - 1].oldestId

  // 2. Je récupère les opérations racines

  const allRoots = await queryRoots(addressId, hashes)

  // On identifie les root operations qui nous intéressent

  const rootsOf: Record<string, DbOperation> = {}
  batches.forEach(batch => {
    batch.operationsAndTransfers.forEach(op => {
      // l'op racine est la plus grande op avec le meme hash
      // dont l'id reste plus petit que l'op interne
      rootsOf[op.Id] = op.IsRoot ? op : allRoots.find(root => root.OpHash === batch.OpHash && root.Id <= op.Id)

      if (!rootsOf[op.Id]) console.warn('THIS OPERATION HAS NO ROOT?!? not displayed', op.OperationType, op.Id)
    })
  })

  const uniqueRoots = eliminateDuplicates(Object.values(rootsOf), 'Id')
    .filter(r => r)
    .sort((a, b) => Number(BigInt(b.Id) - BigInt(a.Id))) // DESC

  // keeps ordering
  const rootsByHash = groupBy(uniqueRoots, r => r.OpHash)
  const operationsByRoot = groupBy(
    operationsAndTransfers.filter(o => o.OperationType !== 'TokenTransfer') as DbOperation[],
    o => rootsOf[o.Id].Id,
  )
  const transfersByRoot = groupBy(
    operationsAndTransfers.filter(t => t.OperationType === 'TokenTransfer') as DbTransfer[],
    t => rootsOf[t.Id].Id,
  )

  // 3. Identify and query adresses of every counterparty

  const counterpartyIdOfRoot: Record<string, number> = {}
  uniqueRoots.forEach(root => {
    const transfers = transfersByRoot.get(root.Id) ?? []
    const transferSenders = eliminateDuplicates(transfers.map(t => t.SenderId)).filter(s => s !== addressId)
    const transferTargets = eliminateDuplicates(transfers.map(t => t.TargetId)).filter(t => t !== addressId)
    const lengthierSide = transferTargets.length > transferSenders.length ? transferTargets : transferSenders
    const isThereBurnOrMint = transfers.find(t => !t.SenderId || !t.TargetId)
    counterpartyIdOfRoot[root.Id] =
      // if there are transfers with a single counterparty, display this counterparty
      lengthierSide.length === 1 && !isThereBurnOrMint
        ? lengthierSide[0]
        : // otherwise, take the smart contract name
          !root.SenderId || (root.SenderId === addressId && root.TargetId)
          ? root.TargetId
          : // or the sender
            root.SenderId
  })

  const counterparties = await queryAddresses(eliminateDuplicates(Object.values(counterpartyIdOfRoot)))

  // 4. On fabrique la réponse

  const history: History = Array.from(rootsByHash).map(([hash, roots]) =>
    roots.map(root => {
      const operationType =
        root.OperationType === 'Origination'
          ? 'contractCreation'
          : root.OperationType === 'Transaction'
            ? !root.otherProperties.Entrypoint || // native xtz transfer
              /*root.TargetAccountKind === 2 &&*/ root.otherProperties.Entrypoint === 'transfer' // fa transfer
              ? 'transfer'
              : 'call'
            : 'tezosSpecific'

      const xtzAmount = sum(
        (operationsByRoot.get(root.Id) ?? []).map(o => (o.SenderId === addressId ? -o.Amount : +o.Amount)),
      )

      return {
        id: root.OpHash,
        operationType,
        tezosSpecificType: operationType === 'tezosSpecific' ? root.OperationType : null,
        status:
          root.otherProperties?.Status === null
            ? 'success'
            : root.otherProperties?.Status === 1
              ? 'success'
              : 'failure',
        date: root.Timestamp,
        functionName: root.otherProperties?.Entrypoint,
        counterpartyAddress: counterparties.find(c => c.Id === counterpartyIdOfRoot[root.Id]).Address,
        balanceChanges: (xtzAmount
          ? [
              {
                quantity: xtzAmount.toString(),
                asset: {
                  assetType: 'coin',
                  id: 'tezos',
                  name: 'Tezos',
                  ticker: 'XTZ',
                  decimals: 6,
                  image: null, // will be stored by frontend
                } as Asset,
              },
            ]
          : []
        ).concat(
          Array.from(groupBy(transfersByRoot.get(root.Id) ?? [], t => t.AssetId)).map(([assetId, transfers]) => ({
            quantity: sum(transfers.map(t => BigInt(t.SenderId === addressId ? -1 : 1) * BigInt(t.Amount))).toString(),
            asset:
              transfers[0].Metadata?.decimals == 0
                ? ({
                    assetType: 'nft',
                    id: transfers[0].ContractAddress + '_' + transfers[0].TokenId,
                    name: transfers[0].Metadata?.name,
                    image: transfers[0].Metadata?.thumbnailUri,
                  } as Nft)
                : ({
                    assetType: 'coin',
                    id: transfers[0].ContractAddress + '_' + transfers[0].TokenId,
                    name: transfers[0].Metadata?.name,
                    ticker: transfers[0].Metadata?.symbol,
                    decimals: transfers[0].Metadata?.decimals,
                    image: transfers[0].Metadata?.thumbnailUri ?? transfers[0].Metadata?.icon ?? null,
                  } as Coin),
          })),
        ),
      } as Operation
    }),
  )

  const nextPageToken = encodeURIComponent(btoa(JSON.stringify({ addressId, oldestId })).replace(/=+$/, ''))

  return { history, nextPageToken }
}

const validate = (address, limit, nextPageToken): string | undefined => {
  const tezosAddressRegex = /^(tz1|tz2|tz3|KT1)[1-9A-HJ-NP-Za-km-z]{33}$/

  if (!(address && typeof address === 'string' && tezosAddressRegex.test(address))) {
    return 'Invalid tezos address in req.body.address'
  }

  if (!(limit && Number.isInteger(limit) && 0 < limit && limit < 100)) {
    return 'Invalid limit in req.body.limit'
  }

  if (nextPageToken && !(typeof nextPageToken === 'string')) {
    return 'Invalid nextPageToken in req.body.nextPageToken'
  }
}

const validatePagePayload = (pagePayload): string | undefined => {
  const digitsOnly = /^\d+$/

  if (
    !(
      'addressId' in pagePayload &&
      typeof pagePayload.addressId === 'number' &&
      Number.isInteger(pagePayload.addressId) &&
      0 < pagePayload.addressId
    )
  ) {
    return 'Invalid addressId in pagePayload'
  }

  if (
    !('oldestId' in pagePayload && typeof pagePayload.oldestId === 'string' && digitsOnly.test(pagePayload.addressId))
  ) {
    return 'Invalid oldestId in pagePayload'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address
  const limit = +req.query.limit
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
