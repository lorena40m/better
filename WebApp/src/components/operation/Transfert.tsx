import React from "react";
import DollarIcon from "../../assets/images/dollar.svg";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { CopyHashButton } from "../common/CopyHashButton";
import { OperationBatch } from "@/pages/api/_apiTypes";
import { formatDate, formatPrice, formatEntiereDate } from "@/utils/format";
import { useRouter } from "next/router";
import OperationGroupIcon from "@/assets/iconSvg/operation-group.svg";
import CallContractIcon from "@/assets/iconSvg/call-contract.svg";
import TransferIcon from "@/assets/iconSvg/transfer.svg";
import { useRates } from '@/context/RatesContext'

type Props = {
  hash: string,
  operation: OperationBatch,
}

export default function Transfert(props: Props) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  const rates = useRates()

  return (
    <div className="transferBox box shadow-box" style={props.operation.operationGroupList?.some(operationGroup => operationGroup.status === 'success') ? {borderColor: 'green'} : props.operation.operationGroupList?.some(operationGroup => operationGroup.status === 'failure') ? {borderColor: 'red'} : {borderColor: 'grey'}}>
      <div className="transferBox__top">
        <div className="transferBox__top__left">
          <Image src={(props.operation.operationGroupList?.length > 1 ? OperationGroupIcon : (props.operation.operationGroupList?.[0].operationList[0].operationType === 'transfer' ? TransferIcon : CallContractIcon))} alt="Operation icon" className="transferBox__top__left__image" height={50} width={50}></Image>
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
        <p>Fees : {rates && formatPrice(((+props.operation?.fees / 10**6 || 0) * (+rates.cryptos.XTZ || 1)), locale, rates.fiats ?? { EUR: 0 })}</p>
        <p>Block Number: {props.operation.block}</p>
      </div>}
    </div>
  );
}
