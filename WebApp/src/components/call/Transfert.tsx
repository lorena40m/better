import React from "react";
import {
  Typography,
  Box,
  Grid,
  Container,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { ContentCopy, Height } from "@mui/icons-material";
import DollarIcon from "../../assets/images/dollar.svg";
import wallet from "../../assets/images/wallet 2.svg";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TransferIcon from "@/assets/images/transferIcon.svg";
import RightArrow from "@/assets/iconSvg/RightArrow.svg";
import Wallet from "@/assets/iconSvg/Wallet.svg";
import { useTranslation } from "next-i18next";

export default function Transfert() {
  const { t } = useTranslation("common");

  return (
    <Box className="transferCard">
      <Box className="transferCard__head">
        {/* <TransferIcon /> */}
        <Image src={TransferIcon} alt="transfericon" />
        <Typography gutterBottom variant="h4" className="transferCard__title">
          {t("transfer")}
        </Typography>
        <Box className="copyBox">
          <OutlinedInput
            disabled
            type={"text"}
            value={"0xdjlkf....jlsdkskdjl"}
            size="small"
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => navigator.clipboard.writeText("crypto")}
                  edge="end"
                >
                  <ContentCopy />
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>
      </Box>
      <Box className="transferCard__body">
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={5}>
            <Box>
              <OutlinedInput
                disabled
                type={"text"}
                value={"0xdjlkf....jlsdkskdjl"}
                size="small"
                startAdornment={
                  <Box className="inputText">
                    {/* <Wallet /> */}
                    DE
                  </Box>
                }
              />
            </Box>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* <RightArrow /> */}
          </Grid>
          <Grid item xs={5}>
            <OutlinedInput
              disabled
              type={"text"}
              value={"0xdjlkf....jlsdkskdjl"}
              size="small"
              startAdornment={
                <Box className="inputText">{/* <Wallet />A */}</Box>
              }
            />
          </Grid>
        </Grid>
      </Box>
      <Box className="transferCard__footer">
        <Box className="transferCard__footer-total">
          <Image
            priority
            src={DollarIcon}
            height={32}
            width={32}
            alt="dollar"
          />
          <Typography gutterBottom variant="h4" className="cardBox-title">
            8988 USDC
          </Typography>
        </Box>
        <Typography
          variant="caption"
          display="block"
          className="transferCard__footer-text"
        >
          il y a 20 min
        </Typography>
      </Box>
    </Box>
  );
}
