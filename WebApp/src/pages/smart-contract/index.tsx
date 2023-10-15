import React, { useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import GeneralInfos from "@/components/smart-contract/GeneralInfos";
import OtherInfos from "@/components/smart-contract/OtherInfos";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";

import Image from "next/image";
import Operations from "@/components/wallet/Operations";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const 	SmartContract = () => {
  const { t } = useTranslation("common");

  const [open, setOpen] = useState<Boolean>(false);
  return (
    <main>
      <Header />
      <Box className="pageTemplate">
        <Container maxWidth="xl">
			<div className="pageTemplate__head">
				<Typography variant="h4" className="pageTemplate__title">
				{t("SmartContractOn")}
					<span className="pageTemplate__status">
						Tezos
						<Image src={TezosIcon} alt="" height={40} width={40}/>
					</span>
				</Typography>
			</div>
			<Grid className="walletProfile" container>
				<Grid sm={12} md={6} paddingLeft={"10px"} paddingRight={"10px"}>
					<GeneralInfos />
					<OtherInfos />
				</Grid>
				<Grid sm={12} md={6} paddingLeft={"10px"} paddingRight={"10px"}>
					<Operations />
				</Grid>
			</Grid>
			<Box className="treasuryBox">
				<Typography variant="h4" className="treasuryBox__title">Treasury</Typography>
				<Typography variant="h4" className="treasuryBox__gradient gradientText">300 Million of $</Typography>
			</Box>
        </Container>
      </Box>
    </main>
  );
};

export default SmartContract;

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      // Will be passed to the page component as props
    },
  };
}
