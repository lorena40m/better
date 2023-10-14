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

const data: any = [
  { id: "1", icon: BitcoinIcon, value: 3.232, coin: "BTC", price: "122$" },
  {
    id: "2",
    icon: EthereumIcon,
    value: 0.232,
    coin: "ETH",
    price: "4 223$",
  },
  {
    id: "3",
    icon: EthereumIcon,
    value: 2.32,
    coin: "ETH",
    price: "2 333$",
  },
  { id: "4", icon: EthereumIcon, value: 0.02, coin: "ETH", price: "22$" },
];

const CryptoMonnaise = () => {
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  return (
    <Card className="ElevationBox">
      <Box className="crypto" marginTop={"15px"}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography className="ElevationBox__title" variant="h5" gutterBottom>
            CryptoMonnaise
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography className="SwitchDetail" variant="caption" gutterBottom>
              Non certifié
            </Typography>
            <Switch
              className="SwitchBtnToggler"
              {...label}
              defaultChecked
              color="warning"
            />
            <Typography className="SwitchDetail" variant="caption" gutterBottom>
              Certifié
            </Typography>
          </Stack>
        </Box>

        <TableContainer className="MonnaiseTable" component={Paper}>
          <Table aria-label="simple table">
            {/* <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead> */}
            <TableBody>
              {data.map((row: any) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell scope="row">
                    <div className="profilePart">
                      <Image src={row.icon} alt="" height={44} width={44} />
                      <div className="profilePart__text">
                        <span>{row.value}</span>
                        <span>{row.coin}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div className="tablerighttext">{row.price}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};

export default CryptoMonnaise;
