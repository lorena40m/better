import React, { useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import CryptoMonnaise from "@/components/wallet/CoinBox";
import GeneralInfos from "@/components/common/GeneralInfos";
import OtherInfos from "@/components/smart-contract/OtherInfos";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";

import Image from "next/image";
import Operations from "@/components/common/Operations";
import { appWithTranslation, useTranslation } from "next-i18next";
import { formatPrice, formatNumber, formatToken, formatDate } from "@/utils/format";
import { useRouter } from "next/router";

const 	Contract = ({ ArtifactResponse, miscResponse }) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  const [open, setOpen] = useState<Boolean>(false);
  return (
    <main>
      <Header hideSearch={false} />
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
					<GeneralInfos
						title={ArtifactResponse.contract.name}
						address={ArtifactResponse.contract.id}
						var1="Usages"
						value1={formatNumber(ArtifactResponse.contract.operationCount, locale)}
						var2="Average fee"
						value2={formatPrice(ArtifactResponse.contract.averageFee, locale, miscResponse.rates)}
						var3="Treasury"
						value3={formatPrice(ArtifactResponse.contract.treasuryValue, locale, miscResponse.rates)}
					/>
					<OtherInfos
						creator={ArtifactResponse.contract.creator?.name ?? (ArtifactResponse.contract.creator.id.slice(0, 8) + "...")}
						date={formatDate(ArtifactResponse.contract.creationDate, locale)}
						link={ArtifactResponse.contract.officialWebsite}
					/>
				</Grid>
				<Grid sm={12} md={6} paddingLeft={"10px"} paddingRight={"10px"}>
					<Operations operations={ArtifactResponse.history} contractAddress={ArtifactResponse.contract.id} />
				</Grid>
			</Grid>
        </Container>
      </Box>
    </main>
  );
};

export default Contract;
