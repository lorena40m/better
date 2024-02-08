import React, { useState, useEffect } from "react";
import Image from "next/image";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";
import LogoIcon from "../../assets/images/icon-logo.svg";
import Logo from "../../assets/images/logo.svg";
import { useRouter } from "next/router";
import Link from "next/link";
import Select from "@/components/common/Select";
import { useTranslation } from "next-i18next";
import { fetchAddressFromDomain } from "@/utils/apiClient";
import { SearchInput } from "../common/SearchInput";

type Props = {
  hideSearch: boolean
}

export default function Header({ hideSearch }: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState(router.locale);
  const [searchActive, setSearchActive] = useState(false);

  const onToggleLanguageClick = (newLocale: any) => {
    const { pathname, query } = router;
    router.push({ pathname, query }, router.asPath, { locale: newLocale });
  };
  const changeTo = router.locale === "en" ? "fr" : "en";

  return (
    <header className="main-header">
      <div className={"main-header__container " + (searchActive ? "main-header__container__search-active" : "")}>
        <div className="main-header__container__black-overlay" onClick={() => {setSearchActive(false)}}></div>
        <div className="main-header__container__left">
          <Link href="/" className="main-header__container__left__link" title="Home">
            <Image
              priority
              src={LogoIcon}
              height={36}
              width={36}
              alt="LogoIcon"
              style={{marginRight: "10px"}}
              className="main-header__container__left__link__litlelogo"
            />
            <Image
              priority
              src={Logo}
              height={35}
              width={150}
              alt="Logo"
              className="main-header__container__left__biglogo"
            />
          </Link>
        </div>
        {hideSearch && <SearchInput searchActive={searchActive} setSearchActive={setSearchActive} />}
        <div className="main-header__container__right">
          <Select
            onChange={value => {onToggleLanguageClick(changeTo); setLanguage(value)}}
            values={['en', 'fr']}
            labels={['🇺🇸 English', '🇫🇷 Français']}
            defaultValue={language}
          />
        </div>
      </div>
    </header>
  );
}
