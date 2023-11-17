import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import MenuItem from "@mui/material/MenuItem";
import { Box } from "@mui/material";
import Logo from "../../assets/images/logo.svg";
import Wtz from "../assets/images/logoWTZ.png";
import Usd from "../assets/images/LogoUSDtez.png";
import Btc from "../assets/images/tzbtc.webp";
import { useTranslation } from "next-i18next";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function createData(
  Nom: string,
  NomImg: any,
  Symbole: string,
  Dernierprix: number,
  Nombrededétenteurs: number,
  CapitalisationsurEthereum: number
) {
  return {
    Nom,
    NomImg,
    Symbole,
    Dernierprix,
    Nombrededétenteurs,
    CapitalisationsurEthereum,
  };
}

const rows = [
  createData("Wrapped Tezos", Wtz, "WTZ", 0.676, 36000, 73392),
  createData("tzBTC", Btc, "TZBTC", 26671.3, 15000, 783392),
  createData("USDtez", Usd, "USDTZ", 1.0, 300, 78392)
];

export default function TokensTable() {
  const { t } = useTranslation("common");
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="left">{t("token1")}</StyledTableCell>
            <StyledTableCell align="center">{t("token2")}</StyledTableCell>
            <StyledTableCell align="center">{t("token3")}</StyledTableCell>
            <StyledTableCell align="center">{t("token4")}</StyledTableCell>
            <StyledTableCell align="center">{t("token5")}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.Nom}>
              <StyledTableCell scope="row" align="left">
                <Box className="userBox">
                  <Image src={row.NomImg} alt="crypto" width={24} height={24} />
                  {row.Nom}
                </Box>
              </StyledTableCell>
              <StyledTableCell align="center">{row.Symbole}</StyledTableCell>
              <StyledTableCell align="center">{`${row.Dernierprix.toString()} $`}</StyledTableCell>
              <StyledTableCell align="center">
                {row.Nombrededétenteurs.toString()}
              </StyledTableCell>
              <StyledTableCell align="center">
                {`${row.CapitalisationsurEthereum} Millions $`}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
