import React, { useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import CryptoMonnaise from "@/components/wallet/CryptoMonnaise";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import EthereumIcon from "../../assets/images/eth.svg";

import Image from "next/image";
import Operations from "@/components/wallet/Operations";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Nft = () => {
	const { t } = useTranslation("common");

	return (
		<main>
			<Header />
			<Box className="pageTemplate">
				<Container maxWidth="xl">
					<div className="pageTemplate__head">
						<Typography variant="h4" className="pageTemplate__title">
						{t("NftCollection")}
						<span className="pageTemplate__status">
							<Image src={EthereumIcon} alt="" height={15} width={15} />
							Tezos
						</span>
						</Typography>
					</div>
				</Container>
			</Box>
		</main>
	);
}

export default Nft;

export async function getStaticProps({ locale }: any) {
	return {
	  props: {
		...(await serverSideTranslations(locale, ["common"])),
		// Will be passed to the page component as props
	  },
	};
}