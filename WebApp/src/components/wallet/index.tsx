import React, { useEffect, useState } from "react";
import Header from "../../components/Header/index";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Profile from "@/components/wallet/Profile";
import NftView from "@/components/wallet/NftView";
import CoinBox from "@/components/wallet/CoinBox";
import ConfirmModal from "@/components/wallet/ConfirmModal";
import TezosIcon from "../../assets/images/tezos.svg";
import Image from "next/image";
import Link from "next/link";
import Operations from "@/components/common/Operations";
import { useTranslation } from "next-i18next";
import Carousel from "@/components/Carousel/Carousel";
import NftSlide from "@/components/Carousel/NftSlide";
import MainInfos from "@/components/common/MainInfos";
import { formatPrice, formatNumber, formatToken, formatDate, formatTokenWithExactAllDecimals } from "@/utils/format";
import { useRouter } from "next/router";
import Head from "next/head";
import { fetchUserInfos, fetchAccountTokens } from '@/utils/apiClient';
import fetchCoinsInfos from '@/pages/api/coins-infos';
import TezosIcon2 from "@/assets/images/tezos.png";
import { AccountIcon } from '@/components/common/ArtifactIcon'
import { Infos } from '@/pages/api/user-infos'

type Props = {
  address: string,
  miscResponse: {rates: {"EUR/USD": number}, xtzPrice: number},
}

const Wallet = ({ address, miscResponse }: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const [tokens, setTokens] = useState({domains: [], nfts: [], coins: [], othersTokens: []});
  const [infos, setInfos] = useState({
    balance: '0',
    operationCount: 0,
    account: {
      address,
      name: null,
      image: null,
      accountType: 'user',
    }
  } as Infos);
  const [coinsInfos, setCoinsInfos] = useState(null);

  useEffect(() => {
    fetchAccountTokens(address).then((data) => {
      setTokens(data);
    });
    const { infos0$, infos1$ } = fetchUserInfos(address)
    infos0$.then(setInfos)
    infos1$.then(setInfos)
    fetch('/api/coins-infos')
      .then(response => response.json())
      .then(data => setCoinsInfos(data))
      .catch(error => console.error('Error fetching data:', error));
  }, [address]);

  const name = infos.account.name ?? t('AccountDefaultName.user')

  return (
    <main>
      <Head>
        <title>{name} | {t('App.Title')}</title>
      </Head>
      <Header hideSearch={true} />
      <Box className="pageTemplate WalletOprationCard">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("WalletPage.Title")}
              <Link href={'/'}>
              <span className="pageTemplate__status hoverItem">
                <Image src={TezosIcon} alt="" height={40} width={40} />
                Tezos
              </span>
              </Link>
            </Typography>
          </div>
          <Grid className="walletProfile" container>
            <Grid item md={6} paddingRight={"15px"}>
              <MainInfos
                icon={<AccountIcon account={infos.account} />}
                name={name}
                address={address}
                var={t('Wallet.TotalValue')}
                value={
                  formatPrice(
                    (+infos.balance / 10**6 * miscResponse?.xtzPrice ?? 0) +
                    tokens.coins.reduce(
                      (total, coin) => total + ((coinsInfos?.find((coinInfos) => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) * coin.quantity / 10**coin.asset.decimals),
                      0
                    ),
                    locale,
                    miscResponse.rates
                  )
                }
                title={null}
              />
              {/*{tokens.nfts[0] ? <h5 className="operationCard__title">{t("Wallet.Nfts")}</h5> : null}
              <Carousel Slide={NftSlide} items={tokens.nfts} breakpoints={{
                100: { slidesPerView: 1 },
                640: { slidesPerView: 1 },
                900: { slidesPerView: 2 },
                1400: { slidesPerView: 2 },
              }} delay={4000} rates={miscResponse.rates} />*/}
              {
                (tokens.coins[0] && coinsInfos || parseInt(infos.balance) > 0) &&
                  <CoinBox coins={[{
                    "TokenId": null,
                    "asset": {
                        "id": 'tezos',
                        "logo": null,
                        "name": "Tezos",
                        "ticker": "XTZ",
                        "address": 'tezos',
                        "decimals": 6,
                        "assetType": "coin",
                        "lastPrice": 1
                    },
                    "quantity": infos.balance.toString()
                  }].concat(tokens.coins)} coinsInfos={coinsInfos} rates={miscResponse.rates} xtzPrice={miscResponse.xtzPrice} />
              }
            </Grid>
            <Grid item md={6} paddingLeft={"15px"}>
              <Operations address={address} operationCount={infos?.operationCount} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </main>
  );
};

export default Wallet;
