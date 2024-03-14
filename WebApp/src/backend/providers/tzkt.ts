import axios from 'axios'

async function fetch(urn: string) {
  try {
    const response = await axios.get('https://api.tzkt.io/' + urn);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch external data. Status code:', response.status);
    }
  } catch (error) {
    console.error(`Error on request '${'https://api.tzkt.io/' + urn}':`, error.toString());
  }

  return null
}

export async function getAlias(address) {
  const account = await fetch(`v1/accounts/${address}`)
  if (account === null) {
    return // there was an error, return undefined
  }
  return (account?.alias ?? null) as string | null // alias can be null if no alias
}

/*
export async function getCoinYearlyTransfersAndVolume(contractHash) {
  const currentDate = new Date()
  const oneYearAgo = new Date(currentDate)
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1)

  // Format the ISO 8601 timestamps for the start and end dates
  const startDateISO = oneYearAgo.toISOString()
  let sum = 0
  let count = 0
  try {
    const response = await fetch(`v1/tokens/transfers?token.contract=${contractHash}&timestamp.gt=${startDateISO}`)

    const transfers = response?.map(transferData => ({
      id : transferData.id,
      balance : transferData.amount
    }))
    const totalAmount = transfers.reduce((sum, transfer) => sum + Number(transfer.balance), 0);
    const count = transfers.length;
    return { sum: totalAmount, count: count };
  } catch (error) {
    console.error('Error:', error);
  }
}
*/
