import Image from "next/image"
import UserIcon from "@/assets/iconSvg/userIcon.svg"
import UsersIcon from "@/assets/images/users.png"
import SmartContractIcon from "@/assets/iconSvg/smartContractIcon.svg"
import FailureIcon from "@/assets/images/failure.png"
import DelegatorIcon from "@/assets/images/delegator.png"
import BakerIcon from "@/assets/images/baker.png"
import AssetIcon from "@/assets/images/token.png"
import TokenIcon from "@/assets/images/token.png"
import TezosIcon from "@/assets/images/tezos.png"
import { useState, useEffect } from 'react'

const icons = {
  // accounts
  user: UserIcon,
  userGroup: UsersIcon,
  baker: BakerIcon,
  ghostContract: FailureIcon,
  delegator: DelegatorIcon,
  contract: SmartContractIcon,
  asset: AssetIcon,
  // coins
  token: TokenIcon,
  tezos: TezosIcon,
}

const alts = {
  // accounts
  user: "User",
  userGroup: "Group of addresses",
  baker: "Baker",
  ghostContract: "Invalid target",
  delegator: "Delegator",
  contract: "Contract",
  asset: "Financial Asset",
  // coins
  token: "Token",
  tezos: "Tezos",
}

type Account = {
  address: string,
  name: string,
  image: string | null,
  accountType: keyof typeof icons | null, // null worth 'userGroup'
}

type Coin = {
  id: string | 'tezos',
  ticker: string,
  image: string | null,
}

type Artifact = {
  id: string,
  alt: string,
  image: string | null,
  type: keyof typeof icons,
}

export function AccountIcon(props: { account: Account }) {
  return <ArtifactIcon artifact={{
    id: props.account.address,
    alt: props.account.name,
    image: props.account.image,
    type: props.account?.accountType ?? 'userGroup',
  }} />
}

export function CoinIcon(props: { coin: Coin }) {
  return <ArtifactIcon artifact={{
    id: props.coin.id,
    alt: props.coin.ticker,
    image: props.coin.image,
    type: props.coin.id === 'tezos' ? 'tezos' : 'token',
  }} />
}

export default function ArtifactIcon({ artifact }: { artifact: Artifact }) {
  const tzktCache = `https://services.tzkt.io/v1/avatars/${artifact.id}`
  const [useTzktCache, setUseTzktCache] = useState(false)
  const [useImage, setUseImage] = useState(false)

  useEffect(() => {
    fetch(tzktCache, { method: 'HEAD' })
      // if it has header last-modified, it means it's a cached, not-generated image
      .then(response => setUseTzktCache(response.headers.has('last-modified')))

    if (artifact.image)
      fetch(artifact.image, { method: 'HEAD' })
        .then(response => setUseImage(response.ok))
        .catch(err => console.warn(`Failed to fetch image '${artifact.image}' of ${artifact.alt}: ${err}`))
  }, [artifact])

  return useTzktCache ? <img className="ArtifactIcon" src={tzktCache} alt={artifact.alt} /> :
    useImage ? <img className="ArtifactIcon" src={artifact.image} alt={artifact.alt} /> :
    <Image className="ArtifactIcon" src={icons[artifact.type]} alt={alts[artifact.type]} />
}
