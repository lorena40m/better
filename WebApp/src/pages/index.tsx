import searchIcon from '@/assets/iconSvg/searchIcon.svg'
import Carousel from '@/components/Carousel/Carousel'
import CollectionSlide from '@/components/Carousel/CollectionSlide'
import Header from '@/components/Header'
import ChainStats from '@/components/Home/ChainStats'
import TokenRanking from '@/components/Home/TokenRanking'
import Select from '@/components/common/Select'
import TypingEffect from '@/components/others/typingEffect'
import { fetchHomeCoins, fetchHomeCollections } from '@/utils/apiClient'
import { Box, Button, Container, TextField, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSearch from '@/hooks/useSearch'

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default function Home({ _nextI18Next }) {
  const { t } = useTranslation('common')
  const { locale } = useRouter()
  const router = useRouter()
  const [collectionCriteria, setCollectionCriteria] = useState('trending')
  const [tokenCriteria, setTokenCriteria] = useState('byCap')
  const [collections, setCollections] = useState(null)
  const [coins, setCoins] = useState(null)
  const { search, setSearch, animError, searchEvent } = useSearch()

  useEffect(() => {
    fetchHomeCollections().then(setCollections)
    fetchHomeCoins().then(setCoins)
  }, [])

  // const handleSearchSubmit = event => {
  //   event.preventDefault()
  //   const searchValue = event.target.querySelector('input').value
  //   router.push(`/${encodeURIComponent(searchValue)}`)
  // }

  return (
    <>
      <Head>
        <title>{t('App.Title')}</title>
      </Head>
      <main>
        {/*<HeadCrumb /> Temporarely disabled*/}
        <Header hideSearch={false} />
        <Box className="searchBlock">
          <Container maxWidth="xl">
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              {t('animTitle')}{' '}
              <span className="displayIfSmall">
                <br />
              </span>
              <TypingEffect strings={_nextI18Next.initialI18nStore[locale].common.anim} /> <br />
              {t('animTitle2')}
            </Typography>
            {/* <form className="searchBlock-form"> */}
            <div className="searchBlock-form">
              <TextField
                hiddenLabel
                id="filled-hidden-label-small mainSearchField"
                defaultValue=""
                placeholder={t('inputPlaceholder')}
                fullWidth
                onChange={e => setSearch(e.target.value)}
                value={search}
                onKeyDown={e => {
                  e.key === 'Enter' ? searchEvent() : null;
                }}
                sx={{ ml: 0 }}
              ></TextField>
              <span className="scanIcon">{/* <ScanIcon /> */}</span>
              <Button onClick={searchEvent}  variant="contained" className="mainSearchButton">
                <Image src={searchIcon} width={40} alt="Research icon" style={{ zIndex: '1' }} />
              </Button>
            </div>
            {/* </form> */}
            <ChainStats />
          </Container>
        </Box>

        <Box className="sliderBlock">
          <Container maxWidth="xl">
            <Box className="sectionHead">
              <Box className="sectionHead-title">{t('sectionTitleCollections')}</Box>
              <Select
                onChange={setCollectionCriteria}
                values={['trending', 'top']}
                labels={[t('criteriaTrending'), t('criteriaTop')]}
                defaultValue="trending"
              />
            </Box>
            <Carousel
              Slide={CollectionSlide}
              items={collections?.[collectionCriteria]}
              breakpoints={{
                100: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                900: { slidesPerView: 3 },
                1400: { slidesPerView: 4 },
              }}
            />
          </Container>
        </Box>
        <Box className="listTableBlock">
          <Container maxWidth="xl">
            <Box className="sectionHead">
              <Box className="sectionHead-title">{t('sectionTitleTokens')}</Box>
            </Box>
            <TokenRanking coins={coins?.byCap} />
          </Container>
        </Box>
      </main>
    </>
  )
}
