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
        const user = operation.TargetAddress === props.address ? operation.SenderAddress : operation.TargetAddress;
        const userName = user.substring(0, 2) === "KT" ? "Contract" : "User";
        let tokenName = operation?.Metadata?.symbol;
        tokenName = (tokenName ? tokenName : "XTZ");
        let tokenDecimals = operation?.Metadata?.decimals;
        tokenDecimals = (tokenDecimals ? Number(tokenDecimals) : 6);
        return (
          <div className="operationsBox__operation hoverItem" key={operation.Id}>
            <div className="operationsBox__operation__start">
              <Image src={user.substring(0, 2) === "KT" ? SmartContractIcon : UserIcon} alt="Tezos logo" />
              <div>
                <p className="operationsBox__operation__start__name">{userName}</p>
                <p className="operationsBox__operation__start__date">{formatDate(operation.Timestamp, locale)}</p>
              </div>
            </div>
            <div className="operationsBox__operation__end">
              {
                operation.Amount === "0" ?
                  <p style={{color: "#2a3b51"}}>
                    Call {operation.Entrypoint}()
                  </p>
                :
                  <p style={operation.TargetAddress === props.address ? {color: "rgb(39 169 27)"} : {color: "rgb(255 131 9)"}}>
                    {operation.TargetAddress === props.address ? "+" : "-"}
                    {formatToken(operation.Amount, tokenDecimals, locale)}
                    {" " + tokenName}
                  </p>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Operations;
