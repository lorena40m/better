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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { appWithTranslation, useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { formatPrice, formatToken } from '../../utils/format';

interface ProfileProps {
  profileName: any;
  walletId: any;
  miscResponse: any;
  totalValue: any;
  operationCount: any;
  nativeBalance: any;
}

const Profile: React.FC<ProfileProps> = (props) => {
  const { t } = useTranslation("common");

  const { locale } = useRouter();

  return (
    <Box className="WalletBoxCard cardBox cardBox--info">
      <Box className="cardBox-inner">
        <Box className="cardBox-data">
          <Box className="cardBox-head">
              {
                props.profileName ?
                <>
                  <Box sx={{ display: "flex" }}>
                    <Typography gutterBottom variant="h3" className="cardBox-title">
                      {props.profileName}
                    </Typography>
                  </Box>
                  <OutlinedInput
                    disabled
                    className="InputField"
                    type={"text"}
                    value={`${props.walletId.slice(0, 8)}...`}
                    size="small"
                    endAdornment={<ContentCopyIcon />}
                    onClick={() => navigator.clipboard.writeText(props.walletId)}
                    style={{ cursor: 'pointer' }}
                  />
                </>
                :
                <Box sx={{ display: "flex" }}>
                  <Typography gutterBottom variant="h3" className="cardBox-title">
                    {`${props.walletId.slice(0, 8)}...`}
                  </Typography>
                  <ContentCopyIcon onClick={() => navigator.clipboard.writeText(props.walletId)} style={{ cursor: 'pointer' }} />
                </Box>
              }
          </Box>
          <Box className="cardBox-body">
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              <Grid xs={2} sm={4} md={4}>
                <Box textAlign={"center"}>
                  <Typography
                    variant="h6"
                    className="cardBox-price"
                    borderBottom={1}
                  >
                    {t("Balance")}
                  </Typography>
                  <Typography variant="h6" className="cardBox-price">
                    <span className="gradientText">
                      {formatToken(props.nativeBalance, 6, locale)}XTZ
                    </span>
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={2} sm={4} md={4}>
                <Box textAlign={"center"}>
                  <Typography
                    variant="h6"
                    className="cardBox-price"
                    borderBottom={1}
                  >
                    {t("Totalvalue")}
                  </Typography>
                  <Typography variant="h6" className="cardBox-price">
                    <span className="gradientText">
                      {formatPrice(props.totalValue, locale, props.miscResponse.rates)}
                    </span>
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={2} sm={4} md={4}>
                <Box textAlign={"center"}>
                  <Typography
                    variant="h6"
                    className="cardBox-price"
                    borderBottom={1}
                  >
                    {t("Operations")}
                  </Typography>
                  <Typography variant="h6" className="cardBox-price">
                    <span className="gradientText">
                      {props.operationCount}
                    </span>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;

{
  /* <Image
priority
src={ETH}
height={40}
width={62}
alt="Follow us on Twitter"
/> */
}
