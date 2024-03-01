import React, { useEffect, useState } from "react";
import Transfert from "../../components/operation/Transfert";
import Transaction from "../../components/operation/Transaction";
import { appWithTranslation, useTranslation } from "next-i18next";
import { fetchOperation } from "@/utils/apiClient";
import { OperationBatch } from "@/backend/apiTypes";
import { OperationExecutions } from "./OperationExecutions";
import { Page } from "../common/page";

const Operation = ({ hash }) => {
  const { t } = useTranslation("common");
  const [operation, setOperation] = useState({} as OperationBatch);

  useEffect(() => {
    fetchOperation(hash).then((data) => {
      setOperation(data);
    });
  }, [hash]);

  return (
    <Page title="Operation on Tezos">
      <div className="pageComponent__center__content">
        <div className="left">
          <Transfert hash={hash} operation={operation} />
          <OperationExecutions operation={operation} />
        </div>
        <div className="right">
          <Transaction operation={operation} />
        </div>
      </div>
    </Page>
  );
};

export default Operation;
