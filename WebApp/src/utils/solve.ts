export function solveAddressName(domains, domainData) {
  return domains && (domainData.map(d => d?.['openid:name']).find(d => d) ?? domains?.[0])
}

export function solveAddressImage(domainData) {
  const gravatarHash = domainData?.map(d => d?.['gravatar:hash'])?.find(d => d)
  return gravatarHash && `https://www.gravatar.com/avatar/${gravatarHash}`
}
