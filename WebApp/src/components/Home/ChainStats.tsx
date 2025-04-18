import tezosLogo from '@/assets/images/tezos_gradient.svg'
import { useRates } from '@/hooks/RatesContext'
import { fetchHomeStats } from '@/utils/apiClient'
import { formatPrice } from '@/utils/format'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ChainStats() {
  const { locale } = useRouter()
  const { t } = useTranslation('common')
  const [seconds, setSeconds] = useState(null)
  const [stats, setStats] = useState(null)
  const rates = useRates()

  useEffect(() => {
    fetchHomeStats().then(stats => {
      setStats(stats)
      setSeconds(Math.floor((+new Date(stats.lastBlockDate) - +new Date()) / 1000))
    })
    let i = setInterval(() => setSeconds(seconds => seconds - 1), 1000)
    return () => clearInterval(i)
  }, [])

  return rates ? (
    <div className="ChainStats">
      <div className="ChainStats-box ChainStats-box--important">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">
              {t('stat1')}
              <b>XTZ</b>
            </div>
            <div className="ChainStats-data">
              <span className="gradientText">{formatPrice(rates?.cryptos.XTZ, locale, rates?.fiats)}</span>
            </div>
          </div>
          <Image priority src={tezosLogo} height={40} width={50} alt="" className="cryptoLogo" />
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">{t('stat2')}</div>
            <div className="ChainStats-data">
              <span className="gradientText">
                {rates &&
                  stats &&
                  formatPrice((+stats.normalFee / 1_000_000) * +rates.cryptos.XTZ, locale, rates.fiats)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title">{t('stat3')}</div>
            <div className="ChainStats-data">
              <span className="gradientText">{seconds && t('inXSeconds', { seconds: 15 + (seconds % 15) })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="ChainStats ChainStats--PlaceHolder">
      <div className="ChainStats-box ChainStats-box--important">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title"></div>
            <div className="ChainStats-data"></div>
          </div>
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title"></div>
            <div className="ChainStats-data"></div>
          </div>
        </div>
      </div>
      <div className="ChainStats-box">
        <div className="ChainStats-inner">
          <div className="ChainStats-content">
            <div className="ChainStats-title"></div>
            <div className="ChainStats-data"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
