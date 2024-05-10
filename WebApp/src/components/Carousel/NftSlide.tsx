import type { Holding, Nft } from '@/pages/api/account-tokens'
import { getAssetSources } from '@/utils/link'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  item: Holding<Nft>
}

export default function CollectionSlide({ item }: Props) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()

  return (
    <Link href={'/' + item?.asset?.id.replace('_', '#')}>
      <div
        className="CarouselSlide"
        style={{
          backgroundImage: getAssetSources(item?.asset?.image, item?.asset?.id)
            ?.map(source => `url(${source})`)
            ?.join(','),
        }}
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
