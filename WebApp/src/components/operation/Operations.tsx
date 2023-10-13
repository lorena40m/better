import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DollarIcon from "@/assets/images/dollar.svg";
import { Divider, Grid, Input, OutlinedInput } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import TransferIcon from "@/assets/iconSvg/TransferIcon.svg";
import Ethereum from "../../assets/images/Ethereum.svg";
import RightArrow from "@/assets/iconSvg/RightArrow.svg";
import { appWithTranslation, useTranslation } from "next-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// const data: any = [
const data: any = {
  id: "1",
  icon: <DollarIcon />,
  title: "sdkf",
  value1: {
    val1: "DE",
    val2: "3434",
  },
  value2: {
    val1: "a",
    val2: "3X22434",
  },
  time: "1 yr 30 min",
  coinvalue: {
    crypto: <DollarIcon />,
    price: 23232,
  },
};
// ];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Box>{children}</Box>
        </Box>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Operations() {
  const [value, setValue] = React.useState(0);
  const { t } = useTranslation("common");

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box className="operationCard">
      <Typography variant="h5" className="operationCard__title">
        {t("latestTransaction")}
      </Typography>
      <Box className="operationCard__tabs">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label={t("transmitter")} {...a11yProps(0)} />
          <Tab label={t("receiver")} {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[0, 1, 2].map((item) => (
              <Box className="TransmitterCard" key={item}>
                <Box className="TransmitterCard__head">
                  {/* <TransferIcon /> */}
                  <Image src={TransferIcon} alt="transfericon" />
                  <Typography variant="h4" className="TransmitterCard__title">
                    {data.title}
                  </Typography>
                  <Box className="TransmitterCard__head-text">{data.time}</Box>
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
                            startAdornment={
                              <Box sx={{ display: "flex" }}>DE </Box>
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
                        <Input
                          disabled
                          type={"text"}
                          value={"0xdjlkf....jlsdkskdjl"}
                          size="small"
                          startAdornment={
                            <Box sx={{ display: "flex" }}>A </Box>
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Box className="TransmitterCard__status">
                    <Image
                      priority
                      src={Ethereum}
                      height={16}
                      width={10}
                      alt="Ethereum"
                    />
                    {data.coinvalue.price}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          {t("receiver")}
        </TabPanel>
      </Box>
    </Box>
  );
}
