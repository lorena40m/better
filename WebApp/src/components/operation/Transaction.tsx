import DoubleDownArrow from "@/assets/iconSvg/DoubleDownArrow.svg";
import { Box, Typography, Divider, Grid } from "@mui/material";
import React, { useState } from "react";
import { appWithTranslation, useTranslation } from "next-i18next";

const Transaction = () => {
  const [openList, setOpenList] = useState(true);
  const { t } = useTranslation("common");

  return (
    <Box className="transactionCard">
      <Box
        className="transactionCard__head"
        onClick={() => setOpenList(!openList)}
      >
        <Typography variant="h5" className="transactionCard__head-title">
          {t("block2")}
        </Typography>
        <Typography
          variant="h5"
          className="transactionCard__head-text gradientText"
        >
          0,00032 ETH (0,47 $)
        </Typography>
        <span
          className="transactionCard__head-icon"
          style={{ transform: openList ? "rotate(0deg)" : "rotate(180deg)" }}
        >
          {/* <DoubleDownArrow /> */}
        </span>
      </Box>
      {openList && (
        <Box className="transactionCard__body">
          <Box className="transactionCard__list">
            <Box className="transactionCard__listTitle">
              <Typography variant="h6" gutterBottom>
                {t("fuel")}
              </Typography>

              <Typography variant="h6" gutterBottom textAlign={"right"}>
                21000
              </Typography>
            </Box>
            <ul className="transactionCard__listBox transactionCard__listBox--main">
              <li>
                <Typography variant="caption">{t("fuelPrice")}</Typography>
                <Typography variant="caption"> 21,84 {t("net")}</Typography>
              </li>
              <li>
                <Typography variant="caption">{t("startingPrice")}</Typography>
                <Typography variant="caption">20,84 {t("net")}</Typography>
              </li>
              <li>
                <Typography variant="caption"> {t("PriorityPrice")}</Typography>
                <Typography variant="caption">1 {t("net")}</Typography>
              </li>
            </ul>
          </Box>
          <Box className="transactionCard__total">
            <Box className="transactionCard__listTitle">
              <Typography variant="h6" gutterBottom>
                {t("cost")}
              </Typography>

              <Typography variant="h6" gutterBottom textAlign={"right"}>
                0,00032 ETH (0,47 $)
              </Typography>
            </Box>
            <ul className="transactionCard__listBox">
              <li>
                <Typography variant="caption">{t("brunt")}</Typography>
                <Typography variant="caption">0,00029 ETH</Typography>
              </li>
            </ul>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Transaction;
