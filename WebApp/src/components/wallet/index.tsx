import React, { useEffect, useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import NftView from "@/components/wallet/NftView";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";
import Image from "next/image";
import Operations from "@/components/common/Operations";
import { appWithTranslation, useTranslation } from "next-i18next";
import Carousel from "@/components/Carousel/Carousel";
import NftSlide from "@/components/Carousel/NftSlide";
import { WalletResponse, MiscellaneousResponse } from "@/endpoints/API";
import GeneralInfos from "@/components/common/GeneralInfos";
import { formatPrice, formatNumber, formatToken, formatDate } from "@/utils/format";
import { useRouter } from "next/router";
import axios from "axios";

type Props = {
  ArtifactResponse: WalletResponse,
  miscResponse: MiscellaneousResponse,
}

async function fetchAccountData(address) {
  try {
    const response = await axios.get(`/api/user?address=${address}&historyLimit=${5}`);
    const domains = [];
    const nfts = [];
    const coins = [];
    const othersTokens = [];
    response.data.tokens.map((token) => {
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
    console.log ({
      address: response.data.user.Address,
      balance: response.data.user.Balance,
      operationsCount: response.data.user.TransactionsCount,
      operationsHistory: response.data.user.history,
      domains: domains,
      nfts: nfts,
      coins: coins,
      othersTokens: othersTokens,
    });
    return ({
      address: response.data.user.Address,
      balance: response.data.user.Balance,
      operationsCount: response.data.user.TransactionsCount,
      operationsHistory: response.data.user.history,
      domains: domains,
      nfts: nfts,
      coins: coins,
      othersTokens: othersTokens,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
  }
}

const Wallet = ({ ArtifactResponse, miscResponse }: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  useEffect(() => {
    fetchAccountData(ArtifactResponse.wallet.id);
  }, []);

  const [open, setOpen] = useState<Boolean>(false);
  return (
    <main>
      <Header />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("WalletPage.Title")}
              <span className="pageTemplate__status">
                <Image src={TezosIcon} alt="" height={40} width={40} />
                  Tezos
              </span>
            </Typography>
          </div>
          <Grid className="walletProfile" container>
            <Grid item md={6} paddingRight={"15px"}>
              <GeneralInfos
                title={ArtifactResponse.wallet.name}
                address={ArtifactResponse.wallet.id}
                var1="Total value"
                value1={formatPrice(ArtifactResponse.wallet.totalValue, locale, miscResponse.rates)}
                var2="Operations"
                value2={formatNumber(ArtifactResponse.wallet.operationCount, locale)}
                var3="Balance"
                value3={`${formatToken(ArtifactResponse.wallet.nativeBalance, 6, locale)} XTZ`}
              />
              <h5 className="operationCard__title">{t("Wallet.Nfts")}</h5>
              <Carousel Slide={NftSlide} items={ArtifactResponse.nfts} breakpoints={{
                100: { slidesPerView: 1 },
                640: { slidesPerView: 1 },
                900: { slidesPerView: 2 },
                1400: { slidesPerView: 2 },
              }} delay={4000} rates={miscResponse.rates} />
              <h5 className="operationCard__title">{t("Wallet.Tokens")}</h5>
              <CryptoMonnaise tokens={ArtifactResponse.tokens} miscResponse={miscResponse} />
            </Grid>
            <Grid item md={6} paddingLeft={"15px"}>
              <Operations operations={ArtifactResponse.history} contractAddress={ArtifactResponse.wallet.id} />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;
