import SmartContractIcon from '@/assets/iconSvg/smartContractIcon.svg'
import UserIcon from '@/assets/iconSvg/userIcon.svg'
import BakerIcon from '@/assets/images/baker.png'
import DelegatorIcon from '@/assets/images/delegator.png'
import FailureIcon from '@/assets/images/failure.png'
import NftIcon_ from '@/assets/images/nft.png'
import TezosIcon from '@/assets/images/tezos.png'
import { default as AssetIcon, default as TokenIcon } from '@/assets/images/token.png'
import UsersIcon from '@/assets/images/users.png'
import AssetWithPlaceHolder from '@/components/common/AssetWithPlaceHolder'
import { getAssetSources, getCollectionSources } from '@/utils/link'
import { memo } from 'react'

const icons = {
  // accounts
  user: UserIcon,
  userGroup: UsersIcon,
  baker: BakerIcon,
  ghostContract: FailureIcon,
  delegator: DelegatorIcon,
  contract: SmartContractIcon,
  asset: AssetIcon,
  collection: NftIcon_,
  // coins
  token: TokenIcon,
  tezos: TezosIcon,
  // nft
  nft: NftIcon_,
}

const alts = {
  // accounts
  user: 'User',
  userGroup: 'Group of addresses',
  baker: 'Baker',
  ghostContract: 'Invalid target',
  delegator: 'Delegator',
  contract: 'Contract',
  asset: 'Financial Asset',
  collection: 'NFT Collection',
  // coins
  token: 'Token',
  tezos: 'Tezos',
  // nft
  nft: 'NFT',
}

type Account = {
  address: string
  name: string
  image: string | null
  accountType: 'user' | 'baker' | 'ghostContract' | 'delegator' | 'contract' | 'asset' | 'collection' | null // null worth 'userGroup'
}

type Coin = {
  id: string | 'tezos'
  ticker: string
  image: string | null
}

type Nft = {
  id: `${string}_${number}`
  name: string
  image: string
}

export const AccountIcon = memo(
  function AccountIcon({ account, ...attr }: { account: Account | null; [key: string]: any }) {
    if (!account) return

    const sources = [`https://services.tzkt.io/v1/avatars/${account.address}`]

    if (account.image) {
      sources.push(...getCollectionSources(account.image))
    }

    return <ArtifactIcon alt={account.name} type={account?.accountType ?? 'userGroup'} sources={sources} {...attr} />
  },
  (prev, next) => prev.account?.address === next.account?.address,
)

export const CoinIcon = memo(
  function CoinIcon({ coin, ...attr }: { coin: Coin | null; [key: string]: any }) {
    if (!coin) return

    const sources = []

    if (coin.id !== 'tezos') {
      sources.push(`https://services.tzkt.io/v1/avatars/${coin.id}`)
    }

    if (coin.image) {
      sources.push(...getCollectionSources(coin.image))
    }

    return <ArtifactIcon alt={coin.ticker} type={coin.id === 'tezos' ? 'tezos' : 'token'} sources={sources} {...attr} />
  },
  (prev, next) => prev.coin?.id === next.coin?.id,
)

export const NftIcon = memo(
  function NftIcon({ nft, ...attr }: { nft: Nft | null; [key: string]: any }) {
    if (!nft) return

    const sources = getAssetSources(nft.image, nft.id) ?? []

    return <ArtifactIcon alt={nft.name} type="nft" sources={sources} {...attr} />
  },
  (prev, next) => prev.nft?.id === next.nft?.id,
)

type Props = {
  alt: string
  type: keyof typeof icons
  sources: string[]
  [key: string]: any
}

function ArtifactIcon({ alt, type, sources, ...attr }: Props) {
  return (
    <AssetWithPlaceHolder
      sources={sources}
      alt={alt}
      defaultSource={icons[type]}
      defaultAlt={alts[type]}
      className="ArtifactIcon"
      {...attr}
    />
  )
}
