import * as React from "react";
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
import Heart from "@/assets/iconSvg/Heart";
import { Card } from "@mui/material";

const carouselData = [
  {
    id: 1,
    image: "/monkey_ape.jpg",
    title: "Monkey Ape",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 2,
    image: "/assets/svg-icons/NFTpic1.svg",
    title: "Moonfall",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 3,
    image: "/assets/svg-icons/NFTpic2.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 4,
    image: "/assets/svg-icons/NFTpic3.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 5,
    image: "/assets/svg-icons/NFTpic4.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 6,
    image: "/assets/svg-icons/NFTpic5.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 7,
    image: "/assets/svg-icons/NFTpic6.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 8,
    image: "/monkey_ape.jpg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
  {
    id: 9,
    image: "/assets/svg-icons/NFTpic2.svg",
    title: "Monkey Sun",
    by: "lil monkey",
    floor: { title: "FLOOR", value: "11 MATIC" },
    value: { title: "PRIX DACHAT", value: "0.19 ETH" },
  },
];

export default function NftView() {
  return (
    <Box className="NftSlider">
      <Typography variant="h4" className="NftSlider__title">
        NFT
      </Typography>
      <Swiper
        spaceBetween={15}
        slidesPerView={2.8}
        centeredSlides={false}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        modules={[Autoplay, Navigation]}
        className="mySlider"
        breakpoints={{
          300 : {
            slidesPerView : 2,
            spaceBetween : 15
          },
          640: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
          900: {
            slidesPerView: 3,
            spaceBetween: 15,
          }
        }}
      >
        {carouselData.map((value) => (
          <SwiperSlide key={value.id}>
            <Card>
              <Box className="collectionBox">
                <Box className="collectionBox-img">
                  <Image
                    src={value.image}
                    alt="crypto"
                    width={240}
                    height={140}
                    style={{
                      height: "240px",
                      objectFit: "cover",
                    }}
                  />
                  <span className="collectionBox-likeBtn">
                    <Heart />
                  </span>
                </Box>
                <Box sx={{ p: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    className="collectionBox-title"
                  >
                    {value.title}
                  </Typography>
                  <Typography
                    gutterBottom
                    variant="h5"
                    className="collectionBox-subTitle"
                  >
                    by <b>{value.by}</b>
                  </Typography>
                  <Grid container>
                    <Grid xs={6}>
                      <Typography
                        className="collectionBox-label"
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        {value.floor.title}
                      </Typography>
                      <Typography
                        className="collectionBox-discription"
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        {value.floor.value}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography
                        className="collectionBox-label"
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        {value.value.title}
                      </Typography>
                      <Typography
                        className="collectionBox-discription"
                        variant="caption"
                        display="block"
                        gutterBottom
                      >
                        {value.value.value}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
