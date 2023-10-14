import React, { useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import NftView from "@/components/wallet/NftView";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";

import Image from "next/image";
import Operations from "@/components/wallet/Operations";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Wallet = () => {
  const { t } = useTranslation("common");

  const [open, setOpen] = useState<Boolean>(false);
  return (
    <main>
      <Header />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          {/* <Button onClick={() => setOpen(true)}>Open Modal</Button>
          <Box sx={{ display: "flex" }}>
            <Typography variant="h4" gutterBottom>
              Portfeuille sur
            </Typography>
            <Button variant="outlined">
              <Image src={EthereumIcon} alt="" height={15} width={15} />
              Ethereum
            </Button>
          </Box> */}
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("portfolioOn")}
              <span className="pageTemplate__status">
                <Image src={TezosIcon} alt="" height={40} width={40} />
                  Tezos
              </span>
            </Typography>
          </div>
          <Grid className="walletProfile" container>
            {/* <Grid md={6} gap={4} paddingRight={"15px"}>
                <Grid xs={12}>
                  <Profile />
                </Grid>
                <Grid xs={12}>
                  <Nft />
                </Grid>
                <Grid xs={12}>
                  <CryptoMonnaise />
                </Grid>
              </Grid> */}
            <Grid md={6} paddingRight={"15px"}>
              <Profile />
              <NftView />
              <CryptoMonnaise />
            </Grid>
            <Grid md={6} paddingLeft={"15px"}>
              <Operations />
              {/* <Grid xs={12} style={{ height: "100%" }}>
                  <Box className="WalletCard">
                    <Box className="WalletCard__head">
                      <Typography variant="h4" className="WalletCard__title">
                        Dernières opérations
                      </Typography>
                    </Box>
                  </Box>
                </Grid> */}
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
