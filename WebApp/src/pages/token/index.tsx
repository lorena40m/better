import React from "react";
import Header from "../../components/Header";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Sandbox from "@/components/token/Sandbox";
import Nft from "@/components/token/Nft";
import Operations from "@/components/token/Operations";
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
              {t("JetonSur")}
              <span className="pageTemplate__status">
                
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="TokenSandbox" container>
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
              <Sandbox />
              <Nft />
              
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