import useWindowSize from '@/hooks/useWindowSize'
import { useEffect, useRef } from 'react'
import { Autoplay, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function Carousel({ items, Slide, breakpoints, delay = 1000, ...attr }) {
  const swiperRef = useRef(null)
  const windowWidth = useWindowSize().width
  const numberOfSlides = Object.entries<any>(breakpoints).reduce(
    (maxBreakpoint, currentBreakpoint) => {
      return +currentBreakpoint[0] <= windowWidth && +currentBreakpoint[0] > +maxBreakpoint[0]
        ? currentBreakpoint
        : maxBreakpoint
    },
    ['0'],
  )[1]?.slidesPerView

  // Reset slides when sorting changes
  useEffect(() => {
    if (false) swiperRef.current.slideTo(0)
  }, [items])

  return items ? (
    <Swiper
      className="Carousel"
      onSwiper={swiper => (swiperRef.current = swiper)}
      spaceBetween={15}
      centeredSlides={false}
      loop={false}
      navigation={false}
      modules={[Autoplay, Navigation]}
      autoplay={{
        delay,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      breakpoints={breakpoints}
      {...attr}
    >
      {items.map(item => (
        <SwiperSlide key={item.id}>
          <Slide item={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  ) : (
    <div className="Carousel--PlaceHolder">
      {new Array(numberOfSlides).fill(null).map((_, i) => (
        <div className="CarouselSlide blink" key={i}>
          <div className="CarouselSlide-title-floating">
            <h5 className="CarouselSlide-title"></h5>
            <h5 className="CarouselSlide-subTitle"></h5>
          </div>
        </div>
      ))}
    </div>
  )
}
