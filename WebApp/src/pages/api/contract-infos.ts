import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
const bip39 = require('bip39');

export type Contract = {
  id: string,
  creationDate: DateString,
  balance: string,
  operationCount: number,
  creatorAddress: string,
  creatorDomain: string,
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

    /*const taquitoRpc = new TezosToolkit('http://91.163.75.179:8732/');
    let entrypoints = [];

    taquitoRpc.setProvider({ signer: await InMemorySigner.fromSecretKey('edsk2rKA8YEExg9Zo2qNPiQnnYheF1DhqjLVmfKdxiFfu5GyGRZRnb') });

    try {
      const taquitoContract = await taquitoRpc.contract.at(address);
      const contractEntrypoints = taquitoContract.entrypoints;
      const entrypointNames = Object.keys(contractEntrypoints.entrypoints);

      entrypoints = await Promise.all(entrypointNames.map(entrypoint => {
        try {
          const entrypointType = contractEntrypoints.entrypoints[entrypoint];
          console.log(entrypointType);
          const dummyData = generateMichelsonValue(entrypointType);
          console.log("YO");
          console.log(dummyData);

          const operation = {
              to: taquitoContract.address,
              amount: 0,
              mutez: true,
              parameter: {
                  entrypoint: entrypoint,
                  value: dummyData
              }
          };

          return taquitoRpc.estimate.transfer(operation).then(estimate => ({
            name: entrypoint,
            fee: estimate.suggestedFeeMutez
          }))
        } catch (estimateError) {
            console.error(`Error estimating fees for entrypoint ${entrypoint}:`, estimateError);
        }
      }))
    } catch (err) {
      console.error(err);
    }
    console.log(entrypoints);*/

    res.status(200).json({
      infos: {
        balance: contract[0].Balance,
        operationCount: contract[0].TransactionsCount,
        id: contract[0].Id,
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
