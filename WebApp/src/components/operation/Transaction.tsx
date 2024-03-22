import React, { useEffect, useState } from "react";
import { OperationBatch } from "@/backend/apiTypes";
import { appWithTranslation, useTranslation } from "next-i18next";
import Link from "next/link";
import { AccountIcon, CoinIcon, NftIcon } from '@/components/common/ArtifactIcon'
import { formatNumber } from "@/utils/format";
import { useRouter } from "next/router";

type Props = {
	operation: OperationBatch,
}

const Transaction = (props: Props) => {
  const [openList, setOpenList] = useState(true);
  const { t } = useTranslation("common");
  const [transfers, setTransfers] = useState([]);
  const { locale } = useRouter();

  const newTransfers = [];

  function pushInTransfer(assetTransfer) {
    for (let i = 0; i < newTransfers.length; i++) {
      const transfer = newTransfers[i];
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
    newTransfers.push({
      from: assetTransfer.from,
      to: assetTransfer.to,
      assets: [{
        quantity: +assetTransfer.quantity,
        asset: assetTransfer.asset
      }]
    });
  };

  useEffect(() => {
    props.operation?.operationGroupList?.map((operationGroup) => {
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
    });
  
    setTransfers(newTransfers);
  }, [props.operation]);

  return (
    (transfers.length > 0 ? <div className="operationTransfersBox box shadow-box">
      <h2>Transfers</h2>
      {}
      {transfers.map((transfer, i) => {
        return (
          <div key={i} className="operationTransfersBox__transfer">
            <div className="operationTransfersBox__transfer__head">
              <Link href={'/' + transfer.from.address}>
                <div className="operationTransfersBox__transfer__head__user">
                  <AccountIcon account={transfer.from} />
                  <p title={transfer.from.address}>{transfer.from.name ?? (transfer.from.address.slice(0, 8) + "...")}</p>
                </div>
              </Link>
              <div className="operationTransfersBox__transfer__head__arrow">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <Link href={'/' + transfer.to.address}>
                <div className="operationTransfersBox__transfer__head__user">
                  <AccountIcon account={transfer.to} />
                  <p title={transfer.to.address}>{transfer.to.name ?? (transfer.to.address.slice(0, 8) + "...")}</p>
                </div>
              </Link>
            </div>
            {/*<p>Assets :</p>*/}
            <div className="operationTransfersBox__transfer__assets">
              {transfer.assets.map((asset, j) => {
                if (asset.asset.id === 'tezos') { return (
                  <div className="operationTransfersBox__transfer__assets__div" key={j}>
                    <p>
                      {formatNumber(asset.quantity / 10**asset.asset.decimals, locale)} {asset.asset.assetType === 'nft' ? asset.asset.name : asset.asset.ticker}
                    </p>
                    {asset.asset.image ?
                      <div className="operationTransfersBox__transfer__assets__imageBox">
                        {asset.asset.assetType === 'coin' ?
                          <CoinIcon coin={asset.asset} />
                          :
                          <NftIcon nft={asset.asset} className="ArtifactIcon" />
                        }
                      </div> : null
                    }
                  </div>
                )};
                return (
                  <>
                    <Link href={asset.asset.id.replace("_", "#")} key={j}>
                      <div className="operationTransfersBox__transfer__assets__div">
                        <p>
                          {formatNumber(asset.quantity / 10**asset.asset.decimals, locale)} {asset.asset.assetType === 'nft' ? asset.asset.name : asset.asset.ticker}
                        </p>
                        {asset.asset.image ?
                          <div className="operationTransfersBox__transfer__assets__imageBox">
                            {asset.asset.assetType === 'coin' ?
                              <CoinIcon coin={asset.asset} />
                              :
                              <NftIcon nft={asset.asset} className="ArtifactIcon" />
                            }
                          </div> : null
                        }
                      </div>
                    </Link>
                  </>
                );
              })}
            </div>
          </div>
        );
      })}
    </div> : null)
  );
};

export default Transaction;
