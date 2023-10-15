import React from "react";
import Header from "../../components/Header";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Sandbox from "@/components/token/Sandbox";
import NftView from "../../components/token/NftView";
import Operation from"@/components/token/Operations";
import OtherInfos from "@/components/token/OtherInfos";
import Holders from "@/components/token/Holders";
import GeneralInfo from "@/components/token/GeneralInfos";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import EthereumIcon from "../../assets/images/eth.svg";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const Token = () => {
    const { t } = useTranslation("common");

    return(
        <main>
            <Header/>
        
            <Box className="pageTemplate Token">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("JetonSur")}
              <span className="pageTemplate__status">
                
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="TokenSandbox" container>
            <Grid md={6} paddingRight={"15px"}>
              <Sandbox />
              
              <OtherInfos />
              <Holders />
            </Grid>
            <Grid md={6} paddingLeft={"15px"}>
                <Operation/>
            </Grid>
          </Grid>
          <GeneralInfo/>
          <Box className="tokenInfo">
            <Grid className="walletProfile" container>
                <Grid md={6} paddingRight={"15px"}>
                  <NftView />
                  <CryptoMonnaise />
                </Grid>
                <Grid md={6} paddingLeft={"15px"}>
                  <Operation />
                </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

    </main>

    )
}
export default Token;

export async function getStaticProps({ locale }: any) {
    return {
      props: {
        ...(await serverSideTranslations(locale, ["common"])),
        // Will be passed to the page component as props
      },
    };
  }