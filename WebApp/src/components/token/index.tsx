import React from "react";
import Header from "../../components/Header";
import Image from "next/image";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Sandbox from "@/components/token/Sandbox";
import NftView from "../../components/wallet/NftView";
import Operation from"@/components/token/Operations";
import OtherInfos from "@/components/token/OtherInfos";
import Holders from "@/components/token/Holders";
import GeneralInfo from "@/components/token/GeneralInfos";
import CryptoMonnaise from "@/components/wallet/CoinBox";
import TempleIcon from "../../assets/images/temple-logo.png";
import { appWithTranslation, useTranslation } from "next-i18next";

const Token = ({homeResponse}) => {
    const { t } = useTranslation("common");

    return(
        <main>
            <Header/>
        
            <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("Tokens on")}
              <span className="pageTemplate__status">
                
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="walletProfile" container>
            <Grid md={6} paddingRight={"15px"}>
              <Sandbox />
              <Box className="addMetamaskParent">
                <Box className="addMetamask">
                  <Image
                    src={TempleIcon}
                    width={40}
                    alt="See on Metamask"
                  />
                  <Typography variant="h4" className="addMetamask__p">
                    {t("Add to Metamask")}
                  </Typography>
                </Box>
              </Box>
              <OtherInfos />
              <Holders />
            </Grid>
            <Grid md={6} paddingLeft={"15px"}>
                <Operation/>
            </Grid>
          </Grid>
          <GeneralInfo/>
        
      
          <Grid className="walletProfile" container>
            <Grid md={6} paddingRight={"15px"}>
          
              <NftView trending={homeResponse.collections.trending} />
              <CryptoMonnaise />
            </Grid>
            <Grid md={6} paddingLeft={"15px"}>
              <Operation />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
    </main>

    )
}
export default Token;
