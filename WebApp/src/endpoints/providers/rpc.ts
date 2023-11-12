import {TezosToolkit} from '@taquito/taquito'

const rpcEndpoint = 'https://tezosrpc.midl.dev/ak-lpuoz6fm0tjlm1';

export async function getBlockNumber() {
  try {
    const tezos = new TezosToolkit(rpcEndpoint);

    const block = await tezos.rpc.getBlock();

    if (block && block.header && block.header.level) {
      const blockNumber = block.header.level;
      return blockNumber;
    } else {
      console.error('Block number not found in the response.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
