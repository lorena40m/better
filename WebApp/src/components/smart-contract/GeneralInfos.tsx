import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React from "react";
import Image from "next/image";
import CreateIcon from "@mui/icons-material/Create";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "../../assets/iconSvg/checkIcon.svg";
import { appWithTranslation, useTranslation } from "next-i18next";

const data: any =[
  {id: "1", label: "Utilisations", value: "10 498 229", currency: ""},
  {id: "2", label: "Immuable", value: "", currency: ""},
  {id: "3", label: "Autonome", value: "", currency: ""}
]

const Sandbox: React.FC =() => {
  const { t } = useTranslation("common");

  return(
      <Box className="WalletBoxCard cardBox cardBox--info">
    <Box className="cardBox-inner">
      <Box className="cardBox-data">
        <Box className="cardBox-head">
          <Box sx={{ display: "flex" }}>
            <Typography gutterBottom variant="h3" className="cardBox-title">
              QuipuSwap : Router
            </Typography>
            <CreateIcon />
          </Box>
          <OutlinedInput
            disabled
            className="InputField"
            type={"text"}
            value={"0x468...263"}
            size="small"
            endAdornment={<ContentCopyIcon />}
          />
        </Box>
        <Box className="cardBox-body">
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
          >
            {data.map((item: any) => (
              <Grid xs={2} sm={4} md={4} key={item.id}>
                <Box textAlign={"center"}>
                  <Typography
                    variant="h6"
                    className="cardBox-price"
                    borderBottom={1}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="h6" className="cardBox-price">
                    <span className="gradientText">
                      {!item.value[0] ? <Image src={CheckIcon} alt="" height={50} width={50} /> : t(item.value)}
                    </span>
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box className="costContract">
            <Typography variant="h6" className="gradientText costContract__text">
                Average Cost : 1.15$
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};
export default Sandbox;