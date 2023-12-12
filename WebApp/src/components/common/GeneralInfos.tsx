import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import React from "react";
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

const GeneralInfos = (props) => {
  const { t } = useTranslation("common");

  return(
    <div className="generalInfos">
      <Toaster />
      <div className="generalInfos__top">
        <h2>{props.title ?? "User"}</h2>
            <div className="generalInfos__top__copy" onClick={() => {copy(props.address)}}>
              <p>{props.address.slice(0, 8)}...</p>
              <Image src={CopyPastIcon} alt="copy past icon"/>
            </div>
      </div>
      <div className="generalInfos__bottom">
        <div>
          <p className="generalInfos__bottom__var">{props.var1}</p>
          <span></span>
          <p className="generalInfos__bottom__value">{props.value1}</p>
        </div>
        <div>
          <p className="generalInfos__bottom__var">{props.var2}</p>
          <span></span>
          <p className="generalInfos__bottom__value">{props.value2}</p>
        </div>
        <div>
          <p className="generalInfos__bottom__var">{props.var3}</p>
          <span></span>
          <p className="generalInfos__bottom__value">{props.value3}</p>
        </div>
      </div>
    </div>
);
};

export default GeneralInfos;