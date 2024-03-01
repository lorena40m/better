import {
  Box,
  Card,
  Stack,
  Switch,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatPrice, formatToken, formatTokenWithExactAllDecimals, formatInteger } from '../../utils/format'
import { divide } from "cypress/types/lodash";
import { useTranslation } from "next-i18next";
import { CoinIcon } from '@/components/common/ArtifactIcon'
import { Holding, Coin } from '@/pages/api/account-tokens'
import { useRates } from '@/hooks/RatesContext'

type Props = {
  coins: Holding<Coin>[],
  coinsInfos: any,
}

const CoinBox = (props: Props) => {
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  const { locale } = useRouter();
  const { t } = useTranslation("common");
  const rates = useRates()

  return (
    <div className="coinBox box shadow-box">
      <div className="header">
        <h3>{t('Coins.Title')}</h3>
        <span className="headerInfo">{formatInteger(props.coins.length, locale)} {t('Coins.TokensFound')}</span>
      </div>
      <div className="coinBox__container">
        <div className="coinBox__coin-container">
          {props.coins.map((coin) => {
            let coinValue
            if (coin.Address === 'tezos') {
              coinValue = rates?.cryptos.XTZ ?? 0
            } else {
              const coinInfos = props.coinsInfos?.find(coinInfos => coinInfos.tokenAddress === coin.Address);
              coinValue = coinInfos?.exchangeRate ?? 0;
            }
            return (
              <div key={coin.TokenId} className="coinBox__coin"
                style={coin.asset.image ? {order: "1"} : {order: "1"}}
              >
                <div className="coinBox__coin__left">
                  {coin.Address === 'tezos' ?
                    <CoinIcon coin={{ image: coin.asset.image, ticker: coin.asset.ticker, id: coin.Address }} />
                    :
                    <Link href={'/' + coin.Address}>
                      <CoinIcon coin={{ image: coin.asset.image, ticker: coin.asset.ticker, id: coin.Address }} />
                    </Link>
                  }
                  <div>
                    <p className="coinBox__coin__left__title" title={
                      coin.asset.name + '\n' +
                      formatTokenWithExactAllDecimals(coin.quantity, Number(coin.asset.decimals), locale) + ' ' + coin.asset.ticker
                    }>
                      {formatToken(coin.quantity, Number(coin.asset.decimals), locale)}
                      {coin.Address === 'tezos' ?
                        <strong className="ticker">{coin.asset.ticker}</strong>
                        :
                        <Link href={'/' + coin.Address}>
                          <strong className="ticker hoverItem">{coin.asset.ticker}</strong>
                        </Link>
                      }
                    </p>
                  </div>
                </div>
                <div className="coinBox__coin__right"
                  title={formatPrice(coinValue, locale, rates?.fiats) + '/' + coin.asset.ticker}>
                  <p>{formatPrice(+coin.quantity / 10**coin.asset.decimals * coinValue, locale, rates?.fiats)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoinBox;
