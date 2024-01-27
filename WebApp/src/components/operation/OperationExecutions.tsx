import { OperationBatch } from "@/pages/api/_apiTypes";
import { formatNumber } from "@/utils/format";
import { useRouter } from "next/router";
import Link from "next/link";


type Props = {
	operation: OperationBatch,
}

export function OperationExecutions(props: Props) {
	const { locale } = useRouter();
	return (
		<div className="operationExecutionsBox box">
			<h2>Executions Order</h2>
			<div>
				<p className="operationExecutionsBox__gridItem1 operationExecutionsBox__title">n°</p>
				<p className="operationExecutionsBox__gridItem2 operationExecutionsBox__title">from</p>
				<p className="operationExecutionsBox__gridItem3 operationExecutionsBox__title">to</p>
				<p className="operationExecutionsBox__gridItem4 operationExecutionsBox__title">executions</p>
				{props.operation?.operationGroupList?.map((operationGroup, i) => {
					return (
						operationGroup.operationList?.map((operation, j) => {
							return (
								<>
									<p className="operationExecutionsBox__gridItem1">{j === 0 ? (i + 1).toString() : ""}</p>
									<p className="operationExecutionsBox__gridItem2 operationExecutionsBox__link" title={operation.from.address}><Link href={'/' + operation.from.address}>{operation.from.name ?? operation.from.address.slice(0, 8) + "..."}</Link></p>
									<p className="operationExecutionsBox__gridItem3 operationExecutionsBox__link" title={operation.to.address}><Link href={'/' + operation.to.address}>{operation.to.name ?? operation.to.address.slice(0, 8) + "..."}</Link></p>
									<p className="operationExecutionsBox__gridItem4">{(operation.entrypoint !== 'transfer' && operation.entrypoint !== null) ? `Call ${operation.entrypoint}` :
										(operation.assets.every(asset => asset?.asset.name === operation.assets[0].asset.name) ?
											`Transfer ${formatNumber(+operation.assets.reduce((total, asset) => { return (total + +asset.quantity / 10**+asset.asset.decimals) }, 0), locale)} ${operation.assets[0].asset.assetType === 'nft' ? operation.assets[0].asset.name : operation.assets[0].asset.ticker}` :
											`${operation.assets.length} transfers of differents tokens`
										)}
									</p>
								</>
							);
						})
					);
				})}
			</div>
		</div>
	);
}