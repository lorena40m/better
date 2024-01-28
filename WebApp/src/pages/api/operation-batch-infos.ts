import { Operation } from './../../endpoints/API';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { OperationBatch } from './_apiTypes';
import { solveAccountType, solveAddressName } from '@/pages/api/_solve';
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
            'Metadata', "Tokens"."Metadata"
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
          "Tokens" as TargetToken ON TargetToken."ContractId" = Sender."Id" and TargetToken."TokenId" = '0'
        LEFT JOIN
          "TokenTransfers" on "TokenTransfers"."TransactionId" = op."Id"
        LEFT JOIN
			    "Tokens" ON "Tokens"."Id" = "TokenTransfers"."TokenId"
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
              name: solveAddressName(operation.SenderDomains, operation.SenderMetadata, operation.SenderTokenMetadata),
              image: ipfsToHttps(operation.SenderMetadata?.imageUri),
            },
            to: {
              accountType: solveAccountType(operation.TargetType, operation.TargetKind),
              address: operation.TargetAddress,
              name: solveAddressName(operation.TargetDomains, operation.TargetMetadata, operation.TargetTokenMetadata),
              image: ipfsToHttps(operation.TargetMetadata?.imageUri),
            },
            assets: (operation.Amount != "0" ? [{
              quantity: operation.Amount.toString(),
              asset: {
                assetType: 'coin',
                id: 'tezos',
                name: 'Tezos',
                ticker: 'XTZ',
                decimals: 6,
                image: null,
              },
            }] : []).concat(operation.Tokens?.map((token) => (
              (token.Metadata.decimals == '0' ? {
                quantity: token.Amount,
                asset: {
                  assetType: 'nft',
                  id: '',
                  name: token.Metadata.name,
                  ticker: null,
                  decimals: '0',
                  image: ipfsToHttps(token.Metadata.thumbnailUri)
                }
              } : {
                quantity: token.Amount,
                asset: {
                  assetType: 'coin',
                  id: '',
                  name: token.Metadata.name,
                  ticker: token.Metadata.symbol,
                  decimals: token.Metadata.decimals,
                  image: ipfsToHttps(token.Metadata.thumbnailUri ?? token.Metadata.icon ?? null)
                }
              }))
            ) ?? []),
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
                name: solveAddressName(operation.SenderDomains, operation.SenderMetadata, operation.SenderTokenMetadata),
                image: ipfsToHttps(operation.SenderMetadata?.imageUri),
              },
              to: {
                accountType: solveAccountType(operation.TargetType, operation.TargetKind),
                address: operation.TargetAddress,
                name: solveAddressName(operation.TargetDomains, operation.TargetMetadata, operation.TargetTokenMetadata),
                image: ipfsToHttps(operation.TargetMetadata?.imageUri),
              },
              assets: (operation.Amount != "0" ? [{
                quantity: operation.Amount.toString(),
                asset: {
                  assetType: 'coin',
                  id: 'tezos',
                  name: 'Tezos',
                  ticker: 'XTZ',
                  decimals: 6,
                  image: null,
                },
              }] : []).concat(operation.Tokens?.map((token) => (
                (token.Metadata.decimals == '0' ? {
                  quantity: token.Amount,
                  asset: {
                    assetType: 'nft',
                    id: '',
                    name: token.Metadata.name,
                    ticker: null,
                    decimals: '0',
                    image: ipfsToHttps(token.Metadata.thumbnailUri)
                  }
                } : {
                  quantity: token.Amount,
                  asset: {
                    assetType: 'coin',
                    id: '',
                    name: token.Metadata.name,
                    ticker: token.Metadata.symbol,
                    decimals: token.Metadata.decimals,
                    image: ipfsToHttps(token.Metadata.thumbnailUri ?? token.Metadata.icon ?? null)
                  }
                })
              )) ?? []),
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
