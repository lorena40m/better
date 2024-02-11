import React, { useState, useRef, useEffect } from "react";
import { Contract } from "@/pages/api/contract-infos";
import Link from "next/link";
import { formatToken, formatPrice, formatDate, formatDateShort } from "@/utils/format";
import { useRouter } from "next/router";
import { fetchCollectionTokens } from "@/utils/apiClient";
import LoaderSvg from "@/assets/iconSvg/loader.svg";
import Image from "next/image";

type Props = {
	infos: Contract,
	infos2: any,
	miscResponse: {rates: {"EUR/USD": number}, xtzPrice: number},
}

export function Collection(props: Props) {
	const [tokens, setTokens] = useState(props.infos.tokens);
	const [nftShow, setNftShow] = useState(tokens.sort((a, b) => +a.id - +b.id)[0]);
	const { locale } = useRouter();

	let refAnim = useRef(null);
	let animIsRunning = false;
	function changeNft(nft) {
		if (animIsRunning || nft === nftShow) return;
		animIsRunning = true;
		refAnim.current.classList.add('contract-collection2__nft__infos__animate');
		setTimeout(() => {
			setNftShow(nft);
		}, 240);
		setTimeout(() => {
			refAnim.current.classList.remove('contract-collection2__nft__infos__animate');
			animIsRunning = false;
		}, 600);
	}

	const scrollNftRef = useRef(null);
	let currentFetch = false;
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		const handleScroll = () => {
			if (hasMore === false) return;
			const box = scrollNftRef.current;
			const scrollPosition = box.scrollTop;
			const boxHeight = box.clientHeight;
			const totalContentHeight = box.scrollHeight;
		
			if (scrollPosition / (totalContentHeight - boxHeight) > 0.8) {
				if (currentFetch === false) {
					currentFetch = true;
					fetchCollectionTokens(props.infos.id, 100, tokens.length, props.infos2.account.address).then((data) => {
						if (data.length === 0) {
							setHasMore(false);
						} else {
							setTokens([...tokens, ...data]);
						}
						currentFetch = false;
					});
				}
			};
		};
	
		const box = scrollNftRef.current;
		box.addEventListener('scroll', handleScroll);
		return () => box.removeEventListener('scroll', handleScroll);
	}, [tokens, hasMore]);

	return (
		<div className="contract-collection2 shadow-box" style={{ '--dynamic-background-image': props.infos.image?.map(source => `url(${source})`)?.join(',') } as any}>
			<div className="contract-collection2__infos">
				<div className="contract-collection2__infos__left">
					{props.infos.image?.[0] ? <img src={props.infos.image[0]} alt={props.infos.metadata?.name} /> : null}
					<div className="contract-collection2__infos__text">
						<h2 className="contract-collection2__infos__text__title">{props.infos.metadata?.name ?? props.infos2.account.name ?? 'Collection'}</h2>
						<p className="contract-collection2__infos__text__description">{props.infos.metadata?.description ? `Description : ${props.infos.metadata?.description}` : null}</p>
					</div>
				</div>
				<div className="contract-collection2__infos__right">
					<div className="contract-collection2__infos__right__div">
						<div>
							<p className="contract-collection2__infos__right__value">{props.infos.items}</p>
							<p>Uniques NFT</p>
						</div>
					</div>
					{props.infos.volume_24h != 0 &&
						<div className="contract-collection2__infos__right__div">
							<div>
								<p className="contract-collection2__infos__right__value">{formatToken(props.infos.volume_24h?.toString() ?? '', 6, locale)} XTZ</p>
								<p>Volume 24H</p>
							</div>
						</div>
					}
					{props.infos.creationDate &&
						<div className="contract-collection2__infos__right__div">
							<div>
								<p className="contract-collection2__infos__right__value">{formatDateShort(props.infos.creationDate, locale)}</p>
								<p>Creation date</p>
							</div>
						</div>
					}
					<div className="contract-collection2__infos__right__div">
						<div>
							<p className="contract-collection2__infos__right__value">{formatToken(props.infos.floorPrice?.toString() ?? '--', 6, locale)} XTZ</p>
							<p>Floor price</p>
						</div>
					</div>
				</div>
			</div>
			<div className="contract-collection2__nft">
				<div className="contract-collection2__nft__list" ref={scrollNftRef}>
					{
						tokens
							.sort((a, b) => +a.id - +b.id)
							.map((nft, i) => (
								<div key={nft.id} className="contract-collection2__nft__list__nft" style={nft.id === nftShow.id ? {backgroundColor: '#00000030'} : null} onClick={() => changeNft(nft)}>
									{nft.image?.[0] ? <img src={nft.image[0]} alt={nft.metadata?.name} /> : null}
									<div className="contract-collection2__nft__list__nft__text">
										<h4>{nft.metadata?.name ?? 'NFT'}</h4>
										<p>{nft.owner.name ?? (nft.owner.address ? nft.owner.address?.slice(0, 8) + "..." : `${nft.holderscount} holders`)}</p>
									</div>
								</div>
							))
					}
					{hasMore &&
						<div className="contract-collection2__nft__list__loader">
							<Image height={50} width={50} src={LoaderSvg} alt="loader icon" />
						</div>
					}
				</div>
				<div className="contract-collection2__nft__infos" ref={refAnim}>
					<div className="contract-collection2__nft__infos__text">
						<p className="contract-collection2__nft__infos__text__title">{nftShow.metadata?.name ?? 'Unnamed NFT'}</p>
						{nftShow.metadata?.description ? <p className="contract-collection2__nft__infos__text__description"><strong>Description :</strong> {nftShow.metadata?.description}</p> : null}
						<p className="contract-collection2__nft__infos__text__description"><strong>Copies :</strong> {nftShow.supply}</p>
						{nftShow.owner.address ?
							<p className="contract-collection2__nft__infos__text__description"><strong>Owner :</strong> <Link href={'/' + nftShow.owner.address} title={nftShow.owner.address}>{nftShow.owner.name ?? nftShow.owner.address?.slice(0, 8) + "..."}</Link></p> : <p>{nftShow.holderscount} holders</p>
						}
					</div>
					{nftShow.image?.[0] ? <img src={nftShow.image[0]} alt={nftShow.metadata?.name} /> : null}
				</div>
			</div>
		</div>
	);
}
