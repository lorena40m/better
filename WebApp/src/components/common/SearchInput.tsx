import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { fetchAddressFromDomain } from "@/utils/apiClient";
import { useTranslation } from "next-i18next";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";

type Props = {
	searchActive: any,
	setSearchActive: any
}

export function SearchInput(props: Props) {
	const { t } = useTranslation("common");
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [animError, setAnimError] = useState(false);
	const [searchHistory, setSearchHistory] = useState([]);
	const inputRef = useRef<HTMLInputElement>(null);

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

	useEffect(() => {
		if (props.searchActive && inputRef.current) {
		  inputRef.current.focus();
		}
	  }, [props.searchActive]);

	function searchEvent() {
		if (window.innerWidth < 800 && !props.searchActive) {
			props.setSearchActive(true);
		}
		else if (search && search[0]) {
			if (search.length > 6 && search.slice(-4) === ".tez") {
				fetchAddressFromDomain(search).then((data) => {
					if (data) {
						router.push(`/${encodeURIComponent(data)}`);
					} else {
						setAnimError(true);
						setTimeout(() => {
							setAnimError(false);
						}, 750);
					}
				});
			} else if (((search.substring(0, 2) === "tz" || search.substring(0, 2) === "KT") && search.length === 36) || (search.substring(0, 1) === "o" && search.length === 51)) {
				router.push(`/${encodeURIComponent(search)}`);
			} else {
				setAnimError(true);
				setTimeout(() => {
					setAnimError(false);
				}, 750);
			}
		} else {
			setAnimError(true);
			setTimeout(() => {
				setAnimError(false);
			}, 750);
		}
	}

	return (
		<div className="main-header__container__center">
			<div className={animError ? "main-header__container__center__input main-header__container__center__searchError" : "main-header__container__center__input"}>
				<input type="text" placeholder={t('Header.Search.Placeholder')}
					value={search}
					onChange={(e) => {setSearch(e.target.value)}}
					onKeyDown={(e) => {e.key === 'Enter' ? searchEvent() : null}}
					ref={inputRef}
				/>
				<div onClick={searchEvent}>
					<Image src={searchIcon} alt="search icon" />
				</div>
			</div>
		</div>
	);
}