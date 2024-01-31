import Image from "next/image";
import CopyPastIcon from "@/assets/iconSvg/copyPastIcon.svg";
import toast, { Toaster } from 'react-hot-toast';

type Props = {
	hash: string,
}

export function CopyHashButton(props: Props) {
	function copy(text) {
		navigator.clipboard.writeText(text);
		toast.success('Copied to clipboard', {
			duration: 2000,
		});
	};
	
	return (
	<>
		<Toaster/>
		<div className="copyHashButton" title={props.hash} onClick={() => {copy(props.hash)}}>
			<p>{props.hash.slice(0, 8)}...</p>
			<Image src={CopyPastIcon} alt="copy past icon"/>
		</div>
	</>
	);
}