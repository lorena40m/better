import Image from "next/image"
import Link from 'next/link'
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { formatPrice } from '@/utils/format'
import { Holding, Nft } from '@/pages/api/account-tokens'

type Props = {
  item: Holding<Nft>,
}

export default function CollectionSlide({ item }: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <Link href={'/' + item.Address}>
      <div className="CarouselSlide"
        style={{ backgroundImage: item?.asset?.image?.map(source => `url(${source})`)?.join(',') }}
      >
        <div className="CarouselSlide-title-floating">
          <h5 className="CarouselSlide-title">{item.asset.name}</h5>
          <h5 className="CarouselSlide-subTitle">
            {t('Carousel.Nft.Collection', { collectionName: `${item.asset.collection.name} # ${item.TokenId}` })}
            {/*<br/>{t('Carousel.Nft.lastPrice', { lastPrice: formatPrice(item.asset.lastPrice, locale, rates) })}*/}
          </h5>
        </div>
      </div>
    </Link>
  )
}
