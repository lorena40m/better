import { Metadata } from './_solve';
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { getAssetSources } from '@/utils/link';
import { solveAccountType, solveAddressName } from './_solve';
import { ipfsToHttps } from '@/endpoints/providers/utils';
import { Account } from '@/pages/api/_apiTypes';
import { getCollection } from '@/endpoints/providers/objkt';

export type Contract = {
  contractType: string,
  id: string,
  creationDate: DateString,
  floorPrice: any,
  balance: string,
  metadata: any,
  operationCount: number,
  creatorAddress: string,
  creatorDomain: string,
  image: any,
  tokens: Array<{
    id: string,
    supply: string,
    holderscount: number,
    owner: Account,
    metadata: any,
    image: UrlString,
  }>,
  averageFee: number,
  entrypoints: Array<{
    name: string,
    fee: number
  }>
}

/*function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function randomBool() {
  return Math.random() < 0.5;
}

function randomTimestamp() {
  return new Date(Date.now() - randomInt(0, 30 * 365 * 24 * 60 * 60 * 1000)).toISOString();
}

function randomAddress() {
  return 'tz1' + randomString(33);
}

function randomMutez() {
  return randomInt(1, 1000000);
}

function randomChainId() {
  return 'Net' + randomString(15);
}

function randomLambda() {
  return "(parameter int) (storage int) (code (PUSH int 1) (ADD))";
}

function randomOperation() {
  return "operation";
}

function randomBytes(length) {
  let result = '';
  let characters = '0123456789ABCDEF';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateMichelsonValue(typeObj) {
  let objReturn: any = {};
  switch (typeObj.prim) {
    case 'pair':
      objReturn = { prim: 'Pair', args: [] };
      typeObj.args.forEach(arg => {
        objReturn.args.push(generateMichelsonValue(arg));
      });
      return (objReturn);
    case 'or':
      objReturn = { prim: 'Or', }
  }
}*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const address = <string> req.query.address;

  try {
    const contract = await query('ACCOUNT INFOS', `
    SELECT
      contract."Balance",
      contract."Id",
      contract."TransactionsCount",
      contract."Metadata",
      creator."Address",
      creatorDomain."Name",
      creationBlock."Timestamp"
    FROM
      "Accounts" as contract
    INNER JOIN
      "Accounts" as creator ON creator."Id" = contract."CreatorId"
    INNER JOIN
      "Blocks" as creationBlock ON creationBlock."Level" = contract."FirstLevel"
    LEFT JOIN
      "Domains" as creatorDomain ON creatorDomain."Address" = creator."Address"
    WHERE
      contract."Address" = $1
    GROUP BY
      contract."Id",
      creator."Address",
      creatorDomain."Name",
      creationBlock."Timestamp"
    `, [address]);
    const feeHistory = await query('FEE HISTORY', `
    SELECT
      tsxOps."BakerFee",
      tsxOps."StorageFee",
      tsxOPs."AllocationFee"
    FROM
      "Accounts" as contract
    INNER JOIN
      "TransactionOps" as tsxOps ON(tsxOps."TargetId" = contract."Id")
    WHERE
      contract."Address" = $1
    LIMIT
      100
    `, [address]);
    let totalFee = 0;
    feeHistory.forEach(fee => {
      totalFee += +fee?.BakerFee + +fee?.StorageFee + +fee?.AllocationFee;
    });
    const averageFee = totalFee / feeHistory.length;

    let contractType = 'smart_contract';

    const tokens = await query('COLLECTION TOKENS', `
        SELECT
          token."TokenId" as id,
          token."TotalSupply" as supply,
          token."HoldersCount" as holdersCount,
          jsonb_build_object(
            'address', tokenOwner."Address",
            'type', tokenOwner."Type",
            'kind', tokenOwner."Kind",
            'metadata', tokenOwner."Metadata",
            'domains', (
              SELECT jsonb_agg(jsonb_build_object(
                'name', "Domains"."Name",
                'lastLevel', "Domains"."LastLevel",
                'data', "Domains"."Data",
                'id', "Domains"."Id"
              )) FROM "Domains" WHERE "Domains"."Address" = tokenOwner."Address"
            )
          ) as owner,
          token."Metadata" as metadata,
          COALESCE(token."Metadata"->>'thumbnailUri', token."Metadata"->>'displayUri', token."Metadata"->>'artifactUri') as image
        FROM
          "Tokens" as token
        LEFT JOIN
          "Accounts" as tokenOwner ON tokenOwner."Id" = token."OwnerId"
        WHERE
          token."ContractId" = $1
        ORDER BY
          CAST(token."TokenId" AS INTEGER)
        LIMIT $2
        OFFSET $3
    `, [contract[0].Id, 100, 0]);

    if (tokens?.length > 0) {
      if (tokens.length === 1 && Number(tokens[0].metadata?.decimals) > 0) {
        contractType = 'coin';
      } else if (tokens.reduce((total, token) => total + (!token.metadata?.decimals ? 0 : token.metadata?.decimals != '0' ? 1 : 0), 0) === 0) {
        contractType = 'collection';
      } else {
        contractType = 'multiple_assets'
      }
    };

    tokens?.forEach(token => {
      token.image = getAssetSources(token.image, address, token.id);
      token.owner = {
        accountType: solveAccountType(token.owner.type, token.owner.kind),
        address: token.owner.address,
        name: solveAddressName(token.owner.domains, null, null),
        image: ipfsToHttps(token.owner.metadata?.imageUri),
      }
    });

    let objktInfos = (await getCollection(address));

    res.status(200).json({
      infos: {
        contractType: contractType,
        floorPrice: objktInfos.floorPrice,
        balance: contract[0].Balance,
        operationCount: contract[0].TransactionsCount,
        metadata: contract[0].Metadata,
        image: objktInfos.image ?? getAssetSources(contract[0].Metadata?.thumbnailUri ?? contract[0].Metadata?.displayUri ?? contract[0].Metadata?.imageUri ?? contract[0].Metadata?.artifactUri, null, null) ?? tokens.find((token) => token.id == 0)?.image ?? tokens.find((token) => token.id == 1)?.image,
        id: contract[0].Id,
        tokens: tokens,
        creationDate: contract[0].Timestamp,
        creatorAddress: contract[0].Address,
        creatorDomain: contract[0].Name,
        averageFee: averageFee,
        entrypoints: []
      } as Contract
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
