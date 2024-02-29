const RATE_USD_TO_EUR = 0.95

import { useState, useEffect } from 'react'
import Image from "next/image";
import Header from "@/components/Header";
import {
  Grid,
  Button,
  Typography,
  Divider,
  Box,
  Container,
  Stack,
  FormControl,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import Select from "@/components/common/Select";
import TokenRanking from "@/components/Home/TokenRanking";
import Carousel from "@/components/Carousel/Carousel";
import CollectionSlide from "@/components/Carousel/CollectionSlide";
import HeadCrumb from "@/components/Header/HeadCrumb";
import searchIcon from "@/assets/iconSvg/searchIcon.svg";
import TypingEffect from "@/components/others/typingEffect";
import Background from "@/components/others/background";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { HomeResponse } from '@/endpoints/API';
import HomeEndpoint from '@/endpoints/HomeEndpoint';
import { formatPrice, formatToken } from '@/utils/format';
import useWindowSize from '@/hooks/useWindowSize';
import ChainStats from '@/components/Home/ChainStats';
import Head from 'next/head';
import { SearchInput } from '@/components/common/SearchInput';

export async function getServerSideProps({ locale }: any) {
  const startTime2 = performance.now()
  const homeResponse = await HomeEndpoint({ pageSize: 10 })
  const endTime2 = performance.now()
  console.log(`HomeEndpoint exécuté en ${endTime2 - startTime2} ms`)

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      homeResponse,
      iniSeconds: Math.floor((+(new Date(homeResponse.stats.lastBlockDate)) - +(new Date())) / 1000),
    },
  };
}

export default function Home({ homeResponse, iniSeconds, _nextI18Next }:
  { homeResponse: HomeResponse, iniSeconds: number, _nextI18Next: any }
) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const router = useRouter();
  const windowWidth = useWindowSize().width;
  const [collectionCriteria, setCollectionCriteria] = useState('trending');
  const [tokenCriteria, setTokenCriteria] = useState('byCap');

  useEffect(() => {
    console.log({ homeResponse })
  }, [homeResponse])

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const searchValue = event.target.querySelector('input').value;
    router.push(`/${encodeURIComponent(searchValue)}`);
  };

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
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              {t("animTitle")} <span className="displayIfSmall"><br /></span>
              <TypingEffect strings={_nextI18Next.initialI18nStore[locale].common.anim} /> <br />
              {t("animTitle2")}
            </Typography>
            <form onSubmit={handleSearchSubmit} className="searchBlock-form">
              <TextField
                hiddenLabel
                id="filled-hidden-label-small mainSearchField"
                defaultValue=""
                placeholder={t("inputPlaceholder")}
                fullWidth
                sx={{ ml: 0 }}
              ></TextField>
              <span className="scanIcon">{/* <ScanIcon /> */}</span>
              <Button
                type="submit"
                variant="contained"
                className="mainSearchButton"
              >
                <Image src={searchIcon} width={40} alt="Research icon" style={{zIndex: "1"}} />
              </Button>
            </form>
            <ChainStats homeResponse={homeResponse} iniSeconds={iniSeconds} />
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
            <Carousel Slide={CollectionSlide} items={homeResponse.collections[collectionCriteria]}
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
            <TokenRanking coins={homeResponse.coins.byCap} />
          </Container>
        </Box>
      </main>
    </>
  );
}
