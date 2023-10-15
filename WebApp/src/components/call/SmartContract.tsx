import { Box, Typography, Divider, Grid, Input } from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import Tezos from "../../assets/images/tezos.svg";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Card } from "@mui/material";
import NftView from "../nft/NftView";


import { appWithTranslation, useTranslation } from "next-i18next";



  
  // const data: any = [
  const data: any = {
    id: "1",
   
    value1: {
      val1: "DE",
      val2: "3434",
    },
    value2: {
      val1: "a",
      val2: "3X22434",
    },
    
    coinvalue: {
      price: 23232,
    },
  };
  // ];
  
  

const Call = () => {
    const [value, setValue] = React.useState(0);
    const { t } = useTranslation("common");

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
      };
        return(
            <Box className="call">
                <Box className="call__head">
                    <Typography gutterBottom variant="h4" className="call__title">
                        {t("Smart Contract")}
                    </Typography>
                </Box>
                <Box className="call__body">
                    <Box className="call__list">
                        <Box className="call__listTitle">
                            <Typography variant="h6">
                            {t("initiator")} : <span style={{ textDecoration: 'underline' }}>Bryan.Tez</span>
                            </Typography>
                            
                        </Box>
                         <ul className="call__listBox" style={{ listStyleType: 'none' }}>
                            <li>
                                <Typography variant="h5"> {t("Smart Contract")} : <span  style={{ textDecoration: 'underline' }}> Aave v3 Bridge </span></Typography>
            
                            </li>
                            <li>
                                <Typography variant="h5"> {t("function used")} :  MintWithXTZ</Typography>
            
                            </li>

                        </ul>
                        <Box className="call__listTitle">
                            <Typography variant="h6">
                            {t("transfer")}
                            </Typography>
                            
                        </Box>

                        
                    <Box
                        sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        }}
                    >
                        {[0, 1,].map((item) => (
                            <Box className="callCard" key={item}>
                                <Box className="TransmitterCard__head">
                                    {/* <TransferIcon /> */}
                            
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
                                    src={Tezos}
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
       
          

                </Box>
                
              <NftView/>
            </Box>
        </Box>
        )
}
export default Call