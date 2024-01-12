import Image from "next/image"
import UserIcon from "@/assets/iconSvg/userIcon.svg"
import SmartContractIcon from "@/assets/iconSvg/smartContractIcon.svg"
import TokenIcon from "@/assets/images/token.png"
import TezosIcon from "@/assets/images/tezos.png"

const accountIcons = {
  user: UserIcon,
  userGroup: UserIcon,
  baker: SmartContractIcon,
  ghostContract: SmartContractIcon,
  delegator: SmartContractIcon,
  contract: SmartContractIcon,
  asset: SmartContractIcon,
}

const accountAlts = {
  user: "User",
  userGroup: "Group of addresses",
  baker: "Baker",
  ghostContract: "Invalid target",
  delegator: "Delegator",
  contract: "Contract",
  asset: "Financial Asset",
}

type Account = {
  accountType: keyof typeof accountIcons | null, // null worth 'userGroup'
  name: string,
  image: string | null,
}

export function accountIcon(account: Account) {
  return account.image ? <img className="accountIcon" src={account.image} alt={account.name} /> :
    <Image className="accountIcon" src={accountIcons[account?.accountType ?? 'userGroup']} alt={accountAlts[account?.accountType ?? 'userGroup']} />
}

type Coin = {
  id: string,
  ticker: string,
  image: string | null,
}

export function coinIcon(coin: Coin) {
  return coin.id === 'tezos' ? <Image className="coinIcon" src={TezosIcon} alt="XTZ" /> :
    coin.image ? <img className="coinIcon" src={coin.image} alt={coin.ticker} /> :
    <Image className="coinIcon" src={TokenIcon} alt="token" />
}
