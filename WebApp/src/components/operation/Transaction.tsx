import React, { useState } from "react";
import { OperationBatch } from "@/pages/api/_apiTypes";
import { appWithTranslation, useTranslation } from "next-i18next";
import Link from "next/link";

type Props = {
	operation: OperationBatch,
}

const Transaction = (props: Props) => {
  const [openList, setOpenList] = useState(true);
  const { t } = useTranslation("common");

  const transfers = [];

  function pushInTransfer(assetTransfer) {
    for (let i = 0; i < transfers.length; i++) {
      const transfer = transfers[i];
      if (transfer.from.address === assetTransfer.from.address && transfer.to.address === assetTransfer.to.address) {
        for (let j = 0; j < transfer.assets.length; j++) {
          const asset = transfer.assets[j];
          if (asset.asset.id === assetTransfer.asset.id) {
            asset.quantity += +assetTransfer.quantity;
            return ;
          }
        }
        transfer.assets.push({
          quantity: +assetTransfer.quantity,
          asset: assetTransfer.asset
        });
        return ;
      }
    }
    transfers.push({
      from: assetTransfer.from,
      to: assetTransfer.to,
      assets: [{
        quantity: +assetTransfer.quantity,
        asset: assetTransfer.asset
      }]
    });
  }  

  return (
    <div className="operationTransfersBox box">
      <h2>Transfers</h2>
      {props.operation?.operationGroupList?.map((operationGroup) => {
        return (
          operationGroup.operationList?.map((operation) => {
            return (
              operation.assets.map((assetTransfer) => {
                pushInTransfer(assetTransfer);
                return (
                  null
                );
              })
            );
          })
        );
      })}
      {transfers.map((transfer, i) => {
        return (
          <div key={i} className="operationTransfersBox__transfer">
            <div className="operationTransfersBox__transfer__head">
              <Link href={'/' + transfer.from.address}><p title={transfer.from.address}>{transfer.from.name ?? (transfer.from.address.slice(0, 8) + "...")}</p></Link>
              <div className="operationTransfersBox__transfer__head__arrow">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <Link href={'/' + transfer.to.address}><p title={transfer.to.address}>{transfer.to.name ?? (transfer.to.address.slice(0, 8) + "...")}</p></Link>
            </div>
            {/*<p>Assets :</p>*/}
            <div className="operationTransfersBox__transfer__assets">
              {transfer.assets.map((asset, j) => {
                return (
                    <p key={j}>{asset.quantity / 10**asset.asset.decimals} {asset.asset.assetType === 'nft' ? asset.asset.name : asset.asset.ticker}</p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Transaction;
