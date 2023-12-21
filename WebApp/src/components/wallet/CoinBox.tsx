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
import Image from "next/image";
import BitcoinIcon from "../../assets/images/btc.svg";
import EthereumIcon from "../../assets/images/eth.svg";
import TezosIcon from "../../assets/images/tezos.svg";
import { useRouter } from "next/router";
import { formatPrice, formatToken } from '../../utils/format'
import { divide } from "cypress/types/lodash";

const CoinBox = (props) => {
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  const { locale } = useRouter();

  function ipfsToLink(stringIpfs) {
    if (!stringIpfs) {
      return ("");
    }
    if (stringIpfs.substring(0, 7) !== "ipfs://") {
      return (stringIpfs);
    }
    const baseUrl = "https://ipfs.io/ipfs/";
    const ipfsId = stringIpfs.slice(7);
    return (baseUrl + ipfsId);
  }

  return (
    <div className="coinBox box">
      <h3>Coins</h3>
      <div className="coinBox__container">
        {/*<div className="coinBox__container__header">
          <p>symbol</p>
          <p>balance</p>
        </div>*/}
        <div className="coinBox__coin-container">
          {props.coins.map((coin) => {
            const coinInfos = props.coinsInfos.find(coinInfos => coinInfos.tokenAddress === coin.Address);
            const coinValue = coinInfos?.exchangeRate ?? 0;
            return (
              <div key={coin.id} className="coinBox__coin"
                style={coin.Metadata.thumbnailUri ? {order: "1"} : {order: "1"}}
              >
                <div className="coinBox__coin__left">
                  {coin.Metadata.thumbnailUri ? <img src={ipfsToLink(coin.Metadata.thumbnailUri)} alt={coin.Metadata.name + "logo"} /> : <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="no image" />}
                  <div>
                    <p className="coinBox__coin__left__title">{formatToken(coin.Balance, Number(coin.Metadata.decimals), locale).slice(0, 4)}... <strong>{coin.Metadata.symbol}</strong></p>
                  </div>
                </div>
                <div className="coinBox__coin__right">
                  <p>{(Number(formatToken(coin.Balance, Number(coin.Metadata.decimals), locale)) * coinValue).toString().slice(0, 4)}$</p>
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
