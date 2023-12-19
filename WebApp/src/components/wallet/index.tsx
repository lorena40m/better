import React, { useEffect, useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import NftView from "@/components/wallet/NftView";
import CoinBox from "@/components/wallet/CoinBox";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";
import Image from "next/image";
import Operations from "@/components/common/Operations";
import { useTranslation } from "next-i18next";
import Carousel from "@/components/Carousel/Carousel";
import NftSlide from "@/components/Carousel/NftSlide";
import GeneralInfos from "@/components/common/GeneralInfos";
import { formatPrice, formatNumber, formatToken, formatDate } from "@/utils/format";
import { useRouter } from "next/router";
import MiscellaneousEndpoint from '../../endpoints/MiscellaneousEndpoint';
import Head from "next/head";
import { fetchAccountInfos, fetchAccountTokens, fetchAccountTransactionsHistory } from '@/utils/apiClient';

type Props = {
  address: string,
}

const Wallet = ({ address }: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const [open, setOpen] = useState<Boolean>(false);
  const [tokens, setTokens] = useState({domains: [], nfts: [], coins: [], othersTokens: []});
  const [account, setAccount] = useState({balance: 0, transactionsCount: 0, id: 0});
  const [transactionsHistory, setTransactionsHistory] = useState([]);
  const [miscResponse, setMiscResponse] = useState({rates: {"EUR/USD": 0}, xtzPrice: 0});

  const fetchMiscellaneousInfos = async () => {
    try {
      const response = await MiscellaneousEndpoint({});
      setMiscResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  }

  useEffect(() => {
    fetchAccountTokens(address).then((data) => {
      setTokens(data);
    });
    fetchAccountInfos(address).then((data) => {
      setAccount(data);
    });
    fetchAccountTransactionsHistory(address, 10).then((data) => {
      setTransactionsHistory(data);
    });
    fetchMiscellaneousInfos();
  }, [address]);


  return (
    <main>
      <Head>
        <title>{tokens.domains[0]?.Metadata?.name} | BetterScan</title>
      </Head>
      <Header hideSearch={true} />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("WalletPage.Title")}
              <span className="pageTemplate__status">
                <Image src={TezosIcon} alt="" height={40} width={40} onClick={() => {console.log({account: account, tokens: tokens, transactionsHistory: transactionsHistory})}}/>
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="walletProfile" container>
            <Grid item md={6} paddingRight={"15px"}>
              <GeneralInfos
                title={tokens.domains[0]?.Metadata?.name}
                address={address}
                var1="Total value"
                value1={/*formatPrice(ArtifactResponse.wallet.totalValue, locale, miscResponse.rates)*/0}
                var2="Operations"
                value2={/*formatNumber(ArtifactResponse.wallet.operationCount, locale)*/account?.transactionsCount}
                var3="Balance"
                value3={`${formatToken(account.balance.toString(), 6, locale)} XTZ`}
              />
              {/*{tokens.nfts[0] ? <h5 className="operationCard__title">{t("Wallet.Nfts")}</h5> : null}
              <Carousel Slide={NftSlide} items={tokens.nfts} breakpoints={{
                100: { slidesPerView: 1 },
                640: { slidesPerView: 1 },
                900: { slidesPerView: 2 },
                1400: { slidesPerView: 2 },
              }} delay={4000} rates={miscResponse.rates} />*/}
              {
                tokens.coins[0] ?
                    <CoinBox coins={tokens.coins} miscResponse={miscResponse} />
                : null
              }
            </Grid>
            <Grid item md={6} paddingLeft={"15px"}>
              <Operations operations={transactionsHistory} address={address} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;
