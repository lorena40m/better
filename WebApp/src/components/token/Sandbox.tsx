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
  import { appWithTranslation, useTranslation } from "next-i18next";

  const data: any =[
    {id: "1", label: "Price", value: " 0,57", currency: "XTZ"},
    {id: "2", label: "Holder", value: " 124 768", currency: "€"},
    {id: "3", label: "totalQuantity", value: " 1234", currency: ""}
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
                SandBox Currency(SAND)
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
                        {t(item.value)}

                        {item.currency}
                      </span>
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
    );
  };
  export default Sandbox;
