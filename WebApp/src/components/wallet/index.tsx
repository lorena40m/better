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
import { AccountIcon } from '@/components/common/ArtifactIcon';
import { Infos } from '@/pages/api/user-infos';
import { Page } from "../common/page";

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
    <Page title="Wallet on Tezos">
      <Head>
        <title>{name} | {t('App.Title')}</title>
      </Head>
      <div className="left">
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
          var2={null}
          value2={null}
          var3={null}
          value3={null}
          title={null}
        />
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
      </div>
      <div className="right">
        <Operations address={address} operationCount={infos?.operationCount} />
      </div>
    </Page>
  );
};

export default Wallet;
