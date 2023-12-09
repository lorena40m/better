import RightArrow from "@/assets/iconSvg/RightArrow";
import TransferIcon from "@/assets/iconSvg/TransferIcon";
import { Box, Grid, Input, Typography } from "@mui/material";
import Ethereum from "../../assets/images/Ethereum.svg";
import AnonymousIcon from "@/assets/iconSvg/anonymousIcon.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";
import { formatToken, formatDate, formatTokenWithExactAllDecimals } from '../../utils/format'
import { useRouter } from "next/router";

const Operations = (props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    /*<>
      <Box className="operationCard">
        <Typography variant="h5" className="operationCard__title">
          {t("latestTransaction")}
        </Typography>
        {props.operations.map(operation => (
          <Box className="TransmitterCard success" key={operation.id}>
            <Box className="TransmitterCard__head">
              <Typography variant="h4" className="TransmitterCard__title">
                <TransferIcon />
                {t("Transfer successful")}
              </Typography>
              <Box className="TransmitterCard__head-text"
                title={(new Date(operation.date)).toLocaleString(locale)}>
                {formatDate(operation.date, locale)}
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
                        value={operation.from.name ? `${operation.from.name.length > 11 ? `${operation.from.id.slice(0, 8)}...` : operation.from.name}` : `${operation.from.id.slice(0, 8)}...`}
                        title={`${operation.from.id}`}
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
                      value={`${operation.to.id.slice(0, 8)}...`}
                      title={`${operation.to.id}`}
                      size="small"
                      startAdornment={<Box sx={{ display: "flex" }}>{t("To")}</Box>}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box className="TransmitterCard__status" style={{ whiteSpace: "nowrap", }}
                title={formatTokenWithExactAllDecimals(operation.quantity.toString(), 6, locale) + ' XTZ'}
              >
                <Image
                  priority
                  src={Tezos}
                  height={40}
                  width={40}
                  alt="Tezos"
                />
                {`${formatToken((operation.quantity).toString(), 6, locale)} XTZ`}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </>*/
    <div className="operationsBox">
      <h3>Latest operations</h3>
      {props.operations.map(operation => (
        <div className="operationsBox__operation">
          <div className="operationsBox__operation__start">
            <Image src={AnonymousIcon} alt="Tezos logo" />
            <div>
              <p className="operationsBox__operation__start__name">{operation.from.id === props.contractAddress ? (operation.to?.name ?? "Anonymous") : (operation.from?.name ?? "Anonymous")}</p>
              <p className="operationsBox__operation__start__date">{formatDate(operation.date, locale)}</p>
            </div>
          </div>
          <div className="operationsBox__operation__end">
            <p>{operation.from.id === props.contractAddress ? "-" : "+"}{formatToken((operation.quantity).toString(), 6, locale)} XTZ</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Operations;
