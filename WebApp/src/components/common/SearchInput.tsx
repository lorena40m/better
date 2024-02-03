import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { fetchAddressFromDomain } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";

type Props = {
}

export function SearchInput(props: Props) {
	const { t } = useTranslation("common");
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [searchActive, setSearchActive] = useState(false);
	const [searchHistory, setSearchHistory] = useState([]);

	useEffect(() => {
		let encodedStoredHistory = localStorage.getItem("searchHistory");
		let storedHistory: string[] = encodedStoredHistory ? JSON.parse(encodedStoredHistory) : [];
		if (!storedHistory.includes(router.query.id as string)) {
			if (storedHistory.length >= 10) {
				storedHistory.pop();
			}
			if (router.query.id) {
				storedHistory.unshift(router.query.id as string);
			}
		} else {
			const index = storedHistory.indexOf(router.query.id as string);
			storedHistory.splice(index, 1);
			storedHistory.unshift(router.query.id as string);
		}
		localStorage.setItem("searchHistory", JSON.stringify(storedHistory));
		setSearchHistory(storedHistory);
	}, [router.query.id]);

	function searchEvent() {
		if (window.innerWidth < 800 && !searchActive) {
			setSearchActive(true);
		}
		else if (search && search[0]) {
			if (search.length > 6 && search.slice(-4) === ".tez") {
				fetchAddressFromDomain(search).then((data) => {
					if (data) {
						router.push(`/${encodeURIComponent(data)}`);
					}
				});
			} else {
				router.push(`/${encodeURIComponent(search)}`);
			}
		}
	}

	return (
		<div className="main-header__container__center">
			<div className="main-header__container__center__input">
				<input type="text" placeholder={t('Header.Search.Placeholder')}
				value={search}
				onChange={(e) => {setSearch(e.target.value)}}
				onKeyDown={(e) => {e.key === 'Enter' ? searchEvent() : null}}
				/>
				<div onClick={searchEvent}>
					<Image src={searchIcon} alt="search icon" />
				</div>
			</div>
		</div>
	);
}