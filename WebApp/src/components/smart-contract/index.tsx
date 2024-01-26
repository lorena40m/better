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
import { fetchContractInfos, fetchAccountTokens, fetchAccountHistory } from '@/utils/apiClient';
import { useRouter } from "next/router";
import Head from "next/head";
import { Contract } from "@/pages/api/contract-infos";

const 	Contract = ({ address, miscResponse }) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const [tokens, setTokens] = useState({domains: [], nfts: [], coins: [], othersTokens: []});
  const [account, setAccount] = useState({balance: '0', operationCount: 0, id: '0', creatorAddress: '', creatorDomain: '', creationDate: '', averageFee: 0, entrypoints: []} as Contract);
  const [history, setHistory] = useState([]);
  const [coinsInfos, setCoinsInfos] = useState(null);

  useEffect(() => {
	fetchAccountTokens(address).then((data) => {
		setTokens(data);
	});
    fetchContractInfos(address).then((data) => {
      setAccount(data);
    });
    fetch('/api/coins-infos')
      .then(response => response.json())
      .then(data => setCoinsInfos(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [address]);
  return (
    <main>
      <Head>
        <title>{null || 'Contract'} | {t('App.Title')}</title>
      </Head>
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
						icon={null}
						title1={null}
						title2={null}
						title3={null}
						title={'Contract'}
						address={address}
						var1="Uses"
						value1={formatNumber(account?.operationCount ?? 0, locale)}
						var2="Average fee"
						value2={formatPrice(account.averageFee / 10**6 * miscResponse?.xtzPrice ?? 0, locale, miscResponse.rates)}
						var3="Treasury"
						value3={formatPrice(
							(+account.balance / 10**6 * miscResponse?.xtzPrice ?? 0) +
							tokens.coins.reduce(
							  (total, coin) => total + ((coinsInfos?.find((coinInfos) => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) * coin.quantity / 10**coin.asset.decimals),
							  0
							),
							locale,
							miscResponse.rates
						  )}
					/>
					<OtherInfos
						creator={{domain: account?.creatorDomain || null, address: account?.creatorAddress}}
						date={account?.creationDate}
					/>
				</Grid>
				<Grid sm={12} md={6} paddingLeft={"10px"} paddingRight={"10px"}>
					<Operations address={address} operationCount={account?.operationCount} />
				</Grid>
			</Grid>
        </Container>
      </Box>
    </main>
  );
};

export default Contract;
