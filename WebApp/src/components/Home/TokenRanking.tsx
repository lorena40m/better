import { useRates } from '@/hooks/RatesContext'
import { Box } from '@mui/material'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Autoplay, Mousewheel, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { formatPrice } from '../../utils/format'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function TokenRanking({ coins }) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const rates = useRates()

  return coins && rates ? (
    <Box className="TokenRanking">
      <div className="TokenRanking-container" style={{ height: '360px' }}>
        <Swiper
          direction="vertical"
          height={120}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, Navigation, Mousewheel]}
          mousewheel={true}
          loopedSlides={3}
        >
          {coins.map(
            (coin, i) =>
              i % 4 === 0 && (
                <SwiperSlide key={i}>
                  <div className="TokenRanking-group">
                    {coins.slice(i, i + 4).map((coin, j) => (
                      <Link key={coin.id} href={'/' + coin.contractId} className={'TokenRanking-TokenBox'}>
                        <div className="TokenRanking-line">
                          <div className="TokenRanking-col">
                            <img src={coin.logo} alt={coin.ticker} width={64} />
                          </div>
                          <div className="TokenRanking-col">
                            <div className="TokenRanking-names" title={coin.name}>
                              <span className="TokenRanking-name" title={coin.name}>
                                {coin.name}
                              </span>
                              <span className="TokenRanking-ticker">{coin.ticker}</span>
                            </div>
                            <span className="TokenRanking-price">
                              {formatPrice(coin.lastPrice, locale, rates?.fiats)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SwiperSlide>
              ),
          )}
        </Swiper>
      </div>
    </Box>
  ) : (
    <div className="RoundedPlaceHolder" style={{ minHeight: '50vh' }} />
  )
}
