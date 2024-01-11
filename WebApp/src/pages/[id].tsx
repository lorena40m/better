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

const pages = {
  Wallet,
  Call,
  Nft,
  Operation,
  Contract,
  Token
};

const Artifact = (props) => {
  const { t } = useTranslation("common");
  /*ArtifactResponse = JSON.parse(ArtifactResponse);
  const artifactType = ArtifactResponse.artifactType ?? null;
  const componentName = artifactType[0].toUpperCase() + artifactType.slice(1);

  const ComponentToRender = pages[componentName];

  return (
	  <>
      <ComponentToRender ArtifactResponse={ArtifactResponse} address="tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX" miscResponse={miscResponse} />
	  </>
  )*/
  if (props.hash.substring(0, 2) === "tz") {
    return (
      <Wallet address={props.hash} miscResponse={props.miscResponse} />
    );
  } else if (props.hash.substring(0, 2) === "KT") {
    return (
      <Contract address={props.hash} miscResponse={props.miscResponse} />
    );
  }
};

export default Artifact;
