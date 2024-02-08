import {
    Box,
    Container,
    Grid,
    Typography,
  } from "@mui/material";
import React from "react";
import { appWithTranslation, useTranslation } from "next-i18next";
import Link from "next/link";
import { formatDate } from "@/utils/format";
import { useRouter } from "next/router";

const OtherInfos = (props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return(
  <div className="otherInfos shadow-box">
    <h3>Informations</h3>
    <p title={props.creator.address}>Creator : <Link href={'/' + props.creator.address}>{props.creator.domain || props.creator.address.slice(0, 8) + "..."}</Link></p>
    <p title={props.date}>Creation date : {formatDate(props.date.toString(), locale)}</p>
  </div>
  );
};
export default OtherInfos;