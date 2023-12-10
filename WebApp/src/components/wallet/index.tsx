import React, { useState } from "react";
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

type Props = {
  ArtifactResponse: WalletResponse,
  miscResponse: MiscellaneousResponse,
}

const Wallet = ({ ArtifactResponse, miscResponse }: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

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
