import { ipfsToHttps } from '@/endpoints/providers/utils'

export function solveAddressName(domains, domainData, accountMetadata, tokenMetadata) {
  return domains && (domainData.map(d => d?.['openid:name']).find(d => d) ?? domains?.[0]) ||
    accountMetadata?.name || tokenMetadata?.name
}

export function solveAddressImage(domainData, accountMetadata, tokenMetadata) {
  const gravatarHash = domainData?.map(d => d?.['gravatar:hash'])?.find(d => d)
  return gravatarHash && `https://www.gravatar.com/avatar/${gravatarHash}` ||
    ipfsToHttps(accountMetadata?.imageUri) || ipfsToHttps(tokenMetadata?.imageUri)
}
