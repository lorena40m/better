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
          {t("Fee")}:
        </Typography>
        <Typography
          variant="h5"
          className="transactionCard__head-text gradientText"
        >
           0,47 $ 
        </Typography>
       
      </Box>
     
    </Box>
  );
};

export default Transaction;
