import {TezosToolkit} from '@taquito/taquito'

export async function getBlockNumber() {
  try {
    const tezos = new TezosToolkit(process.env.RPC_ENDPOINT);

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
