import React, { useEffect, useState } from "react";
import Transfert from "../../components/operation/Transfert";
import Transaction from "../../components/operation/Transaction";
import { appWithTranslation, useTranslation } from "next-i18next";
import { fetchOperation } from "@/utils/apiClient";
import { OperationBatch } from "@/pages/api/_apiTypes";
import { OperationExecutions } from "./OperationExecutions";
import { Page } from "../common/page";

const Operation = ({ hash, miscResponse }) => {
  const { t } = useTranslation("common");
  const [operation, setOperation] = useState({} as OperationBatch);

  useEffect(() => {
    fetchOperation(hash).then((data) => {
      setOperation(data);
    });
  }, [hash]);

  return (
    <Page title="Wallet on Tezos">
      <div className="left">
        <Transfert hash={hash} operation={operation} miscResponse={miscResponse} />
        <OperationExecutions operation={operation} />
      </div>
      <div className="right">
      <Transaction operation={operation} />
      </div>
    </Page>
  );
};

export default Operation;
