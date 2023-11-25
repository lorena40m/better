import * as React from "react"
import Link from "next/link"
import { Box } from "@mui/material"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { formatPrice } from '../../utils/format'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from "swiper"
// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/bundle"

export default function TokenRanking({ coins, rates }) {
  const { t } =   useTranslation("common")
  const { locale } = useRouter()

  return (
    <>
    {/*<Swiper
      className="TokenRanking-Swiper"
      direction={'vertical'}
      height={300}
      slidesPerView={3}
      spaceBetween={15}
      grid={{ rows: 2 }}
      modules={[Autoplay, Navigation]}
      loop={false}
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      navigation={false}
    >
      <SwiperSlide className="TokenRanking-slide">Slide 1</SwiperSlide>
      <SwiperSlide className="TokenRanking-slide">Slide 2</SwiperSlide>
      <SwiperSlide className="TokenRanking-slide">Slide 3</SwiperSlide>
      <SwiperSlide className="TokenRanking-slide">Slide 4</SwiperSlide>
      <SwiperSlide className="TokenRanking-slide">Slide 5</SwiperSlide>
      <SwiperSlide className="TokenRanking-slide">Slide 6</SwiperSlide>
    </Swiper>*/}
    <Box className="TokenRanking">
      <div className="TokenRanking-container">
        {coins.map((coin, i) => (
          <Link key={coin.id + coin.token_id} href={'/' + coin.id}
            className={"TokenRanking-TokenBox"}
          >
            <div className="TokenRanking-line">
              <div className="TokenRanking-col">
                <img src={coin.logo} alt={coin.ticker} width={64} />
              </div>
              <div className="TokenRanking-col">
                <div className="TokenRanking-names" title={coin.name}>
                  <span className="TokenRanking-name" title={coin.name}>{coin.name}</span>
                  <span className="TokenRanking-ticker">{coin.ticker}</span>
                </div>
                <span className="TokenRanking-price">{formatPrice(coin.lastPrice, locale, rates)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Box>
    </>
  )
}
