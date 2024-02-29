import React, { useState, useRef, useEffect } from "react";
import { Contract } from "@/pages/api/contract-infos";
import Link from "next/link";
import { formatToken, formatPrice, formatNumber, formatDate, formatDateShort } from "@/utils/format";
import { useRouter } from "next/router";
import { AccountIcon } from "../common/ArtifactIcon";
import { fetchCoinInfos } from "@/utils/apiClient";
import { useRates } from '@/context/RatesContext';

type Props = {
	infos: Contract,
	infos2: any,
	coinsInfos: any,
	address: string,
}

export function Coin(props: Props) {
	const { locale } = useRouter();
	const [coinInfos2, setCoinInfos2] = useState(null);
	const rates = useRates();

	const coinInfos = props.coinsInfos.find((coin) => coin.tokenAddress === props.infos2.account.address);
	useEffect(() => {
		fetchCoinInfos(props.address).then(setCoinInfos2);
	}, [props.address]);
	return (
		<div className="contract-coin shadow-box">
			<div className="contract-coin__header">
				{props.infos.image?.[0] ? <img src={props.infos.image[0]} alt={props.infos.metadata?.name} /> : <AccountIcon account={props.infos2.account} />}
				<div>
					<h1>{props.infos.tokens[0].metadata?.name ?? props.infos.metadata?.name ?? props.infos2.account.name ?? 'Token'}</h1>
					{coinInfos ? <p>{formatPrice(coinInfos.exchangeRate, locale, rates.fiats)}</p> : null}
				</div>
			</div>
			{coinInfos ?
				<div className="contract-coin__stats">
					<div>
						<h2>Volume 24h</h2>
						<p>{formatPrice(coinInfos.exchangeRate * ((coinInfos2?.volume24h ?? 0) / 10**6), locale, rates.fiats)}</p>
					</div>
					<div>
						<h2>Market Cap</h2>
						<p>{formatPrice(coinInfos.exchangeRate * (coinInfos.metadata.supply / 10**coinInfos.metadata.decimals), locale, rates.fiats)}</p>
					</div>
					<div>
						<h2>Supply</h2>
						<p>{formatNumber((coinInfos.metadata.supply / 10**coinInfos.metadata.decimals), locale)}</p>
					</div>
				</div> : null
			}
			<div className="contract-coin__main">
				<div>
					<h2>Top Holder</h2>
				</div>
				<div>
					<h2>Market price</h2>
				</div>
			</div>
		</div>
	);
}
