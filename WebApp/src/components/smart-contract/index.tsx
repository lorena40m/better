import History from '@/components/History/History'
import OtherInfos from '@/components/smart-contract/OtherInfos'
import { useRates } from '@/hooks/RatesContext'
import { AccountTokens } from '@/pages/api/account-tokens'
import { Info } from '@/pages/api/accounts-info'
import { Contract } from '@/pages/api/contract-infos'
import { fetchAccountInfo, fetchAccountTokens, fetchContractInfos } from '@/utils/apiClient'
import { formatNumber, formatPrice } from '@/utils/format'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AccountIcon } from '../common/ArtifactIcon'
import MainInfos from '../common/MainInfos'
import { Page } from '../common/page'
import { Treasury } from './Treasury'
import { Coin } from './coin'
import { Collection } from './collection'

const Contract = ({ address }) => {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const [tokens, setTokens] = useState({ domains: [], nfts: [], coins: [] } as AccountTokens)
  const [account, setAccount] = useState({
    contractType: 'smart_contract',
    balance: '0',
    metadata: {},
    operationCount: 0,
    id: '0',
    creatorAddress: '',
    creatorDomain: '',
    tokens: [],
    creationDate: '',
    averageFee: 0,
    entrypoints: [],
  } as Contract)
  const [history, setHistory] = useState([])
  const [infos, setInfos] = useState({
    balance: '0',
    operationCount: 0,
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
    fetchContractInfos(address).then(data => {
      setAccount(data)
    })
  }, [address])

  return (
    <Page
      title={
        account.contractType === 'collection'
          ? 'Collection on Tezos'
          : account.contractType === 'coin'
            ? 'Coin on Tezos'
            : 'Contract on Tezos'
      }
    >
      <Head>
        <title>
          {null || 'Contract'} | {t('App.Title')}
        </title>
      </Head>
      {account.contractType === 'collection' ? <Collection infos={account} infos2={infos} /> : null}
      {account.contractType === 'coin' ? (
        <Coin address={address} infos={account} infos2={infos} coinsInfos={coinsInfos} />
      ) : null}
      <div className="pageComponent__center__content">
        <div className="left">
          <MainInfos
            icon={<AccountIcon account={infos.account} />}
            name={infos.account.name}
            address={address}
            var={'Uses'}
            value={formatNumber(account?.operationCount ?? 0, locale)}
            var2={'Average fee'}
            value2={rates && formatPrice((account.averageFee / 10 ** 6) * rates.cryptos.XTZ ?? 0, locale, rates.fiats)}
            var3={'Treasury'}
            value3={
              rates &&
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
            title={null}
          />
          <OtherInfos
            creator={{ domain: account?.creatorDomain || null, address: account?.creatorAddress }}
            date={account?.creationDate}
          />
          <Treasury tokens={tokens} infos={infos} coinsInfos={coinsInfos} />
        </div>
        <div className="right">
          <History address={address} operationCount={account?.operationCount} />
        </div>
      </div>
    </Page>
  )
}

export default Contract
