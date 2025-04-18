import { OperationBatch } from '@/backend/apiTypes'
import { query } from '@/backend/providers/db'
import { solveAccountType, solveAddressName } from '@/backend/solve'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hash = req.query.hash

  try {
    const response = await query(
      'OPERATION BATCH',
      `
        SELECT
          op."Id",
          op."Amount",
          op."Entrypoint",
          op."Timestamp",
          op."Level",
          op."BakerFee",
          op."StorageFee",
          op."AllocationFee",
          op."GasUsed",
          op."Status",
          op."SenderCodeHash",
          op."TargetCodeHash",
          Sender."Type" as "SenderType",
          Sender."Kind" as "SenderKind",
          Sender."Address" as "SenderAddress",
          Sender."Metadata" as "SenderMetadata",
          jsonb_agg(jsonb_build_object(
            'name', SenderDomain."Name",
            'lastLevel', SenderDomain."LastLevel",
            'data', SenderDomain."Data",
            'id', SenderDomain."Id"
          )) as "SenderDomains",
          jsonb_agg(SenderToken."Metadata") as "SenderTokenMetadata",
          Target."Type" as "TargetType",
          Target."Kind" as "TargetKind",
          Target."Address" as "TargetAddress",
          Target."Metadata" as "TargetMetadata",
          jsonb_agg(jsonb_build_object(
            'name', TargetDomain."Name",
            'lastLevel', TargetDomain."LastLevel",
            'data', TargetDomain."Data",
            'id', TargetDomain."Id"
          )) as "TargetDomains",
          jsonb_agg(TargetToken."Metadata") as "TargetTokenMetadata",
          jsonb_agg(jsonb_build_object(
            'Amount', "TokenTransfers"."Amount",
            'Metadata', "Tokens"."Metadata",
            'Id', "TokenContract"."Address" || '_' || "Tokens"."TokenId",
            'From', jsonb_build_object(
              'address', TokenTransferSender."Address",
              'type', TokenTransferSender."Type",
              'kind', TokenTransferSender."Kind",
              'metadata', TokenTransferSender."Metadata",
              'domains', (
                SELECT jsonb_agg(jsonb_build_object(
                  'name', "Domains"."Name",
                  'lastLevel', "Domains"."LastLevel",
                  'data', "Domains"."Data",
                  'id', "Domains"."Id"
                )) FROM "Domains" WHERE "Domains"."Address" ILIKE TokenTransferSender."Address"
              )
            ),
            'To', jsonb_build_object(
              'address', TokenTransferTarget."Address",
              'type', TokenTransferTarget."Type",
              'kind', TokenTransferTarget."Kind",
              'metadata', TokenTransferTarget."Metadata",
              'domains', (
                SELECT jsonb_agg(jsonb_build_object(
                  'name', "Domains"."Name",
                  'lastLevel', "Domains"."LastLevel",
                  'data', "Domains"."Data",
                  'id', "Domains"."Id"
                )) FROM "Domains" WHERE "Domains"."Address" ILIKE TokenTransferTarget."Address"
              )
            )
          )) FILTER (WHERE "TokenTransfers"."Amount" IS NOT NULL) AS "Tokens"
        FROM
          "TransactionOps" as op
        LEFT JOIN
          "Accounts" as Sender ON Sender."Id" = op."SenderId"
        LEFT JOIN
          "Accounts" as Target ON Target."Id" = op."TargetId"
        LEFT JOIN
          "Domains" as SenderDomain ON SenderDomain."Address" = Sender."Address"
        LEFT JOIN
          "Domains" as TargetDomain ON TargetDomain."Address" = Target."Address"
        LEFT JOIN
          "Tokens" as SenderToken ON SenderToken."ContractId" = Sender."Id" and SenderToken."TokenId" = '0'
        LEFT JOIN
          "Tokens" as TargetToken ON TargetToken."ContractId" = Target."Id" and TargetToken."TokenId" = '0'
        LEFT JOIN
          "TokenTransfers" ON "TokenTransfers"."TransactionId" = op."Id"
        LEFT JOIN
          "Accounts" as TokenTransferSender ON TokenTransferSender."Id" = "TokenTransfers"."FromId"
        LEFT JOIN
          "Accounts" as TokenTransferTarget ON TokenTransferTarget."Id" = "TokenTransfers"."ToId"
        LEFT JOIN
			    "Tokens" ON "Tokens"."Id" = "TokenTransfers"."TokenId"
        LEFT JOIN
          "Accounts" as "TokenContract" ON "TokenContract"."Id" = "Tokens"."ContractId"
        WHERE
          op."OpHash" = $1
        GROUP BY
          op."Id",
          op."Amount",
          op."Entrypoint",
          op."Timestamp",
          op."Level",
          op."BakerFee",
          op."StorageFee",
          op."AllocationFee",
          op."GasUsed",
          op."Status",
          op."SenderCodeHash",
          op."TargetCodeHash",
          Sender."Type",
          Sender."Kind",
          Sender."Address",
          Sender."Metadata",
          Target."Type",
          Target."Kind",
          Target."Address",
          Target."Metadata"
        ORDER BY
          op."Id" ASC
    `,
      [hash],
    )

    const operationGroupList = []

    response.forEach(operation => {
      if (!operation.SenderCodeHash) {
        operationGroupList.push({
          status: operation.Status == 1 ? 'success' : 'failure',
          codeHash: operation.TargetCodeHash,
          fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee,
          operationList: [
            {
              operationType: !operation.Entrypoint || operation.Entrypoint === 'transfer' ? 'transfer' : 'call',
              from: {
                accountType: solveAccountType(operation.SenderType, operation.SenderKind),
                address: operation.SenderAddress,
                name: solveAddressName(
                  operation.SenderDomains,
                  operation.SenderMetadata,
                  operation.SenderTokenMetadata,
                ),
                image: operation.SenderMetadata?.imageUri,
              },
              to: {
                accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                address: operation.TargetAddress,
                name: solveAddressName(
                  operation.TargetDomains,
                  operation.TargetMetadata,
                  operation.TargetTokenMetadata,
                ),
                image: operation.TargetMetadata?.imageUri,
              },
              assets: (operation.Amount != '0'
                ? [
                    {
                      quantity: operation.Amount.toString(),
                      asset: {
                        assetType: 'coin',
                        id: 'tezos',
                        name: 'Tezos',
                        ticker: 'XTZ',
                        decimals: 6,
                        image: null,
                      },
                      from: {
                        accountType: solveAccountType(operation.SenderType, operation.SenderKind),
                        address: operation.SenderAddress,
                        name: solveAddressName(
                          operation.SenderDomains,
                          operation.SenderMetadata,
                          operation.SenderTokenMetadata,
                        ),
                        image: operation.SenderMetadata?.imageUri,
                      },
                      to: {
                        accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                        address: operation.TargetAddress,
                        name: solveAddressName(
                          operation.TargetDomains,
                          operation.TargetMetadata,
                          operation.TargetTokenMetadata,
                        ),
                        image: operation.TargetMetadata?.imageUri,
                      },
                    },
                  ]
                : []
              ).concat(
                operation.Tokens?.map(token =>
                  token.Metadata.decimals == '0'
                    ? {
                        quantity: token.Amount,
                        asset: {
                          assetType: 'nft',
                          id: token.Id,
                          name: token.Metadata.name,
                          ticker: null,
                          decimals: '0',
                          image: token.Metadata.thumbnailUrl,
                        },
                        from: {
                          accountType:
                            solveAccountType(token.From.type, token.From.kind) ??
                            solveAccountType(operation.SenderType, operation.SenderKind),
                          address: token.From.address ?? operation.SenderAddress,
                          name: solveAddressName(token.From.domains, null, null),
                          image: token.From.metadata?.imageUri,
                        },
                        to: {
                          accountType: solveAccountType(token.To.type, token.To?.kind),
                          address: token.To.address,
                          name: solveAddressName(token.To.domains, null, null),
                          image: token.To.metadata?.imageUri,
                        },
                      }
                    : {
                        quantity: token.Amount,
                        asset: {
                          assetType: 'coin',
                          id: token.Id,
                          name: token.Metadata.name,
                          ticker: token.Metadata.symbol,
                          decimals: token.Metadata.decimals,
                          image: token.Metadata.thumbnailUri ?? token.Metadata.icon ?? null,
                        },
                        from: {
                          accountType:
                            solveAccountType(token.From.type, token.From.kind) ??
                            solveAccountType(operation.SenderType, operation.SenderKind),
                          address: token.From.address ?? operation.SenderAddress,
                          name: solveAddressName(token.From.domains, null, null),
                          image: token.From.metadata?.imageUri,
                        },
                        to: {
                          accountType: solveAccountType(token.To.type, token.To.kind),
                          address: token.To.address,
                          name: solveAddressName(token.To.domains, null, null),
                          image: token.To.metadata?.imageUri,
                        },
                      },
                ) ?? [],
              ),
              entrypoint: operation.Entrypoint,
              fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee,
            },
          ],
        })
      }
    })
    response.forEach(operation => {
      if (operation.SenderCodeHash) {
        operationGroupList.forEach(rootOp => {
          if (rootOp.codeHash === operation.SenderCodeHash) {
            rootOp.fees += +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee
            rootOp.operationList.push({
              operationType: !operation.Entrypoint || operation.Entrypoint === 'transfer' ? 'transfer' : 'call',
              from: {
                accountType: solveAccountType(operation.SenderType, operation.SenderKind),
                address: operation.SenderAddress,
                name: solveAddressName(
                  operation.SenderDomains,
                  operation.SenderMetadata,
                  operation.SenderTokenMetadata,
                ),
                image: operation.SenderMetadata?.imageUri,
              },
              to: {
                accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                address: operation.TargetAddress,
                name: solveAddressName(
                  operation.TargetDomains,
                  operation.TargetMetadata,
                  operation.TargetTokenMetadata,
                ),
                image: operation.TargetMetadata?.imageUri,
              },
              assets: (operation.Amount != '0'
                ? [
                    {
                      quantity: operation.Amount.toString(),
                      asset: {
                        assetType: 'coin',
                        id: 'tezos',
                        name: 'Tezos',
                        ticker: 'XTZ',
                        decimals: 6,
                        image: null,
                      },
                      from: {
                        accountType: solveAccountType(operation.SenderType, operation.SenderKind),
                        address: operation.SenderAddress,
                        name: solveAddressName(
                          operation.SenderDomains,
                          operation.SenderMetadata,
                          operation.SenderTokenMetadata,
                        ),
                        image: operation.SenderMetadata?.imageUri,
                      },
                      to: {
                        accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                        address: operation.TargetAddress,
                        name: solveAddressName(
                          operation.TargetDomains,
                          operation.TargetMetadata,
                          operation.TargetTokenMetadata,
                        ),
                        image: operation.TargetMetadata?.imageUri,
                      },
                    },
                  ]
                : []
              ).concat(
                operation.Tokens?.map(token =>
                  token.Metadata.decimals == '0'
                    ? {
                        quantity: token.Amount,
                        asset: {
                          assetType: 'nft',
                          id: token.Id,
                          name: token.Metadata.name,
                          ticker: null,
                          decimals: '0',
                          image: token.Metadata.thumbnailUri,
                        },
                        from: {
                          accountType:
                            solveAccountType(token.From.type, token.From.kind) ??
                            solveAccountType(operation.SenderType, operation.SenderKind),
                          address: token.From.address ?? operation.SenderAddress,
                          name: solveAddressName(token.From.domains, null, null),
                          image: token.From.metadata?.imageUri,
                        },
                        to: {
                          accountType: solveAccountType(token.To.type, token.To.kind),
                          address: token.To.address,
                          name: solveAddressName(token.To.domains, null, null),
                          image: token.To.metadata?.imageUri,
                        },
                      }
                    : {
                        quantity: token.Amount,
                        asset: {
                          assetType: 'coin',
                          id: token.Id,
                          name: token.Metadata.name,
                          ticker: token.Metadata.symbol,
                          decimals: token.Metadata.decimals,
                          image: token.Metadata.thumbnailUri ?? token.Metadata.icon ?? null,
                        },
                        from: {
                          accountType:
                            solveAccountType(token.From.type, token.From.kind) ??
                            solveAccountType(operation.SenderType, operation.SenderKind),
                          address: token.From.address ?? operation.SenderAddress,
                          name: solveAddressName(token.From.domains, null, null),
                          image: token.From.metadata?.imageUri,
                        },
                        to: {
                          accountType: solveAccountType(token.To.type, token.To.kind),
                          address: token.To.address,
                          name: solveAddressName(token.To.domains, null, null),
                          image: token.To.metadata?.imageUri,
                        },
                      },
                ) ?? [],
              ),
              entrypoint: operation.Entrypoint,
              fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee,
            })
          }
        })
      }
    })

    res.status(200).json({
      operationGroupList: operationGroupList,
      date: response[0].Timestamp,
      block: response[0].Level,
      fees: operationGroupList.reduce((total, operationGroup) => {
        return total + operationGroup.fees
      }, 0),
    } as OperationBatch)
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` })
    console.error(err)
  }
}
