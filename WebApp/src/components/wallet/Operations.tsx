import RightArrow from "@/assets/iconSvg/RightArrow";
import TransferIcon from "@/assets/iconSvg/TransferIcon";
import { Box, Grid, Input, Typography } from "@mui/material";
import Ethereum from "../../assets/images/Ethereum.svg";
import Tezos from "../../assets/images/tezos.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";

const Operations = (props) => {
  const { t } = useTranslation("common");

  return (
    <>
      <Box className="operationCard">
        <Typography variant="h5" className="operationCard__title">
          {t("latestTransaction")}
        </Typography>
        {props.operations.map((operation) => (
          operation.artifactType === "transfer" ? (
            <Box className="TransmitterCard success">
              <Box className="TransmitterCard__head">
                <Typography variant="h4" className="TransmitterCard__title">
                  <TransferIcon />
                  {t("Transfer successful")}
                </Typography>
                <Box className="TransmitterCard__head-text">{operation.operation.date}</Box>
              </Box>
              <Box className="TransmitterCard__body">
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={5}>
                      <Box>
                        <Input
                          disabled
                          type={"text"}
                          value={`${operation.operation.from.id.slice(0, 8)}...`}
                          size="small"
                          startAdornment={<Box sx={{ display: "flex" }}>{t("From")}</Box>}
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
                        value={`${operation.operation.to.id.slice(0, 8)}...`}
                        size="small"
                        startAdornment={<Box sx={{ display: "flex" }}>{t("To")}</Box>}
                      />
                    </Grid>
                  </Grid>
                </Box>
                <Box className="TransmitterCard__status" style={{ whiteSpace: "nowrap", }}>
                  {/* <Image
                    priority
                    src={Tezos}
                    height={22} 
                    width={22}
                    alt="Tezos"
                  /> */}
                  {`${Number((operation.operation.nativeQuantity / 10**6 ).toString().slice(0, 6))} XTZ`}
                </Box>
              </Box>
            </Box>
          ) : null
        ))}
      </Box>
    </>
  );
};

export default Operations;
