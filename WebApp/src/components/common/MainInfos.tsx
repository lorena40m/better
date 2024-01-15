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
import toast, { Toaster } from 'react-hot-toast';

function copy(text) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard', {
    duration: 2000,
  });
}

type Props = {
  icon: Element | string,
  name: Element | string,
  address: string,
  var: Element | string,
  value: Element | string,
  title: string | undefined,
}

export default (props: Props) => {
  const { t } = useTranslation("common");

  return(
    <div className="MainInfos">
      <Toaster />
      <div className="__top">
        <h2>
          {props.icon}
          {props.name}
        </h2>
        <div className="__top__copy" onClick={() => {copy(props.address)}}>
          <p>{props.address.slice(0, 8)}...</p>
          <Image src={CopyPastIcon} alt="copy past icon"/>
        </div>
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
