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
  title: Element | string,
  address: string,
  var1: Element | string,
  value1: Element | string,
  title1: string | undefined,
  var2: Element | string,
  value2: Element | string,
  title2: string | undefined,
  var3: Element | string,
  value3: Element | string,
  title3: string | undefined,
}

const GeneralInfos = (props: Props) => {
  const { t } = useTranslation("common");

  return(
    <div className="generalInfos">
      <Toaster />
      <div className="generalInfos__top">
        <h2>
          {props.icon}
          {props.title}
        </h2>
        <div className="generalInfos__top__copy" onClick={() => {copy(props.address)}}>
          <p>{props.address.slice(0, 8)}...</p>
          <Image src={CopyPastIcon} alt="copy past icon"/>
        </div>
      </div>
      <div className="generalInfos__bottom">
        <div title={props.title1}>
          <p className="generalInfos__bottom__var">{props.var1}</p>
          <span className="divider"></span>
          <p className="generalInfos__bottom__value">{props.value1}</p>
        </div>
        <div title={props.title2}>
          <p className="generalInfos__bottom__var">{props.var2}</p>
          <span className="divider"></span>
          <p className="generalInfos__bottom__value">{props.value2}</p>
        </div>
        <div title={props.title3}>
          <p className="generalInfos__bottom__var">{props.var3}</p>
          <span className="divider"></span>
          <p className="generalInfos__bottom__value">{props.value3}</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfos;
