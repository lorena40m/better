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
import IpfsMedia from "@/components/wallet/IpfsMedia";

export default function SpacingGrid(props) {

  function ipfsToLink(stringIpfs) {
    const ipfsId = stringIpfs.slice(7);
    return (process.env.IPFS_GATEWAY + ipfsId);
  }

  const nfts = props.nfts;
  return (
    <Swiper
      spaceBetween={40}
      slidesPerView={3}
      centeredSlides={false}
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      breakpoints={{
        100 : {
          slidesPerView : 1,
          spaceBetween : 15
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        900: {
          slidesPerView: 3,
          spaceBetween: 15,
        }
      }}
      navigation={false}
      modules={[Autoplay, Navigation]}
      className="Carousel"
    >
      {nfts.map((nft) => {
        if (nft.name && nft.image) {
           return (
            <Link href={nft.id} key={nft.id}>
              <SwiperSlide>
                <Box className="collectionBox" style={{ margin: "20px 0 0 0" }}>
                  <Box className="collectionBox-img">
                    <Image
                      src={ipfsToLink(nft.image)}
                      alt="crypto"
                      style={{
                        objectFit: "cover",
                        borderRadius: "10px"
                      }}
                    />
                    {/*<IpfsMedia src={ipfsToLink(nft.image)} />*/}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h5"
                    className="collectionBox-title"
                    style={{ backgroundColor: "rgba(83, 83, 83, 0.9)", color: "white", borderRadius: "5px", padding: "5px 10px", position: "absolute", width: "calc(100% - 10px)", left: "5px", bottom: "5px" }}
                  >
                    {nft.name}
                  </Typography>
                  {/* <Typography
                    gutterBottom
                    variant="h5"
                    className="collectionBox-subTitle"
                  >
                    Supply: null
                  </Typography> */}
                </Box>
              </SwiperSlide>
            </Link>
          )
        } else {
          return null;
        }
      })}
    </Swiper>
  );
}
