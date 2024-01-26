import { Operation } from './../../endpoints/API';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { OperationBatch } from './_apiTypes';
import { solveAccountType } from '@/pages/api/_solve';
import { ipfsToHttps } from '@/endpoints/providers/utils';

/*export type Operation = {
  id : string,
  operationType: OperationType,
  stakingType: StakingType,
  status : StatusType,
  from : Account,
  to : Account,
  functionName: string,
  executions : Array<Execution>,
  fees: Dollars,
  transferedAssets: Array<{
    quantity: TokenDecimals,
    from : Account,
    to : Account,
    asset : Asset,
  }>,
}*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const hash = req.query.hash;

  try {
    const response = await query('OPERATION BATCH', `
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
          Target."Type" as "TargetType",
          Target."Kind" as "TargetKind",
          Target."Address" as "TargetAddress",
          Target."Metadata" as "TargetMetadata",
          "TokenTransfers"."Amount" as "TokenAmount",
          "Tokens"."Metadata"
        FROM
          "TransactionOps" as op
        LEFT JOIN
          "Accounts" as Sender ON Sender."Id" = op."SenderId"
        LEFT JOIN
          "Accounts" as Target ON Target."Id" = op."TargetId"
        LEFT JOIN
          "TokenTransfers" on "TokenTransfers"."TransactionId" = op."Id"
        LEFT JOIN
			    "Tokens" ON "Tokens"."Id" = "TokenTransfers"."TokenId"
        WHERE
          op."OpHash" = $1
        ORDER BY
          op."Id" ASC
    `, [hash]);

    const operationGroupList = [];

    response.forEach((operation) => {
      if (!operation.SenderCodeHash) {
        operationGroupList.push({
          status: operation.Status,
          codeHash: operation.TargetCodeHash,
          fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee,
          operationList: [{
            operationType: (!operation.Entrypoint || operation.Entrypoint === 'transfer' ? 'transfer' : 'call'),
            from: {
              accountType: solveAccountType(operation.SenderType, operation.SenderKind),
              address: operation.SenderAddress,
              name: operation.SenderMetadata?.name,
              image: ipfsToHttps(operation.SenderMetadata?.imageUri),
            },
            to: {
              accountType: solveAccountType(operation.TargetType, operation.TargetKind),
              address: operation.TargetAddress,
              name: operation.TargetMetadata?.name,
              image: ipfsToHttps(operation.TargetMetadata?.imageUri),
            },
            quantity: operation.TokenAmount ?? operation.Amount,
            asset: (!operation.Entrypoint || operation.Entrypoint === 'transfer' ? (operation.Amount != '0' ? {
              assetType: 'coin',
              id: 'tezos',
              name: 'Tezos',
              ticker: 'XTZ',
              decimals: 6,
              image: null,
            } : (operation.Metadata.decimals == '0' ? {
              assetType: 'nft',
              id: '',
              name: operation.Metadata.name,
              ticker: null,
              decimals: '0',
              image: ipfsToHttps(operation.Metadata.thumbnailUri),
            } : {
              assetType: 'coin',
              id: '',
              name: operation.Metadata.name,
              ticker: operation.Metadata.symbol,
              decimals: operation.Metadata.decimals,
              image: ipfsToHttps(operation.Metadata.thumbnailUri ?? operation.Metadata.icon ?? null),
            })) : null),
            entrypoint: operation.Entrypoint,
            fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee
          }]
        });
      }
    });

    response.forEach((operation) => {
      if (operation.SenderCodeHash) {
        operationGroupList.forEach((rootOp) => {
          if (rootOp.codeHash === operation.SenderCodeHash) {
            rootOp.fees += +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee;
            rootOp.operationList.push({
              operationType: (!operation.Entrypoint || operation.Entrypoint === 'transfer' ? 'transfer' : 'call'),
              from: {
                accountType: solveAccountType(operation.SenderType, operation.SenderKind),
                address: operation.SenderAddress,
                name: operation.SenderMetadata?.name,
                image: ipfsToHttps(operation.SenderMetadata?.imageUri),
              },
              to: {
                accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                address: operation.TargetAddress,
                name: operation.TargetMetadata?.name,
                image: ipfsToHttps(operation.TargetMetadata?.imageUri),
              },
              quantity: operation.TokenAmount ?? operation.Amount,
              asset: (!operation.Entrypoint || operation.Entrypoint === 'transfer' ? (operation.Amount != '0' ? {
                assetType: 'coin',
                id: 'tezos',
                name: 'Tezos',
                ticker: 'XTZ',
                decimals: '6',
                image: null,
              } : (operation.Metadata.decimals == '0' ? {
                assetType: 'nft',
                id: '',
                name: operation.Metadata.name,
                ticker: null,
                decimals: '0',
                image: ipfsToHttps(operation.Metadata.thumbnailUri),
              } : {
                assetType: 'coin',
                id: '',
                name: operation.Metadata.name,
                ticker: operation.Metadata.symbol,
                decimals: operation.Metadata.decimals,
                image: ipfsToHttps(operation.Metadata.thumbnailUri ?? operation.Metadata.icon ?? null),
              })) : null),
              entrypoint: operation.Entrypoint,
              fees: +operation.BakerFee + +operation.StorageFee + +operation.AllocationFee
            });
          }
        })
      }
    });

    res.status(200).json({
        operationGroupList: operationGroupList,
        date: response[0].Timestamp,
        block: response[0].Level,
        fees: operationGroupList.reduce((total, operationGroup) => { return (total + operationGroup.fees) }, 0)
    } as OperationBatch);
  } catch (err) {
    res.status(500).json({ error: `Erreur du serveur ${err}` });
    console.error(err)
  }
}