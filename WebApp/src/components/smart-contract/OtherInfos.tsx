import {
    Box,
    Container,
    Grid,
    Typography,
  } from "@mui/material";
  import React from "react";
  import { appWithTranslation, useTranslation } from "next-i18next";

  const OtherInfos = (props) => {
    const { t } = useTranslation("common");

    return(
		<div className="otherInfos">
			<h3>Informations</h3>
			<p>Creator : {props.creator}</p>
			<p>Creation date : {props.date}</p>
			<p>Official website : <a href={props.link} target="_blank">{props.link}</a></p>
		</div>
    );
  };
  export default OtherInfos;