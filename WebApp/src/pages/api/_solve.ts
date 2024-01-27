import { ipfsToHttps } from '@/endpoints/providers/utils'

const accountTypes = {
  0: 'user',
  1: 'baker',
  2: 'kt',
  3: 'ghostContract',
} // type
const contractTypes = {
  0: 'delegator',
  1: 'contract',
  2: 'asset',
} // kind

export function solveAccountType(accountType, accountKind) {
  return accountType == 2 ? contractTypes[accountKind] : accountTypes[accountType]
}

export function solveAddressName(domains, domainData, accountMetadata, tokenMetadata) {
  return domains && (domainData.map(d => d?.['openid:name']).find(d => d) ?? domains?.[0]) ||
    accountMetadata?.name || tokenMetadata?.name
}

export function solveAddressName2(domains, accountMetadata, tokenMetadata) {
  domains.sort((a, b) => (b.id - a.id)).sort((a, b) => (b.lastLevel - a.lastLevel));
  return domains && (domains.map(d => d.data?.['openid:name']).find(d => d) ?? domains?.[0].name) ||
    accountMetadata?.name || tokenMetadata?.name
}

export function solveAddressImage(domainData, accountMetadata, tokenMetadata) {
  const gravatarHash = domainData?.map(d => d?.['gravatar:hash'])?.find(d => d)
  return gravatarHash && `https://www.gravatar.com/avatar/${gravatarHash}` ||
    ipfsToHttps(accountMetadata?.imageUri) || ipfsToHttps(tokenMetadata?.imageUri)
}
