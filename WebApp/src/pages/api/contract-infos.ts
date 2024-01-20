import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { TokenDecimals, UrlString, DateString } from '@/pages/api/_apiTypes';
/*import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
const bip39 = require('bip39');*/

export type Contract = {
  id: string,
  creationDate: DateString,
  balance: string,
  operationCount: number,
  creatorAddress: string,
  creatorDomain: string,
  averageFee: number,
  /*entrypoints: Array<{
    name: string,
    fee: number
  }>*/
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
  return 'tz1' + randomString(33); // Simplified
}

function randomMutez() {
  return randomInt(1, 1000000); // Simplified representation of Tez
}

function randomChainId() {
  return 'Net' + randomString(15); // Simplified
}

function randomLambda() {
  // Very basic lambda representation
  return "(parameter int) (storage int) (code (PUSH int 1) (ADD))";
}

function randomOperation() {
  // Simplified operation representation
  return "operation";
}

function generateMichelsonValue(typeObj) {
  if (!typeObj || typeof typeObj !== 'object') {
      throw new Error('Invalid type object');
  }

  if (Array.isArray(typeObj)) {
      return typeObj.map(generateMichelsonValue);
  }

  if (typeObj.prim) {
      switch (typeObj.prim) {
          case 'int':
              return randomInt(-1000, 1000);
          case 'nat':
              return randomInt(0, 1000);
          case 'string':
              return randomString(10);
          case 'bool':
              return randomBool();
          case 'timestamp':
              return randomTimestamp();
          case 'address':
              return randomAddress();
          case 'mutez':
              return randomMutez();
          case 'chain_id':
              return randomChainId();
          case 'lambda':
              return randomLambda();
          case 'operation':
              return randomOperation();
          case 'pair':
          case 'or':
              if (Array.isArray(typeObj.args)) {
                  return typeObj.args.map(generateMichelsonValue);
              }
              break;
          case 'list':
              return Array.from({ length: randomInt(1, 5) }, () => generateMichelsonValue(typeObj.args[0]));
          case 'map':
              let mapLength = randomInt(1, 5);
              let map = [];
              for (let i = 0; i < mapLength; i++) {
                  map.push({
                      key: generateMichelsonValue(typeObj.args[0]),
                      value: generateMichelsonValue(typeObj.args[1])
                  });
              }
              return map;
          // Add more case statements for other Michelson primitives as needed
      }
  }

  throw new Error(`Unsupported or missing prim type in object: ${JSON.stringify(typeObj)}`);
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

    /*const taquitoRpc = new TezosToolkit('https://mainnet.ecadinfra.com/');
    const entrypoints = [];

    taquitoRpc.setProvider({ signer: await InMemorySigner.fromSecretKey('edsk2rKA8YEExg9Zo2qNPiQnnYheF1DhqjLVmfKdxiFfu5GyGRZRnb') });

    try {
      const taquitoContract = await taquitoRpc.contract.at(address);
      const contractEntrypoints = taquitoContract.entrypoints;
      const entrypointNames = Object.keys(contractEntrypoints.entrypoints);
  
      for (const entrypoint of entrypointNames) {
        try {
          const entrypointType = contractEntrypoints.entrypoints[entrypoint];
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

          const estimate = await taquitoRpc.estimate.transfer(operation);
          entrypoints.push({
              name: entrypoint,
              fee: estimate.suggestedFeeMutez
          });
        } catch (estimateError) {
            console.error(`Error estimating fees for entrypoint ${entrypoint}:`, estimateError);
        }
      }
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
        /*entrypoints: entrypoints*/
      } as Contract
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
