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
import Ada from "../assets/images/ada.svg";
import Bnb from "../assets/images/bnb.svg";
import Btc from "../assets/images/btc.svg";
import Eth from "../assets/images/eth.svg";
import Luna from "../assets/images/luna.svg";
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
  createData("BNB", Bnb, "BNB", 41263.0, 360000, 783392),
  createData("Bitcoin", Btc, "BTC", 41263.0, 360000, 783392),
  createData("Ethereum", Eth, "ETH", 41263.0, 360000, 783392),
  createData("Terra", Luna, "LUNA", 41263.0, 360000, 783392),
  createData("Cardano", Ada, "ADA", 41263.0, 360000, 783392),
];

export default function CustomizedTables() {
  const { t } = useTranslation("common");
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell align="left">Nom</StyledTableCell>
            <StyledTableCell align="center">{t("jetson2")}</StyledTableCell>
            <StyledTableCell align="center">{t("jetson3")}</StyledTableCell>
            <StyledTableCell align="center">{t("jetson4")}</StyledTableCell>
            <StyledTableCell align="center">{t("jetson5")}</StyledTableCell>
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
