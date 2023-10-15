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
import Heart from "@/assets/iconSvg/Heart.svg";
import Link from 'next/link'

const carouselData = [
  {
    id: 1,
    image: "/monkey_ape.jpg",
    title: "Monkey Ape",
    description: "19 XTZ",
  },
  {
    id: 2,
    image: "/assets/svg-icons/NFTpic1.svg",
    title: "Moonfall",
    description: "46 XTZ",
  },
  {
    id: 3,
    image: "/assets/svg-icons/NFTpic2.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 4,
    image: "/assets/svg-icons/NFTpic3.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 5,
    image: "/assets/svg-icons/NFTpic4.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 6,
    image: "/assets/svg-icons/NFTpic5.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 7,
    image: "/assets/svg-icons/NFTpic6.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 8,
    image: "/monkey_ape.jpg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
  {
    id: 9,
    image: "/assets/svg-icons/NFTpic2.svg",
    title: "Monkey Sun",
    description: "67 XTZ",
  },
];

export default function SpacingGrid(props) {

  function ipfsToLink(stringIpfs) {
    const baseUrl = "https://ipfs.io/ipfs/";
    const ipfsId = stringIpfs.slice(7);
    return (baseUrl + ipfsId);
  }

  const trendingData = props.trending;
  return (
    // <Box
    //   sx={{
    //     display: "flex",
    //     flexDirection: "row",
    //     gap: 4,
    //     overflowX: "auto",
    //     overflowY: "hidden",
    //     "&::-webkit-scrollbar": { height: 8 },
    //   }}
    // >
    // </Box>
    <Swiper
      spaceBetween={40}
      slidesPerView={5.5}
      centeredSlides={false}
      loop={true}
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      breakpoints={{
        100 : {
          slidesPerView : 2,
          spaceBetween : 15
        },
        640: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
        900: {
          slidesPerView: 6,
          spaceBetween: 15,
        }
      }}
      navigation={false}
      modules={[Autoplay, Navigation]}
      className="mySlider"
    >
      {trendingData.map((value) => (
        <Link href={'/nft?id='+value.id}>
        <SwiperSlide key={value.id}>
          <Box className="collectionBox">
            <Box className="collectionBox-img">
              <Image
                src={ipfsToLink(value.image)}
                alt="crypto"
                width={240}
                height={140}
                style={{
                  height: "240px",
                  objectFit: "cover",
                }}
              />
              <span className="collectionBox-likeBtn">
                {/* <Heart /> */}
              </span>
            </Box>
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
              Supply: <b>{value.supply}</b>
            </Typography>
          </Box>
        </SwiperSlide>
        </Link>
      ))}
    </Swiper>
  );
}
