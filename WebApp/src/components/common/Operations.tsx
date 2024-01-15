import SuccessIcon from "@/assets/images/check.png"
import FailureIcon from "@/assets/images/failure.png"
import PendingIcon from "@/assets/images/pending.png"
import React from "react";
import Image from "next/image";
import Link from "next/link"
import { useTranslation } from "next-i18next";
import { addSign, formatToken, formatDate, formatEntiereDate, formatNumber, formatInteger, formatTokenWithExactAllDecimals } from '../../utils/format'
import { useRouter } from "next/router";
import { History } from '@/pages/api/account-history'
import { accountIcon, coinIcon } from '@/components/common/artifactIcon'

const LIMIT_OPERATIONS_BY_BATCH = 4
const LIMIT_TRANSFERS_BY_OPERATION = 4

type Props = {
  history: History,
  address: string,
  operationCount: number,
}

const Operations = (props: Props) => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  return (
    <div className="operationsBox box">
      <div className="header">
        <h3>{t('History.Title')}</h3>
        <span className="headerInfo">{formatInteger(props.operationCount, locale)} {t('History.OperationsFound')}</span>
      </div>

      {props.history.map(batch => {
        const operationLimit = batch.length > LIMIT_OPERATIONS_BY_BATCH && LIMIT_OPERATIONS_BY_BATCH - 1

        return (
          <Link href={'/' + batch[0].id} key={batch[0].id}>
          <div className="operationsBox__batch hoverItem">
            {batch.slice(0, operationLimit || batch.length).map((operation, i) => {
              const transferLimit = operation.transferedAssets.length > LIMIT_TRANSFERS_BY_OPERATION && LIMIT_TRANSFERS_BY_OPERATION - 1

              return  <div className="operationsBox__batch__operation" key={i}>
                <div className="operationsBox__batch__operation__start">
                  {accountIcon(operation.counterparty)}
                  <div>
                    <p className="operationsBox__batch__operation__start__name">
                      {
                        operation.counterparty.name ??
                        t('AccountDefaultName.' + (operation.counterparty?.accountType ?? 'userGroup'))
                      }
                    </p>
                    {i == 0 && <p className="operationsBox__batch__operation__start__date"
                      title={t('History.Status.' + operation.status) + formatEntiereDate(operation.date, locale)}
                      style={{ color: { success: 'green', failure: 'red', waiting: '#808080' }[operation.status] }}>
                      <Image className="statusIcon" src={{
                        success: SuccessIcon,
                        failure: FailureIcon,
                        waiting: PendingIcon,
                      }[operation.status]} alt={operation.status} width={20} />
                      <span>{formatDate(operation.date, locale)}</span>
                    </p>}
                  </div>
                </div>
                <div className="operationsBox__batch__operation__end">
                  {operation.transferedAssets.length === 0 && (
                    <p style={{color: "#2a3b51"}}>
                      {t('History.Call')}<pre>{operation.functionName}</pre>
                    </p>
                  )}

                  {operation.transferedAssets.slice(0, transferLimit || operation.transferedAssets.length).map((transfer, i) =>
                    transfer.asset.assetType === 'coin' ?
                    <p key={i} className="coin"
                      style={+transfer.quantity > 0 ? {color: "rgb(39 169 27)"} : +transfer.quantity < 0 ? {color: "rgb(255 131 9)"} : null}
                      title={
                        transfer.asset.name + '\n' +
                        addSign(formatTokenWithExactAllDecimals(transfer.quantity, transfer.asset.decimals, locale) + ' ' + transfer.asset.ticker)
                      }>
                      {coinIcon(transfer.asset)}
                      <span>
                        {addSign(formatToken(transfer.quantity, transfer.asset.decimals, locale))}
                        {" " + (transfer.asset.ticker ?? transfer.asset.name)}
                      </span>
                    </p>
                    :
                    <p key={i} className="nft"
                      style={+transfer.quantity > 0 ? {color: "rgb(39 169 27)"} : +transfer.quantity < 0 ? {color: "rgb(255 131 9)"} : null}
                      title={
                        transfer.asset.name + '\n' +
                        addSign(formatTokenWithExactAllDecimals(transfer.quantity, 0, locale) + ' NFT')
                      }>
                      <img src={transfer.asset.image} alt={transfer.asset.name} width={100} />
                      {addSign(formatInteger(+transfer.quantity, locale))} NFT{Math.abs(+transfer.quantity) == 1 ? '' : 's'}
                    </p>
                  )}

                  {transferLimit && (
                    <div className="operationsBox__batch__operation__more">
                      +{operation.transferedAssets.length - transferLimit} {t('History.More.Transfers')}
                    </div>
                  )}
                </div>
              </div>
            })}
            {operationLimit && (
              <div className="operationsBox__batch__more">
                +{batch.length - operationLimit} {t('History.More.Operations')}
              </div>
            )}
          </div>
          </Link>
        )
      })}
    </div>
  );
};

export default Operations;
