import RightArrow from "@/assets/iconSvg/RightArrow";
import TransferIcon from "@/assets/iconSvg/TransferIcon";
import { Box, Grid, Input, Typography } from "@mui/material";
import Ethereum from "../../assets/images/Ethereum.svg";
import Tezos from "../../assets/images/tezos.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";
import { formatToken, formatDate, formatTokenWithExactAllDecimals } from '../../utils/format'
import { useRouter } from "next/router";

const Operations = (props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <>
      <Box className="operationCard">
        <Typography variant="h5" className="operationCard__title">
          {t("latestTransaction")}
        </Typography>
        {props.operations.filter(o => o.artifactType === "transfer").map(operation => (
          <Box className="TransmitterCard success" key={operation.operation.id}>
            <Box className="TransmitterCard__head">
              <Typography variant="h4" className="TransmitterCard__title">
                <TransferIcon />
                {t("Transfer successful")}
              </Typography>
              <Box className="TransmitterCard__head-text"
                title={(new Date(operation.operation.date)).toLocaleString(locale)}>
                {formatDate(operation.operation.date, locale)}
              </Box>
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
                        title={`${operation.operation.from.id}`}
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
                      title={`${operation.operation.to.id}`}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>{t("To")}</Box>}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box className="TransmitterCard__status" style={{ whiteSpace: "nowrap", }}
                title={formatTokenWithExactAllDecimals(operation.operation.nativeQuantity.toString(), 6, locale) + ' XTZ'}
              >
                <Image
                  priority
                  src={Tezos}
                  height={40}
                  width={40}
                  alt="Tezos"
                />
                {`${formatToken(operation.operation.nativeQuantity.toString(), 6, locale)} XTZ`}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Operations;
