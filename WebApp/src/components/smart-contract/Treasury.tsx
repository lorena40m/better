import React, { useState } from "react";
import { Infos } from "@/pages/api/user-infos";
import { useRouter } from "next/router";
import { formatPrice } from "@/utils/format";
import CoinBox from "../wallet/CoinBox";
import { CoinIcon } from "../common/ArtifactIcon";
import { formatTokenWithExactAllDecimals, formatToken } from "@/utils/format";
import Link from "next/link";
import { AccountTokens } from '@/pages/api/account-tokens'
import Carousel from "../Carousel/Carousel";
import NftSlide from "@/components/Carousel/NftSlide";
import { useRates } from '@/hooks/RatesContext'

type Props = {
	tokens: AccountTokens,
	infos: Infos,
	coinsInfos: any
}

export function Treasury(props: Props) {
	const { locale } = useRouter();
	const [open, setOpen] = useState(false);
	const [coinsSelected, setCoinsSelected] = useState(true);
  const rates = useRates()

	return (
		<div className="box treasuryBox shadow-box">
			<div className="treasuryBox__head" onClick={() => {setOpen(!open)}}>
				<h2>Treasury</h2>
				<div>
					<p>{rates && formatPrice(((+props.infos.balance / 10**6) * rates.cryptos.XTZ + props.tokens.coins.reduce((total, coin) => total + ((props.coinsInfos?.find((coinInfos) => coinInfos.tokenAddress === coin.Address)?.exchangeRate ?? 0) * (+coin.quantity / 10**coin.asset.decimals)), 0)), locale, rates.fiats)}</p>
					<div className={open ? "treasuryBox__head__arrow treasuryBox__head__arrow__open" : "treasuryBox__head__arrow"}>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
			<div className={open ? "treasuryBox__body treasuryBox__body__open" : "treasuryBox__body"}>
				<div className="treasuryBox__body__selector">
					<div className="treasuryBox__body__selector__both">
						<h3 className={coinsSelected ? "treasuryBox__body__selector__both__selected" : "treasuryBox__body__selector__both__notselected"} onClick={() => {setCoinsSelected(true)}}>Coins</h3>
						<h3 className={!coinsSelected ? "treasuryBox__body__selector__both__selected" : "treasuryBox__body__selector__both__notselected"} onClick={() => {setCoinsSelected(false)}}>NFTs</h3>
					</div>
				</div>
				{
					coinsSelected ?
					<div className="coinBox__coin-container">
          {[{
              "TokenId": null,
              "ContractId": null,
              "Address": 'tezos',
              "asset": {
                "id": 'tezos',
                "image": null,
                "name": "Tezos",
                "ticker": "XTZ",
                "decimals": 6,
                "assetType": 'coin' as 'coin'
              },
              "quantity": props.infos.balance.toString()
            }].concat(props.tokens.coins).map((coin) => {
            let coinValue
            if (coin.asset.id === 'tezos') {
              coinValue = rates?.cryptos.XTZ ?? 0;
            } else {
              const coinInfos = props.coinsInfos?.find(coinInfos => coinInfos.tokenAddress === coin.Address);
              coinValue = coinInfos?.exchangeRate ?? 0;
            }
            return (
              <div key={coin.TokenId} className="coinBox__coin"
                style={coin.asset.image?.length ? {order: "1"} : {order: "1"}}
              >
                <div className="coinBox__coin__left">
                  {coin.asset.id === 'tezos' ?
                    <CoinIcon coin={{ image: coin.asset.image, ticker: coin.asset.ticker, id: coin.Address }} />
                    :
                    <Link href={'/' + coin.asset.id}>
                      <CoinIcon coin={{ image: coin.asset.image, ticker: coin.asset.ticker, id: coin.Address }} />
                    </Link>
                  }
                  <div>
                    <p className="coinBox__coin__left__title" title={
                      coin.asset.name + '\n' +
                      formatTokenWithExactAllDecimals(coin.quantity, Number(coin.asset.decimals), locale) + ' ' + coin.asset.ticker
                    }>
                      {formatToken(coin.quantity, Number(coin.asset.decimals), locale)}
                      {coin.Address === 'tezos' ?
                        <strong className="ticker">{coin.asset.ticker}</strong>
                        :
                        <Link href={'/' + coin.Address}>
                          <strong className="ticker hoverItem">{coin.asset.ticker}</strong>
                        </Link>
                      }
                    </p>
                  </div>
                </div>
                <div className="coinBox__coin__right"
                  title={formatPrice(coinValue, locale, rates?.fiats) + '/' + coin.asset.ticker}>
                  <p>{formatPrice(+coin.quantity / 10**coin.asset.decimals * coinValue, locale, rates?.fiats)}</p>
                </div>
              </div>
            );
          })}
        </div> : <p>{props.tokens.nfts.length ?
          <Carousel Slide={NftSlide} items={props.tokens.nfts} breakpoints={{
            100: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            900: { slidesPerView: 2 },
            1400: { slidesPerView: 2 },
          }} delay={4000} /> : "Pas de nft sur ce contrat"}</p>
				}
			</div>
		</div>
	);
}
