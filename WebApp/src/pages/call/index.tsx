import React from "react";
import Header from "../../components/Header";
import {
  Typography,
  Box,
  Grid,
  Container,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import SmartContract from "../../components/call/SmartContract";
import Transaction from "../../components/call/Transaction";
import Operations from "../../components/call/Operations";
import Tezos from "../../assets/images/tezos.svg"
import PlayCircle from "../../assets/images/PlayCircle.svg";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import Image from "next/image";

const Operation = () => {
  const { t } = useTranslation("common");

  return (
    <main  >
      <Header />
      <Box className="pageTemplate">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("opr_top")}
              <span className="pageTemplate__status">
                <Image
                  priority
                  src={Tezos}
                  height={40}
                  width={40}
                  alt="Tezos"
                />
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="pageTemplate__body" container spacing={4}>
            <Grid item md={6}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <SmartContract/>
                </Grid>
                <Grid item xs={12}>
                  <Transaction />
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={6}>
              <Operations />
            </Grid>
          </Grid>
          <Box className="pageTemplate__PlayBtnText">
            <a href="#">
              <Image
                priority
                src={PlayCircle}
                height={24}
                width={24}
                alt="PlayCircle"
              />
              {t("bottomLink")}
            </a>
          </Box>
        </Container>
      </Box>
    </main>
  );
};

export default Operation;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
