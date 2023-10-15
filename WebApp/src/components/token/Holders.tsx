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
				Holders
			</Typography>
			<Container maxWidth="xl">
				{Array.from({ length: 5 }, (_, index) => (
					<Grid container spacing={3} style={{textAlign: "center", height: "60px"}}>
						<Grid sm={4}>
							<Typography variant="body1" className="tokenOtherInfos__text">
							0dFghg...Hgfd
							</Typography>
						</Grid>
						<Grid sm={4}>
							<Typography variant="body1" className="tokenOtherInfos__text">
								766,546,645 SAND
							</Typography>
						</Grid>
						<Grid sm={4}>
							<Typography variant="body1" className="tokenOtherInfos__text">
								34,45%
							</Typography>
						</Grid>
					</Grid>
      			))}
			</Container>
		</Box>
    );
  };
  export default Sandbox;