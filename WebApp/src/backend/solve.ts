// Utils

// "Account"."Type"
const accountTypes = {
  0: 'user',
  1: 'baker',
  2: 'kt',
  3: 'ghostContract',
}
// "Account"."Kind"
const contractTypes = {
  0: 'delegator',
  1: 'contract',
  2: 'asset',
}

export type Metadata = Record<string, string>
export type Domain = { id: number, lastLevel: number, name: string, data: Metadata }
function findDomainsMetadata(domains: Array<Domain>, key: string) {
  return domains?.map(d => d.data?.[key])?.find(d => d)
}

// Functions

export function solveAccountType(accountType, accountKind) {
  return accountType == 2 ? contractTypes[accountKind] : accountTypes[accountType]
}

export function solveAddressName(domains: Array<Domain>, accountMetadata: Metadata, tokenMetadata: Metadata) {
  domains?.sort((a, b) => (a.name.length - b.name.length) || (b.id - a.id) || (b.lastLevel - a.lastLevel) || (b < a ? 1 : -1))
  return (
    accountMetadata?.name ||
    findDomainsMetadata(domains, 'openid:name') ||
    domains?.[0].name ||
    tokenMetadata?.name
  )
}

export function solveAddressImage(
  domains: Array<Domain>,
  accountMetadata: Metadata,
  tokenMetadata: Metadata
) {
  const gravatarHash = findDomainsMetadata(domains, 'gravatar:hash')
  return gravatarHash && `https://www.gravatar.com/avatar/${gravatarHash}` ||
    accountMetadata?.imageUri || tokenMetadata?.imageUri
}
