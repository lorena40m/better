import React, { useState, useEffect } from "react";
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
import { fetchContractInfos, fetchAccountTokens, fetchAccountTransactionsHistory } from '@/utils/apiClient';
import { useRouter } from "next/router";

const 	Contract = ({ address, miscResponse }) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const [tokens, setTokens] = useState({domains: [], nfts: [], coins: [], othersTokens: []});
  const [account, setAccount] = useState({balance: 0, transactionsCount: 0, id: 0, creatorAddress: ''});
  const [transactionsHistory, setTransactionsHistory] = useState([]);
  const [coinsInfos, setCoinsInfos] = useState();

  useEffect(() => {
	fetchAccountTokens(address).then((data) => {
		setTokens(data);
	  });
    fetchContractInfos(address).then((data) => {
      setAccount(data);
    });
    fetchAccountTransactionsHistory(address, 10).then((data) => {
      setTransactionsHistory(data);
    });
    fetch('/api/coins-infos')
      .then(response => response.json())
      .then(data => setCoinsInfos(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [address]);
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
						title={'Contract'}
						address={address}
						var1="Usages"
						value1={formatNumber(account?.transactionsCount, locale)}
						var2="Average fee"
						value2={'0'}
						var3="Treasury"
						value3={(account.balance / 10**6 * miscResponse?.xtzPrice ?? 0) + 
						tokens.coins.reduce(
						  (total, coin) => total + ((coinsInfos.find((coinInfos) => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) * coin.quantity / 10**coin.asset.decimals), 
						  0
						)}
					/>
					<OtherInfos
						creator={account?.creatorAddress.slice(0, 8) + "..."}
						date={/*formatDate(ArtifactResponse.contract.creationDate, locale)*/'test'}
						link={/*ArtifactResponse.contract.officialWebsite*/'test'}
					/>
				</Grid>
				<Grid sm={12} md={6} paddingLeft={"10px"} paddingRight={"10px"}>
					{/*
					<Operations operations={ArtifactResponse.history} contractAddress={ArtifactResponse.contract.id} />
					*/}
				</Grid>
			</Grid>
        </Container>
      </Box>
    </main>
  );
};

export default Contract;
