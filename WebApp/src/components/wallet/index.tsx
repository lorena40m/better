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
import Head from "next/head";
import { fetchAccountInfos, fetchAccountTokens, fetchAccountHistory } from '@/utils/apiClient';
import fetchCoinsInfos from '@/pages/api/coins-infos';

type Props = {
  address: string,
  miscResponse: {rates: {"EUR/USD": 0}, xtzPrice: 0},
}

const Wallet = ({ address, miscResponse }: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const [open, setOpen] = useState<Boolean>(false);
  const [tokens, setTokens] = useState({domains: [], nfts: [], coins: [], othersTokens: []});
  const [account, setAccount] = useState({balance: 0, transactionsCount: 0, id: 0});
  const [history, setHistory] = useState([]);
  const [coinsInfos, setCoinsInfos] = useState(null);

  useEffect(() => {
    fetchAccountTokens(address).then((data) => {
      setTokens(data);
    });
    fetchAccountInfos(address).then((data) => {
      setAccount(data);
    });
    fetchAccountHistory(address, 10).then(setHistory);
    fetch('/api/coins-infos')
      .then(response => response.json())
      .then(data => setCoinsInfos(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [address]);


  return (
    <main>
      <Head>
        <title>{tokens.domains[0]?.Metadata?.name || 'User'} | BetterScan</title>
      </Head>
      <Header hideSearch={true} />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("WalletPage.Title")}
              <span className="pageTemplate__status">
                <Image src={TezosIcon} alt="" height={40} width={40} onClick={() => {console.log({account: account, tokens: tokens, history: history, coinsInfos: coinsInfos, miscResponse: miscResponse})}}/>
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
                value1={
                  (account.balance / 10**6 * miscResponse?.xtzPrice ?? 0) + 
                  tokens.coins.reduce(
                    (total, coin) => total + ((coinsInfos?.find((coinInfos) => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) * coin.quantity / 10**coin.asset.decimals),
                    0
                  )}
                var2="Operations"
                value2={formatNumber(account?.transactionsCount, locale)}
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
                tokens.coins[0] && coinsInfos ?
                  <CoinBox coins={tokens.coins} coinsInfos={coinsInfos} />
                : null
              }
            </Grid>
            <Grid item md={6} paddingLeft={"15px"}>
              <Operations history={history} address={address} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;
