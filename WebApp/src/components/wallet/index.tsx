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
import { appWithTranslation, useTranslation } from "next-i18next";
import Carousel from "@/components/Carousel/Carousel";
import NftSlide from "@/components/Carousel/NftSlide";
import GeneralInfos from "@/components/common/GeneralInfos";
import { formatPrice, formatNumber, formatToken, formatDate } from "@/utils/format";
import { useRouter } from "next/router";
import axios from "axios";
import MiscellaneousEndpoint from '../../endpoints/MiscellaneousEndpoint';

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



  const fetchAccountTokens = async (address) => {
    try {
      const response = await axios.get(`/api/account-tokens?address=${address}`);
      const domains = [];
      const nfts = [];
      const coins = [];
      const othersTokens = [];
      response.data.map((token) => {
        if (token.Metadata) {
          if (token.Metadata.decimals) {
            if (token.Metadata.decimals === "0") {
              if (token.Metadata.artifactUri) {
                nfts.push(token);
              } else if (token.ContractId === 1262424) {
                domains.push(token);
              } else {
                othersTokens.push(token);
              }
            } else {
              coins.push(token);
            }
          } else {
            othersTokens.push(token);
          }
        } else {
          othersTokens.push(token);
        }
      });
      setTokens({
        domains: domains,
        nfts: nfts,
        coins: coins,
        othersTokens: othersTokens,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  const fetchAccountInfos = async (address) => {
    try {
      const response = await axios.get(`/api/account-infos?address=${address}`);
      setAccount({
        balance: response.data.Balance,
        transactionsCount: response.data.TransactionsCount,
        id: response.data.Id,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  const fetchAccountTransactionsHistory = async (address, limit) => {
    try {
      const response = await axios.get(`/api/account-history?address=${address}&limit=${limit}`);
      setTransactionsHistory(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  const fetchMiscellaneousInfos = async () => {
    try {
      const response = await MiscellaneousEndpoint({});
      setMiscResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  }

  useEffect(() => {
    fetchAccountTokens(address);
    fetchAccountInfos(address);
    fetchAccountTransactionsHistory(address, 10);
    fetchMiscellaneousInfos();
  }, [address]);


  return (
    <main>
      <Header />
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
                  <>
                    <h5 className="operationCard__title">{t("Wallet.Tokens")}</h5>
                    <CoinBox coins={tokens.coins} miscResponse={miscResponse} />
                  </>
                : null
              }
            </Grid>
            <Grid item md={6} paddingLeft={"15px"}>
              <Operations operations={transactionsHistory} accountId={account.id} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;
