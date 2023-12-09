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
  item: Holding<Nft>,
  rates: any,
}

export default function CollectionSlide({ item, rates }: Props) {
  const { t } = useTranslation("common")
  const { locale } = useRouter()

  return (
    <Link href={'/' + item.asset.collection.id}>
      <Box className="CarouselSlide"
        style={{ backgroundImage: `url(${item.asset.image})` }}
      >
        <Box className="CarouselSlide-title-floating">
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-title"
          >
            {item.asset.name}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-subTitle"
          >
            {t('Carousel.Nft.Collection', { collectionName: `${item.asset.collection.name} # ${item.asset.tokenId}` })}
            <br/>{t('Carousel.Nft.LastSale', { lastSalePrice: formatPrice(item.asset.lastSalePrice, locale, rates) })}
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}
