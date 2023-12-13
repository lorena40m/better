import React, { useState } from "react";
import Image from "next/image";
import searchIcon from "../../assets/iconSvg/searchIconBlack.svg";
import LogoIcon from "../../assets/images/icon-logo.svg";
import Logo from "../../assets/images/logo.svg";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState(router.locale);

  const onToggleLanguageClick = (newLocale: any) => {
    const { pathname, query } = router;
    router.push({ pathname, query }, router.asPath, { locale: newLocale });
  };
  const changeTo = router.locale === "en" ? "fr" : "en";

  function searchEvent() {
    if (search && search[0]) {
      router.push(`/${encodeURIComponent(search)}`);
    }
  } 
  return (
    <header className="main-header">
      <div className="main-header__container">
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
            />
          </Link>
        </div>
        <div className="main-header__container__center">
          <div className="main-header__container__center__input">
            <input type="text" value={search} onChange={(e) => {setSearch(e.target.value)}} onKeyDown={(e) => {e.key === 'Enter' ? searchEvent() : null}} />
            <div onClick={searchEvent}>
              <Image src={searchIcon} alt="search icon" />
            </div>
          </div>
        </div>
        <div className="main-header__container__right">
          <select name="" id="" value={language} onChange={(e) => {onToggleLanguageClick(changeTo); setLanguage(e.target.value)}}>
            <option value="en">🇺🇸 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>
    </header>
  );
}
