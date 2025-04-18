import Carousel from '@/components/Carousel/Carousel'
import NftSlide from '@/components/Carousel/NftSlide'
import History from '@/components/History/History'
import { AccountIcon } from '@/components/common/ArtifactIcon'
import MainInfos from '@/components/common/MainInfos'
import CoinBox from '@/components/wallet/CoinBox'
import { useRates } from '@/hooks/RatesContext'
import { AccountTokens } from '@/pages/api/account-tokens'
import type { Info } from '@/pages/api/accounts-info'
import { fetchAccountInfo, fetchAccountTokens } from '@/utils/apiClient'
import { formatInteger, formatPrice } from '@/utils/format'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Page } from '../common/page'

type Props = {
  address: string
}

const Wallet = ({ address }: Props) => {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const [tokens, setTokens] = useState({ domains: [], nfts: [], coins: [] } as AccountTokens)
  const [infos, setInfos] = useState({
    balance: null,
    operationCount: null,
    account: {
      address,
      name: null,
      image: null,
      accountType: 'user',
    },
  } as Info)
  const [coinsInfos, setCoinsInfos] = useState(null)
  const rates = useRates()

  useEffect(() => {
    fetchAccountTokens(address).then(setTokens)
    fetchAccountInfo(address).then(setInfos)
    fetch('/api/coins-infos')
      .then(response => response.json())
      .then(data => setCoinsInfos(data))
      .catch(error => console.error('Error fetching data:', error))
  }, [address])

  const name = infos.account.name ?? t('AccountDefaultName.user')

  const coins = (
    parseInt(infos?.balance) > 0
      ? [
          {
            TokenId: null,
            ContractId: null,
            Address: 'tezos',
            asset: {
              id: 'tezos',
              image: null,
              name: 'Tezos',
              ticker: 'XTZ',
              decimals: 6,
              assetType: 'coin' as 'coin',
            },
            quantity: infos.balance.toString(),
          },
        ]
      : []
  ).concat(tokens?.coins ?? [])

  return (
    <Page title="Wallet on Tezos">
      <Head>
        <title>
          {name} | {t('App.Title')}
        </title>
      </Head>
      <div className="pageComponent__center__content">
        <div className="left">
          <MainInfos
            icon={<AccountIcon account={infos.account} />}
            name={name}
            address={address}
            var={t('Wallet.TotalValue')}
            value={
              rates &&
              infos?.balance &&
              tokens?.coins &&
              formatPrice(
                (+infos.balance / 10 ** 6) * rates.cryptos.XTZ +
                  tokens.coins.reduce(
                    (total, coin) =>
                      total +
                      (coinsInfos?.find(coinInfos => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) *
                        (+coin.quantity / 10 ** coin.asset.decimals),
                    0,
                  ),
                locale,
                rates.fiats,
              )
            }
            var2={null}
            value2={null}
            var3={null}
            value3={null}
            title={null}
          />
          <div className="WalletNfts boxWithoutBorder">
            <div className="header">
              <h3>{t('Wallet.Nfts')}</h3>
              {tokens?.nfts && (
                <span className="headerInfo">
                  {formatInteger(tokens?.nfts.length, locale)} {t('Nfts.NftFound')}
                </span>
              )}
            </div>
            <Carousel
              Slide={NftSlide}
              items={tokens?.nfts}
              breakpoints={{
                100: { slidesPerView: 1 },
                640: { slidesPerView: 1 },
                900: { slidesPerView: 2 },
                1400: { slidesPerView: 2 },
              }}
              delay={4000}
            />
          </div>
          {coins.length && <CoinBox coins={coins} coinsInfos={coinsInfos} />}
        </div>
        <div className="right">
          <History address={address} operationCount={infos?.operationCount} />
        </div>
      </div>
    </Page>
  )
}

export default Wallet
