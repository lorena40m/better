import {
    Box,
    Container,
    Grid,
    Typography,
  } from "@mui/material";
  import React from "react";
  import { appWithTranslation, useTranslation } from "next-i18next";

  const Sandbox: React.FC =() => {
    const { t } = useTranslation("common");

    return(
        <Box className="contractOtherInfos">
			<Typography variant="h4" className="tokenOtherInfos__title">
				Informations
			</Typography>
			<Container maxWidth="xl">
				<Grid
				container
				rowSpacing={2}
				columnSpacing={{ xs: 1, sm: 2 }}
				>
					<Grid>
						<Typography variant="body1" className="tokenOtherInfos__boldtext">
							Application : QuipuSwap
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Creator : Francois.tez
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Creation date : 08/09/2018
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text">
							Audits : skynet.com
						</Typography>
						<Typography variant="body1" className="tokenOtherInfos__text gradientText">
							Site officiel : tezos.com
						</Typography>
					</Grid>
				</Grid>
			</Container>
		</Box>
    );
  };
  export default Sandbox;