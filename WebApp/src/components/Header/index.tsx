import React, { useState } from "react";
import Image from "next/image";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";
import LogoIcon from "../../assets/images/icon-logo.svg";
import Logo from "../../assets/images/logo.svg";
import { useRouter } from "next/router";
import Link from "next/link";
import Select from "@/components/common/Select";
import { useTranslation } from "next-i18next";

type Props = {
  hideSearch: boolean
}

export default function Header({ hideSearch }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState(router.locale);
  const [searchActive, setSearchActive] = useState(false);

  const onToggleLanguageClick = (newLocale: any) => {
    const { pathname, query } = router;
    router.push({ pathname, query }, router.asPath, { locale: newLocale });
  };
  const changeTo = router.locale === "en" ? "fr" : "en";

  function searchEvent() {
    if (window.innerWidth < 800 && !searchActive) {
      setSearchActive(true);
    }
    else if (search && search[0]) {
      router.push(`/${encodeURIComponent(search)}`);
    }
  } 

  return (
    <header className="main-header">
      <div className={"main-header__container " + (searchActive ? "main-header__container__search-active" : "")}>
        <div className="main-header__container__black-overlay" onClick={() => {setSearchActive(false)}}></div>
        <div className="main-header__container__left">
          <Link href="/" style={{display: "flex"}}>
            <Image
              priority
              src={LogoIcon}
              height={36}
              width={36}
              alt="LogoIcon"
              style={{marginRight: "10px"}}
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
        {hideSearch && <div className="main-header__container__center">
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
        </div>}
        <div className="main-header__container__right">
          <Select
            onChange={(e) => {onToggleLanguageClick(changeTo); setLanguage(e.target.value)}}
            values={['en', 'fr']}
            labels={['🇺🇸 English', '🇫🇷 Français']}
          />
        </div>
      </div>
    </header>
  );
}
