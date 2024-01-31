import React, { useState } from "react";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Wallet from "../components/wallet/index";
import Operation from "../components/operation/index";
import Contract from "../components/smart-contract/index";
import MiscellaneousEndpoint from '../endpoints/MiscellaneousEndpoint';
import Page404 from './404';

export async function getServerSideProps({ params, locale }: any) {
  const miscResponse = await MiscellaneousEndpoint({});
  return ({
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      hash: params.id,
      miscResponse,
    },
  });
}

const Artifact = (props) => {
  const { t } = useTranslation("common");
  if (props.hash.substring(0, 2) === "tz") {
    return (
      <Wallet address={props.hash} miscResponse={props.miscResponse} />
    );
  } else if (props.hash.substring(0, 2) === "KT") {
    return (
      <Contract address={props.hash} miscResponse={props.miscResponse} />
    );
  } else if (props.hash.substring(0, 1) === "o") {
    return (
      <Operation hash={props.hash} miscResponse={props.miscResponse} />
    );
  } else {
    return (
      <Page404 />
    );
  }
};

export default Artifact;
