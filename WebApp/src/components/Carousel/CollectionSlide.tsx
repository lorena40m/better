import Image from "next/image"
import Link from 'next/link'
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { formatToken } from '@/utils/format'
import Media from './Media'
import { ExtendedCollection } from '@/endpoints/API'

type Props = {
  item: ExtendedCollection,
}

export default function CollectionSlide({ item }: Props) {
  const { t } = useTranslation("common")
  const { locale } = useRouter()

  return (
    <Link href={'/' + item.id}>
      <div className="CarouselSlide"
        style={{ backgroundImage: item?.image?.map(source => `url(${source})`)?.join(',') }}
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
