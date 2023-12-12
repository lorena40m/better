import Image from "next/image"
import Link from 'next/link'
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { Holding, Nft } from "@/endpoints/API"
import { formatPrice } from '@/utils/format'

type Props = {
  item: any,
  rates: any,
}

export default function CollectionSlide({ item, rates }: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  function ipfsToLink(stringIpfs) {
    if (stringIpfs.substring(0, 7) !== "ipfs://") {
      return (stringIpfs);
    }
    const baseUrl = "https://ipfs.io/ipfs/";
    const ipfsId = stringIpfs.slice(7);
    return (baseUrl + ipfsId);
  }

  return (
    <Link href={'/' /* + id du token ou de la collection */}>
      <Box className="CarouselSlide"
        style={{ backgroundImage: `url(${ipfsToLink(item.Metadata.artifactUri)})` }}
      >
        <Box className="CarouselSlide-title-floating">
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-title"
          >
            {item.Metadata.name}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-subTitle"
          >
            {/*t('Carousel.Nft.Collection', { collectionName: `${item.asset.collection.name} # ${item.asset.tokenId}` })*/}
            <br/>{/*t('Carousel.Nft.LastSale', { lastSalePrice: formatPrice(item.asset.lastSalePrice, locale, rates) })*/}
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}
