import React from "react";
import Header from "../Header";

type Props = {
	title: string,
	children: any
}

export function Page(props: Props) {
	return (
		<>
			<Header hideSearch={true} />
			<main className="pageComponent">
				<div className="pageComponent__center">
					<div>
						<h1>{props.title}</h1>
					</div>
					{props.children}
				</div>
			</main>
		</>
	);
}