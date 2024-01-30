import React from "react";
import {
  Typography,
  Box,
  Grid,
  Container,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { ContentCopy, Height } from "@mui/icons-material";
import DollarIcon from "../../assets/images/dollar.svg";
import wallet from "../../assets/images/wallet 2.svg";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TransferIcon from "@/assets/images/transferIcon.svg";
import RightArrow from "@/assets/iconSvg/RightArrow.svg";
import Wallet from "@/assets/iconSvg/Wallet.svg";
import { useTranslation } from "next-i18next";
import { CopyHashButton } from "../common/CopyHashButton";
import { OperationBatch } from "@/pages/api/_apiTypes";
import { formatDate, formatPrice, formatEntiereDate } from "@/utils/format";
import { useRouter } from "next/router";
import { AccountIcon } from "../common/ArtifactIcon";
import Link from "next/link";

type Props = {
  hash: string,
  operation: OperationBatch,
  miscResponse: any
}

export default function Transfert(props: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <div className="transferBox box">
      <div className="transferBox__top">
        <div className="transferBox__top__left">
          <Image src={(props.operation.operationGroupList?.[0].operationList[0].operationType === 'call' ? DollarIcon : DollarIcon)} alt="Operation icon" className="transferBox__top__left__image" height={50} width={50}></Image>
          <div>
            <h1>{props.operation.operationGroupList?.length === 1 ? (props.operation.operationGroupList?.[0].operationList[0].operationType[0].toUpperCase() + props.operation.operationGroupList?.[0].operationList[0].operationType.slice(1)) : 'Operation Group'}</h1>
            <p className="transferBox__top__left__green" title={formatEntiereDate(props.operation?.date, locale)}>{formatDate(props.operation?.date, locale)}</p>
            {null === 'call' ? <p>test</p> : <></>}
          </div>
        </div>
        <CopyHashButton hash={props.hash} />
      </div>
      {/*props.operation.operationType?.toString() !== 'operationGroup' ? <div className="transferBox__mid">
        <p className="transferBox__mid__signer">Signataire : </p>
        {props.operation.operationList?.[0].from ? <AccountIcon account={props.operation.operationList?.[0].from}/> : <></>}
        <div>
          <Link href={'/' + props.operation.operationList?.[0].from.address}>
            <p className="transferBox__mid__address_link" title={props.operation.operationList?.[0].from.address}>{props.operation.operationList?.[0].from.name ?? props.operation.operationList?.[0].from.address.slice(0, 8) + "..."}</p>
          </Link>
        </div>
  </div> : <></>*/}
      {<div className="transferBox__bot">
        <p>Frais : {formatPrice(/*(+props.operation?.fees / 10**6 ?? 0 * +props.miscResponse?.xtzPrice ?? 1)*/1, locale, props.miscResponse?.rates ?? { 'EUR/USD': 0 })}</p>
        <p>Block Number: {props.operation.block}</p>
      </div>}
    </div>
  );
}
