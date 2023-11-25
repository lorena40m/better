import { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/bundle";
import Heart from "@/assets/iconSvg/Heart.svg";
import Link from 'next/link'
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { formatToken } from '../utils/format';

export default function SpacingGrid({ collections }) {
  const { t } = useTranslation("common");
  const {locale} = useRouter();
  const swiperRef = useRef(null);

  // Reset slides when sorting changes
  useEffect(() => {
    swiperRef.current.slideTo(0)
  }, [collections])

  return (
    <Swiper
      onSwiper={(swiper) => swiperRef.current = swiper}
      spaceBetween={40}
      centeredSlides={false}
      loop={false}
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      breakpoints={{
        100 : {
          slidesPerView: 1,
          spaceBetween: 15
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        900: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
        1400: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
      }}
      navigation={false}
      modules={[Autoplay, Navigation]}
      className="mySlider"
    >
      {collections.map((value) => (
        <SwiperSlide key={value.id} className="collectionBox-slide">
          <Link href={'/'+value.id}>
            <Box className="collectionBox"
              style={{ backgroundImage: `url(${value.image})` }}
            >
              {/*<span className="collectionBox-likeBtn">
                <Heart />
              </span>*/}
              <Box className="collectionBox-title-floating">
                <Typography
                  gutterBottom
                  variant="h5"
                  className="collectionBox-title"
                >
                  {value.name}
                </Typography>
                <Typography
                  gutterBottom
                  variant="h5"
                  className="collectionBox-subTitle"
                >
                  {t('collectionSupply', { supply: formatToken(value.supply, 0, locale) })}
                </Typography>
              </Box>
            </Box>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
