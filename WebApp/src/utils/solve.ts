export function solveAddressName(domains, domainData) {
  return domains && (domainData.find(d => d)?.['openid:name'] ?? domains?.[0])
}
