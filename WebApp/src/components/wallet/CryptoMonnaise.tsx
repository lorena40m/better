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

const CryptoMonnaise = (props) => {
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  const { locale } = useRouter();
  return (
    <Card className="ElevationBox">
     

      <TableContainer className="MonnaiseTable" component={Paper}>
        <Table aria-label="simple table">
          <TableBody>
            {props.tokens.map((token: any) => (
              <TableRow
                key={token.coin.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell scope="row">
                  <div className="profilePart">
                    <Image src={token.coin.logo} alt="" height={44} width={44} />
                    <div className="profilePart__text">
                      <span>{(token.quantity / 10**token.coin.decimals).toFixed(6)}</span>
                      <span>{token.coin.ticker}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div className="tablerighttext">{formatPrice((token.valueInUSD / 10**6).toString(), locale, props.miscResponse.rates) }</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default CryptoMonnaise;
