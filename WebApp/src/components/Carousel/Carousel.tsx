import { useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper"
// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/bundle"

export default function Carousel({ items, Slide, breakpoints, delay = 1000, ...attr }) {
  const swiperRef = useRef(null)

  // Reset slides when sorting changes
  useEffect(() => {
    swiperRef.current.slideTo(0)
  }, [items])

  return (
    <Swiper
      className="Carousel"
      onSwiper={swiper => swiperRef.current = swiper}
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
  )
}
