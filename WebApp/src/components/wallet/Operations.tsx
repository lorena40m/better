import RightArrow from "@/assets/iconSvg/RightArrow";
import TransferIcon from "@/assets/iconSvg/TransferIcon";
import { Box, Grid, Input, Typography } from "@mui/material";
import Ethereum from "../../assets/images/Ethereum.svg";
import Tezos from "../../assets/images/tezos.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";

const Operations = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Box className="operationCard">
        <Typography variant="h5" className="operationCard__title">
          {t("latestTransaction")}
        </Typography>
        <Box className="TransmitterCard">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
        <Box className="TransmitterCard success">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
        <Box className="TransmitterCard danger">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
        <Box className="TransmitterCard">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
        <Box className="TransmitterCard">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
        <Box className="TransmitterCard">
          <Box className="TransmitterCard__head">
            <Typography variant="h4" className="TransmitterCard__title">
              <TransferIcon />
              {t("Pendingtransfer")}
            </Typography>
            <Box className="TransmitterCard__head-text">il y a 20 min</Box>
          </Box>
          <Box className="TransmitterCard__body">
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={5}>
                  <Box>
                    <Input
                      disabled
                      type={"text"}
                      value={"0xdjlkf....jlsdkskdjl"}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>DE </Box>}
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
                  <RightArrow />
                </Grid>
                <Grid item xs={5}>
                  <Input
                    disabled
                    type={"text"}
                    value={"0xdjlkf....jlsdkskdjl"}
                    size="small"
                    startAdornment={<Box sx={{ display: "flex" }}>A </Box>}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box className="TransmitterCard__status">
              <Image
                priority
                src={Tezos}
                height={22} 
                width={22}
                alt="Tezos"
              />
              1,22 XTZ
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Operations;
