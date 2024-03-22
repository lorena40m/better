import React, { useState, useRef, useEffect } from "react";
import { Contract } from "@/pages/api/contract-infos";
import Link from "next/link";
import { formatToken, formatPrice, formatNumber, formatDate, formatDateShort } from "@/utils/format";
import { useRouter } from "next/router";
import { AccountIcon, CoinIcon } from "../common/ArtifactIcon";
import { fetchCoinInfos, fetchCoinGraph, fetchCoinHolders } from "@/utils/apiClient";
import { useRates } from '@/hooks/RatesContext';

type Props = {
	infos: Contract,
	infos2: any,
	coinsInfos: any,
	address: string,
}

export function Coin(props: Props) {
	const { locale } = useRouter();
	const [coinGraph, setCoinGraph] = useState(null);
	const [lineValues, setLineValues] = useState([0, 0, 0, 0, 0]);
	const [path, setPath] = useState("");
	const [svgMouseX, setSvgMouseX] = useState(0);
	const [topHolders, setTopHolders] = useState([]);
	const rates = useRates();

	function roundUpToSecondDecimal(number) {
		let powerOfTen = 1;
		while (number > 10) {
			number /= 10;
			powerOfTen *= 10;
		}
		while (number < 1) {
			number *= 10;
			powerOfTen /= 10;
		}
		number = Math.ceil(number * 100) / 100;

		return number * powerOfTen;
	}

	function roundDownToSecondDecimal(number) {
		let powerOfTen = 1;
		while (number >= 10) {
			number /= 10;
			powerOfTen *= 10;
		}
		while (number < 1) {
			number *= 10;
			powerOfTen /= 10;
		}
		number = Math.floor(number * 100) / 100;
		return number * powerOfTen;
	}

	function padZero(n) {
		return n < 10 ? "0" + n : n;
	}

	function getPriceBoxInfos() {
		const history = coinGraph.price.history;
		let place = Math.round(svgMouseX * history.length / 100) - 1;
		if (place < 0) {
			place = 0;
		}
		let value = null;
		try {
			value = history[place][Object.keys(history[place])[0]].c;
		} catch {}
		if (!value) {
			value = history[place - 1][Object.keys(history[place - 1])[0]].c;
		}
		const svgHeight = 540;
		const svgY = svgHeight - (value - lineValues[0]) * svgHeight / (lineValues[4] - lineValues[0]);
		let date = null;
		try {
			date = new Date(Number(Object.keys(history[place])[0]) * 1000);
		} catch {}
		if (!date) {
			date = new Date(Number(Object.keys(history[place - 1])[0]) * 1000);
		}
		const formattedDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + padZero(date.getHours()) + ":" + padZero(date.getMinutes());
		const ret = {
			y: svgY,
			value: value,
			date: formattedDate
		}
		return (ret);
	}

	function createPath(data) {
		if (!data) { return; }
		let minValue = Number(data[0][Object.keys(data[0])[0]].c);
		let maxValue = minValue;
		for (let i = 0; i < data.length; i++) {
			if (Number(data[i][Object.keys(data[i])[0]].c) > maxValue) {
				maxValue = Number(data[i][Object.keys(data[i])[0]].c);
			} else if (Number(data[i][Object.keys(data[i])[0]].c) < minValue) {
				minValue = Number(data[i][Object.keys(data[i])[0]].c);
			}
		}
		const diff = Number(maxValue - minValue) / 4;
		maxValue = Number(maxValue) + diff;
		minValue = Number(minValue) - diff;
		maxValue = roundUpToSecondDecimal(maxValue);
		minValue = roundDownToSecondDecimal(minValue);
		setLineValues([minValue, parseFloat((minValue + (maxValue - minValue) / 4).toPrecision(4)), parseFloat((minValue + (maxValue - minValue) / 2).toPrecision(4)), parseFloat((minValue + (maxValue - minValue) / 4 * 3).toPrecision(4)), maxValue]);

		const svgWidth = 900;
		const svgHeight = 540;
		const svgXStart = 100;
		const svgWidthInterval = svgWidth / (data.length);
		let newPath = `M ${svgXStart} ${svgHeight * (maxValue - Number(data[0][Object.keys(data[0])[0]].c)) / (maxValue - minValue)}`;
		for (let i = 0; i < data.length; i++) {
			newPath += `L ${svgWidthInterval * (i + 1) + svgXStart} ${svgHeight * (maxValue - Number(data[i][Object.keys(data[i])[0]].c)) / (maxValue - minValue)}`;
		}
		setPath(newPath);
	}

	const handleMouseMove = (event) => {
		const mouseX = event.clientX;
		const svgRect = event.currentTarget.getBoundingClientRect();
		const xRelativeToSvg = mouseX - svgRect.left;
		const svgViewBox = event.currentTarget.viewBox.baseVal;
		const xInSvgUnits = (xRelativeToSvg / svgRect.width) * svgViewBox.width;
		const adjustedX = ((xInSvgUnits - 100) / (1000 - 100)) * 100;
		const clampedX = Math.min(Math.max(adjustedX, 0), 100);
		if (clampedX === 0) { return; }
		setSvgMouseX(clampedX);
		getPriceBoxInfos();
	};

	const coinInfos = props.coinsInfos?.find((coin) => coin.contract === props.infos2.account.address);
	useEffect(() => {
		fetchCoinGraph(props.infos.tokens[0].metadata.symbol).then((data) => {
			setCoinGraph(data[0]);
			if (!data || !data[0]) { return; }
			createPath(data[0].price.history);
		});
		fetchCoinHolders(props.infos.tokens[0].tzkt_id).then((data) => {
			setTopHolders(data);
		})
	}, [props.address]);
	return (
		<div className="contract-coin shadow-box">
			<div className="contract-coin__header">
				{
					props.infos.image ?
					<CoinIcon coin={{
						id: props.infos.id,
						ticker: props.infos.metadata?.symbol,
						image: props.infos.image
					}} />
					:
					<AccountIcon account={props.infos2.account} />
				}
				<div>
					<h1>{props.infos.tokens[0].metadata?.name ?? props.infos.metadata?.name ?? props.infos2.account.name ?? 'Token'}</h1>
					{coinInfos ? <p>{formatPrice(coinInfos.price.value, locale, rates?.fiats)}</p> : null}
				</div>
			</div>
			{coinInfos ?
				<div className="contract-coin__stats">
					<div>
						<h2>Volume 24h</h2>
						<p>{coinGraph?.volume ? formatPrice(Number(coinGraph.volume.value24H), locale, rates?.fiats) : "???"}</p>
					</div>
					<div>
						<h2>Market Cap</h2>
						<p>{formatPrice(coinInfos.price.value * (Number(props.infos.tokens[0].supply) / 10**props.infos.tokens[0].metadata.decimals), locale, rates?.fiats)}</p>
					</div>
					<div>
						<h2>Supply</h2>
						<p>{formatNumber((Number(props.infos.tokens[0].supply) / 10**props.infos.tokens[0].metadata.decimals), locale)}</p>
					</div>
				</div> : null
			}
			{coinGraph ?
				<div className="contract-coin__main">
					<div>
						<h2>Top Holder</h2>
						{topHolders.map((holder, i) => {
							return (
								<Link href={'/' + holder.account.address} title={holder.account.address} key={i} className="contract-coin__main__holder">
									<p>{holder.account.name ?? holder.account.address.slice(0, 8) + "..." }</p>
									<div>
										<p>{formatNumber((holder.balance / 10**props.infos.tokens[0].metadata.decimals), locale)}</p>
									</div>
								</Link>
							)
						})}
					</div>
					<div>
						<h2>Market price</h2>
						<svg viewBox="0 0 1000 600" onMouseMove={(e) => { handleMouseMove(e) }}>
							<line x1="100" y1="540" x2="1000" y2="540" stroke="#19283b" strokeWidth="3"/>
							<line x1="100" y1="0" x2="100" y2="540" stroke="#19283b" strokeWidth="3"/>

							<line x1="100" y1="150" x2="1000" y2="150" stroke="#19283bB0" strokeWidth="1"/>
							<line x1="100" y1="280" x2="1000" y2="280" stroke="#19283bB0" strokeWidth="1"/>
							<line x1="100" y1="410" x2="1000" y2="410" stroke="#19283bB0" strokeWidth="1"/>

							<text x="90" y="150" fill="#19283b" textAnchor="end" dominantBaseline="middle" fontSize={26}>{formatPrice(lineValues[3], locale, rates?.fiats)}</text>
							<text x="90" y="280" fill="#19283b" textAnchor="end" dominantBaseline="middle" fontSize={26}>{formatPrice(lineValues[2], locale, rates?.fiats)}</text>
							<text x="90" y="410" fill="#19283b" textAnchor="end" dominantBaseline="middle" fontSize={26}>{formatPrice(lineValues[1], locale, rates?.fiats)}</text>
							<text x="90" y="540" fill="#19283b" textAnchor="end" dominantBaseline="middle" fontSize={26}>{formatPrice(lineValues[0], locale, rates?.fiats)}</text>

							<line x1={100 + 900 / 100 * svgMouseX} y1="0" x2={100 + 900 / 100 * svgMouseX} y2="540" stroke="#19283bAA" stroke-width="4" stroke-dasharray="5" />
							<path
								d={path}
								stroke="#19283b"
								strokeWidth="2"
								fill="none"
							/>

							{
								<>
									<circle cx={100 + 900 / 100 * svgMouseX} cy={getPriceBoxInfos().y} r="8" fill="#19283b" />
									<rect
										x={110 + 900 / 100 * svgMouseX - (svgMouseX > 50 ? 220 : 0)}
										rx="10"
										y={getPriceBoxInfos().y - 50}
										width="200"
										height="100"
										fill="white"
										style={{ filter: "drop-shadow( 0px 0px 5px rgba(0, 0, 0, .5))" }}
									/>
									<text x={170 + 900 / 100 * svgMouseX - (svgMouseX > 50 ? 220 : 0)} y={getPriceBoxInfos().y + 20} fill="#19283b" textAnchor="right" dominantBaseline="middle" fontSize={52} fontWeight={700}>{formatPrice(getPriceBoxInfos().value, locale, rates?.fiats)}</text>
									<text x={120 + 900 / 100 * svgMouseX - (svgMouseX > 50 ? 220 : 0)} y={getPriceBoxInfos().y - 30} fill="#19283b" textAnchor="left" dominantBaseline="middle" fontSize={26}>{getPriceBoxInfos().date}</text>
								</>
							}
						</svg>
					</div>
				</div> : null
			}
		</div>
	);
}
