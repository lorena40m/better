// Utils

export const accountTypes = {
  0: 'user',
  1: 'baker',
  2: 'kt',
  3: 'ghostContract',
} as const

export const contractTypes = {
  0: 'delegator',
  1: 'contract',
  2: 'asset',
} as const

export type Metadata = Record<string, string>
export type Domain = {
  id: number
  lastLevel: number
  name: string
  data: Metadata
}

export function findDomainsMetadata(domains: Domain[], key: string): string | undefined {
  return domains?.map(d => d.data?.[key]).find(Boolean)
}

// Functions

export function solveAccountType(accountType: number, accountKind: number): string | undefined {
  if (accountType === 2) {
    return contractTypes[accountKind]
  }
  return accountTypes[accountType]
}

export function solveAddressName(
  domains: Domain[],
  accountMetadata: Metadata,
  tokenMetadata: Metadata,
): string | undefined {
  const sortedDomains = [...domains].sort(
    (a, b) =>
      a.name.length - b.name.length ||
      b.id - a.id ||
      b.lastLevel - a.lastLevel ||
      (a.name > b.name ? 1 : -1),
  )

  return (
    accountMetadata?.name ||
    findDomainsMetadata(sortedDomains, 'openid:name') ||
    sortedDomains[0]?.name ||
    tokenMetadata?.name
  )
}

export function solveAddressImage(
  domains: Domain[],
  accountMetadata: Metadata,
  tokenMetadata: Metadata,
): string | undefined {
  const gravatarHash = findDomainsMetadata(domains, 'gravatar:hash')
  if (gravatarHash) {
    return `https://www.gravatar.com/avatar/${gravatarHash}`
  }
  return accountMetadata?.imageUri || tokenMetadata?.imageUri
}
