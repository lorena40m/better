import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React, { ReactElement as Element } from "react";
import Image from "next/image";
import CreateIcon from "@mui/icons-material/Create";
import CopyPastIcon from "@/assets/iconSvg/copyPastIcon.svg";
import CheckIcon from "@/assets/iconSvg/checkIcon.svg";
import { appWithTranslation, useTranslation } from "next-i18next";
import { CopyHashButton } from "./CopyHashButton";

type Props = {
  icon: Element | string,
  name: Element | string,
  address: string,
  var: Element | string,
  value: Element | string,
  title: string | undefined,
}

export default function MainInfos(props: Props) {
  const { t } = useTranslation("common");

  return (
    <div className="MainInfos">
      <div className="__top">
        <h2>
          {props.icon}
          {props.name}
        </h2>
        <CopyHashButton hash={props.address} />
      </div>
      <div className="__bottom">
        <div title={props.title}>
          <p className="__bottom__var">{props.var}</p>
          <span className="divider"></span>
          <p className="__bottom__value">{props.value}</p>
        </div>
      </div>
    </div>
  );
};
