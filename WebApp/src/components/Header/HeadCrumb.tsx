import React from "react";
import { Stack, Typography, Button, Container, Box } from "@mui/material";
import { useTranslation } from "next-i18next";

const HeadCrumb = () => {
  const { t } = useTranslation("common");
  return (
    <Box style={{background: "#FAFAFB"}}>
      <Stack
        className="headCrumb"
        padding="8px 0"
        sx={{
          background:
            "linear-gradient(170.05deg, rgba(247, 69, 69, 0.1) -65.14%, rgba(51, 132, 245, 0.1) 174.73%)",
        }}
      >
        <Container maxWidth="xl">
          <Box className="headCrumb-inner">
            <Typography>{t("headCrumb")}</Typography>
            <Button>{t("headCrumbButton")}</Button>
          </Box>
        </Container>
      </Stack>
    </Box>
  );
};

export default HeadCrumb;
