import { formatToken } from '@/utils/format'
import Image from "next/image"
import Link from 'next/link'
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"

export default function CollectionSlide({ item }) {
  const { t } = useTranslation("common")
  const { locale } = useRouter()

  return (
    <Link href={'/' + item.id}>
      <Box className="CarouselSlide"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <Box className="CarouselSlide-title-floating">
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-title"
          >
            {item.name}
          </Typography>
          <Typography
            gutterBottom
            variant="h5"
            className="CarouselSlide-subTitle"
          >
            {t('collectionSupply', { supply: formatToken(item.supply, 0, locale) })}
          </Typography>
        </Box>
      </Box>
    </Link>
  )
}
