import {
    Box,
    Container,
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
    {id: "1", label: "Quantity", value: "555", currency: ""},
    {id: "2", label: "Record Sale", value: "65", currency: "ETH"},
    {id: "3", label: "Creation Date", value: "08/08/2020", currency: ""}
  ]

  const Sandbox: React.FC =() => {
    const { t } = useTranslation("common");

    return(
        <Box className="tokenOtherInfos">
			<Typography variant="h4" className="tokenOtherInfos__title">
				Informations
			</Typography>
			<Container maxWidth="xl">
				<Grid
				container
				rowSpacing={2}
				columnSpacing={{ xs: 1, sm: 2 }}
				>
					<Grid xs={12} sm={6}>
						<Typography variant="body1" className="tokenOtherInfos__boldtext">
							Standard : ERC 721
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Detenteurs : 267
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Prix plancher : 106 XTZ
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Transferts annuels : 16 millions
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Volume annuels : 25 millions de $
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text gradientText">
							Site officiel : yuga.com
						</Typography>
					</Grid>
					<Grid xs={12} sm={6}>
						<Typography variant="body1" className="tokenOtherInfos__boldtext">
							Prix plancher : 106 XTZ
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__boldtext">
							Transferts annuels : 16 millions
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__boldtext">
							Volume annuels : 25 millions de $
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text gradientText">
							Site officiel : yuga.com
						</Typography>
					</Grid>
				</Grid>
			</Container>
		</Box>
    );
  };
  export default Sandbox;