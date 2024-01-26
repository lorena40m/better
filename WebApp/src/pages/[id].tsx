import React, { useState } from "react";
import { HomeResponse } from '../endpoints/API';
import ArtifactEndpoint from '../endpoints/ArtifactEndpoint';
import { appWithTranslation, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Wallet from "../components/wallet/index";
import Call from "../components/call/index";
import Nft from "../components/nft/index";
import Operation from "../components/operation/index";
import Contract from "../components/smart-contract/index";
import Token from "../components/token/index";
import { MiscellaneousResponse } from '../endpoints/API';
import MiscellaneousEndpoint from '../endpoints/MiscellaneousEndpoint';

export async function getServerSideProps({ params, locale }: any) {
  const miscResponse = await MiscellaneousEndpoint({});
  /*let ArtifactResponse = null;
  try {
    ArtifactResponse = JSON.stringify(await ArtifactEndpoint({ pageSize: 5, id: params.id }));

    return {
      props: {
        ...(await serverSideTranslations(locale, ["common"])),
        ArtifactResponse,
        miscResponse
      },
    };
  } catch {
    // TODO: direct to _error page
    return {
      props: {
        ...(await serverSideTranslations(locale, ["common"])),
        ArtifactResponse,
        miscResponse
      },
    };
  }*/
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
  }
};

export default Artifact;
