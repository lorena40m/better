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

import { HomeResponse } from '../../endpoints/API';
import HomeEndpoint from '../../endpoints/HomeEndpoint';


export async function getServerSideProps({ locale }: any) {
  const homeResponse = await HomeEndpoint({ pageSize: 10 })

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      homeResponse,
    },
  };
}

const Wallet = ({ homeResponse }) => {
  const { t } = useTranslation("common");

  const [open, setOpen] = useState<Boolean>(false);
  return (
    <main>
      <Header />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
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
            <Grid md={6} paddingRight={"15px"}>
              <Profile />
              <NftView trending={homeResponse.collections.trending} />
              <CryptoMonnaise />
            </Grid>
            <Grid md={6} paddingLeft={"15px"}>
              <Operations />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ConfirmModal open={open} close={() => setOpen(false)} />
    </main>
  );
};

export default Wallet;
