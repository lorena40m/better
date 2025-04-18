import { ExtendedCollection } from '@/backend/providers/objkt'
import { formatToken } from '@/utils/format'
import { getCollectionSources } from '@/utils/link'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  item: ExtendedCollection
}

export default function CollectionSlide({ item }: Props) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()

  return (
    <Link href={'/' + item.id}>
      <div
        className="CarouselSlide"
        style={{
          backgroundImage: getCollectionSources(item?.image)
            ?.map(source => `url(${source})`)
            ?.join(','),
        }}
      >
        <div className="CarouselSlide-title-floating">
          {/*<Media src={item?.image?.map(source => `url(${source})`)?.join(',')} />*/}
          <h5 className="CarouselSlide-title">{item.name}</h5>
          <h5 className="CarouselSlide-subTitle">
            {t('collectionSupply', { supply: formatToken(item.supply, 0, locale) })}
          </h5>
        </div>
      </div>
    </Link>
  )
}
