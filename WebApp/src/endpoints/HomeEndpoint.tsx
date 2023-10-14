export default (params: {
  pageSize: number,
}) => {
  return {
    stats : {
      ethPrice: get_xtz_price(),
      normalFee: get_fee(),
      lastBlockNumber: getBlockNumber(),
      lastBlockDate: getBlockDate(),
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
