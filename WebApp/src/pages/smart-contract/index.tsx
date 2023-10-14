import React, { useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import GeneralInfos from "@/components/smart-contract/GeneralInfos";
import OtherInfos from "@/components/smart-contract/OtherInfos";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import EthereumIcon from "../../assets/images/eth.svg";

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
						<Image src={EthereumIcon} alt="" height={15} width={15} />
						Tezos
					</span>
				</Typography>
			</div>
			<Grid className="walletProfile" container>
				<Grid md={6} paddingRight={"15px"}>
					<GeneralInfos />
					<OtherInfos />
				</Grid>
				<Grid md={6} paddingLeft={"15px"}>
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
