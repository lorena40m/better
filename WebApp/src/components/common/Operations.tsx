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

  console.log(props.operations);
  return (
    <div className="operationsBox">
      <h3>Latest operations</h3>
      {props.operations.map(operation => {
        const user = operation.from.id === props.contractAddress ? operation.to : operation.from;
        const userName = user.name ?? (user.id.substring(0, 2) === "KT" ? "Contract" : "User");
        return (
          <div className="operationsBox__operation" key={operation.id}>
            <div className="operationsBox__operation__start">
              <Image src={user.id.substring(0, 2) === "KT" ? SmartContractIcon : UserIcon} alt="Tezos logo" />
              <div>
                <p className="operationsBox__operation__start__name">{userName}</p>
                <p className="operationsBox__operation__start__date">{operation.date}</p>
              </div>
            </div>
            <div className="operationsBox__operation__end">
              <p>{operation.from.id === props.contractAddress ? "-" : "+"}{formatToken((operation.quantity).toString(), 6, locale)} XTZ</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Operations;