import React, { useState } from "react";
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Wallet from "../components/wallet/index";
import Operation from "../components/operation/index";
import Contract from "../components/smart-contract/index";
import Page404 from '../components/common/404';
import { useRouter } from 'next/router';

export async function getServerSideProps({ locale }: any) {
  return ({
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  });
}

const Artifact = (props) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const id = router.query.id as string;

  if (id.substring(0, 2) === "tz" && id.length === 36) {
    return (
      <Wallet address={id} />
    );
  } else if (id.substring(0, 2) === "KT" && id.length === 36) {
    return (
      <Contract address={id} />
    );
  } else if (id.substring(0, 1) === "o" && id.length === 51) {
    return (
      <Operation hash={id} />
    );
  } else {
    return (
      <Page404 />
    );
  }
};

export default Artifact;
