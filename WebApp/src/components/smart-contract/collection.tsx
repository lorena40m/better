import React, { useState, useRef, useEffect } from "react";
import { Contract } from "@/pages/api/contract-infos";
import Link from "next/link";
import { formatToken } from "@/utils/format";
import { useRouter } from "next/router";
import { fetchCollectionTokens } from "@/utils/apiClient";

type Props = {
	infos: Contract,
	infos2: any,
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

	useEffect(() => {
		const handleScroll = () => {
		  const box = scrollNftRef.current;
		  const scrollPosition = box.scrollTop;
		  const boxHeight = box.clientHeight;
		  const totalContentHeight = box.scrollHeight;
	
		  if (scrollPosition / (totalContentHeight - boxHeight) > 0.8) {
			if (!currentFetch) {
				currentFetch = true;
				fetchCollectionTokens(props.infos.id, 100, tokens.length, props.infos2.account.address).then((data) => {
					setTokens([...tokens, ...data]);
					currentFetch = false;
				});
			}
		  };
		};
	
		const box = scrollNftRef.current;
		box.addEventListener('scroll', handleScroll);
		return () => box.removeEventListener('scroll', handleScroll);
	  }, [tokens]);

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
					<div>
						<p className="contract-collection2__infos__right__value">2.6M XTZ</p>
						<p>Total Value</p>
					</div>
					<div>
						<p className="contract-collection2__infos__right__value">{tokens.length}</p>
						<p>Number of NFT</p>
					</div>
					<div>
						<p className="contract-collection2__infos__right__value">60.7 XTZ</p>
						<p>Average price</p>
					</div>
					<div>
						<p className="contract-collection2__infos__right__value">{formatToken(props.infos.floorPrice?.toString(), 6, locale)} XTZ</p>
						<p>Floor price</p>
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
				</div>
				<div className="contract-collection2__nft__infos" ref={refAnim}>
					<div className="contract-collection2__nft__infos__text">
						<p className="contract-collection2__nft__infos__text__title">{nftShow.metadata?.name ?? 'Unnamed NFT'}</p>
						<p>Copies : {nftShow.supply}</p>
						{nftShow.owner.address ?
							<p>Owner : <Link href={'/' + nftShow.owner.address} title={nftShow.owner.address}>{nftShow.owner.name ?? nftShow.owner.address?.slice(0, 8) + "..."}</Link></p> : <p>{nftShow.holderscount} holders</p>
						}
						<p>Last sale : 0 XTZ</p>
					</div>
					{nftShow.image?.[0] ? <img src={nftShow.image[0]} alt={nftShow.metadata?.name} /> : null}
				</div>
			</div>
		</div>
	);
}
