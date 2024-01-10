import UserIcon from "@/assets/iconSvg/userIcon.svg";
import SmartContractIcon from "@/assets/iconSvg/smartContractIcon.svg";
import React from "react";
import Image from "next/image";
import { appWithTranslation, useTranslation } from "next-i18next";
import { formatToken, formatDate, formatNumber, formatTokenWithExactAllDecimals } from '../../utils/format'
import { useRouter } from "next/router";
import { History } from '@/pages/api/account-history'

const accountIcons = {
  user: UserIcon,
  userGroup: UserIcon,
  baker: SmartContractIcon,
  ghostContract: SmartContractIcon,
  delegator: SmartContractIcon,
  contract: SmartContractIcon,
  asset: SmartContractIcon,
}

type Props = {
  history: History,
  address: string,
}

const Operations = (props: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <div className="operationsBox box">
      <h3>Latest operations</h3>
      {props.history.map(batch => {
        return (
          <div className="operationsBox__batch hoverItem" key={batch[0].id}>
            {batch.map((operation, i) => (
              <div className="operationsBox__batch__operation" key={i}>
                <div className="operationsBox__batch__operation__start">
                  <Image src={accountIcons[operation.counterparty?.accountType ?? 'addressGroup']} alt="Tezos logo" />
                  <div>
                    <p className="operationsBox__batch__operation__start__name">
                      {
                        operation.counterparty.name ??
                        t('History.Counterparty.Name.' + (operation.counterparty?.accountType ?? 'addressGroup'))
                      }
                    </p>
                    <p className="operationsBox__batch__operation__start__date">{formatDate(operation.date, locale)}</p>
                  </div>
                </div>
                <div className="operationsBox__operation__end">
                  {
                    operation.transferedAssets.length === 0 ?
                      <p style={{color: "#2a3b51"}}>
                        Call <pre>{operation.functionName}</pre>
                      </p>
                    :
                      operation.transferedAssets.map(transfer =>
                        transfer.asset.assetType === 'coin' ?
                        <p style={+transfer.quantity > 0 ? {color: "rgb(39 169 27)"} : +transfer.quantity < 0 ? {color: "rgb(255 131 9)"} : null}>
                          {/*<span title={formatTokenWithExactAllDecimals(transfer.quantity, transfer.asset.decimals, locale) + ' ' + transfer.asset.ticker}>*/}
                            {+transfer.quantity > 0 ? '+' : +transfer.quantity == 0 ? '=' : '-'}
                            {transfer.quantity}
                            {formatToken(transfer.quantity, transfer.asset.decimals, locale)}
                            {" " + (transfer.asset.ticker ?? transfer.asset.name)}
                          {/*</span>*/}
                        </p>
                        :
                        <p style={+transfer.quantity > 0 ? {color: "rgb(39 169 27)"} : +transfer.quantity < 0 ? {color: "rgb(255 131 9)"} : null}>
                          {/*<span title={formatNumber(+transfer.quantity, locale) + ' NFT' + (transfer.quantity[1] === '1' ? '' : 's')}>
                            {transfer.quantity[0]}
                            {formatNumber(+transfer.quantity, locale)}
                            NFT
                          </span>*/}
                        </p>
                      )
                  }
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  );
};

export default Operations;
