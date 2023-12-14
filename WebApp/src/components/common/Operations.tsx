import UserIcon from "@/assets/iconSvg/userIcon.svg";
import SmartContractIcon from "@/assets/iconSvg/smartContractIcon.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";
import { formatToken, formatDate, formatTokenWithExactAllDecimals } from '../../utils/format'
import { useRouter } from "next/router";

const Operations = (props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <div className="operationsBox box">
      <h3>Latest operations</h3>
      {props.operations.map(operation => {
        const user = operation.TargetId === props.accountId ? operation.SenderId : operation.TargetId;
        //const userName = user.name ?? (user.id.substring(0, 2) === "KT" ? "Contract" : "User");
        const userName = "User";
        return (
          <div className="operationsBox__operation hoverItem" key={operation.Id}>
            <div className="operationsBox__operation__start">
              <Image src={/*user.id.substring(0, 2) === "KT" ? SmartContractIcon :*/ UserIcon} alt="Tezos logo" />
              <div>
                <p className="operationsBox__operation__start__name">{userName}</p>
                <p className="operationsBox__operation__start__date">{formatDate(operation.Timestamp, locale)}</p>
              </div>
            </div>
            <div className="operationsBox__operation__end">
              <p style={operation.TargetId === props.accountId ? {color: "rgb(39 169 27)"} : {color: "rgb(255 131 9)"}}>
                {operation.TargetId === props.accountId ? "+" : "-"}{formatToken((operation.Amount).toString(), 6, locale)} XTZ
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Operations;
