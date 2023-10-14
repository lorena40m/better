export default (params: {
  pageSize: number,
}) => {
  return {
    stats : {
      ethPrice: '150000',
      normalFee: '1',
      lastBlockNumber: '1000000000',
      lastBlockDate: '2023-08-01',
    },
    collections: {
      trending: [], // paginated
      top: [], // paginated
    },
    coins: {
      byCap: [], // paginated
      byVolume: [], // paginated
    },
  }
}
