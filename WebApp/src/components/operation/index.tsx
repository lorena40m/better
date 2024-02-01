import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  Typography,
  Box,
  Grid,
  Container,
} from "@mui/material";
import Transfert from "../../components/operation/Transfert";
import Transaction from "../../components/operation/Transaction";
import Tezos from "../../assets/images/tezos.svg";
import { appWithTranslation, useTranslation } from "next-i18next";
import { fetchOperation } from "@/utils/apiClient";
import { OperationBatch } from "@/pages/api/_apiTypes";
import { OperationExecutions } from "./OperationExecutions";

import Image from "next/image";

const Operation = ({ hash, miscResponse }) => {
  const { t } = useTranslation("common");
  const [operation, setOperation] = useState({} as OperationBatch);

  useEffect(() => {
    fetchOperation(hash).then((data) => {
      setOperation(data);
    });
  }, [hash]);

  return (
    <main  >
      <Header hideSearch={true} />
      <Box className="pageTemplate">
        <Container maxWidth="xl">
          <div className="pageTemplate__head">
            <Typography variant="h4" className="pageTemplate__title">
              {t("opr_top")}
              <span className="pageTemplate__status">
                <Image
                  priority
                  src={Tezos}
                  height={40}
                  width={40}
                  alt="Tezos"
                />
                Tezos
              </span>
            </Typography>
          </div>
          <Grid className="pageTemplate__body" container spacing={4}>
            <Grid item md={6}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Transfert hash={hash} operation={operation} miscResponse={miscResponse} />
                </Grid>
                <Grid item xs={12}>
                  <OperationExecutions operation={operation} />
                </Grid>
                <Grid item xs={12}>
                  {/*<OperationExecutions operation={operation} />*/}
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={6}>
              <Transaction operation={operation} />
            </Grid>
          </Grid>
        </Container>
      </Box>

    </main>
  );
};

export default Operation;
