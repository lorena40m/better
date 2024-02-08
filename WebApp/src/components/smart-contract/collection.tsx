import React, { useState } from "react";
import { Contract } from "@/pages/api/contract-infos";

type Props = {
	infos: Contract
}

export function Collection(props: Props) {
	return (
		<div className="contract-collection shadow-box">
			<div className="contract-collection__infos">
				{props.infos.metadata?.image ? <img src={props.infos.metadata?.image} alt={props.infos.metadata?.name} /> : null}
				<div className="contract-collection__infos__text">
					<h2 className="contract-collection__infos__text__title">{props.infos.metadata?.name ?? 'Collection'}</h2>
					<p className="contract-collection__infos__text__description">{props.infos.metadata?.description ?? null}</p>
					<p className="contract-collection__infos__text__stat">Number of NFTs : {props.infos.tokens.length}</p>
				</div>
			</div>
			<div className="contract-collection__nft shadow-box">
				<h3>NFT list</h3>
				<div className="contract-collection__nft__list">
					{
						props.infos.tokens
							.sort((a, b) => +a.id - +b.id)
							.map((nft, i) => (
								<div key={i} className="contract-collection__nft__list__nft">
									{null !== nft.image?.[0] ? <img src={nft.image[0]} alt={nft.metadata?.name} /> : null}
									<div className="contract-collection__nft__list__nft__text">
										<h4>{nft.metadata?.name ?? 'NFT'}</h4>
										<p>{nft.owner.name ?? nft.owner.address.slice(0, 8) + "..."}</p>
									</div>
								</div>
							))
					}
				</div>
			</div>
		</div>
	);
}
